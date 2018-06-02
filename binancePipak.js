"use strict";


// instanciranje klijenta prema binanceu
const binance = require('node-binance-api');

// koliko dubok orderbook želimo održavati
const dubinaKnjige = 3;

// manualno odobreni parovi za trejdanje
const memorija = require('./memorija.js');
const whitelista = memorija.whitelista;

// instanciranje klijenta prema mongu
const MongoClient = require('mongodb').MongoClient;
const dbName = 'botZ1';
const url = 'mongodb://localhost:27017/' + dbName;

const baseQuote = require('./alatke.js').baseQuote;


/**
 * Funkcija za srezavanje predubokog orderbooka
 * @param {object} knjiga - orderbook, ali samo jedna strana (bid ili ask)
 * @param {string} smjer - opcija: bidovi ili askovi (desc ili asc sort)
 */
function srezatiKnjigu(knjiga, smjer) {
    let sortAsc = (a, b) => {return (Number(a) - Number(b))};
    let sortDesc = (a, b) => {return (Number(b) - Number(a))};
    let keyevi;
    if (smjer === 'askovi') {
        keyevi = Object.keys(knjiga)
            .sort(sortAsc)
            .slice(0, dubinaKnjige);
    } else if (smjer === 'bidovi') {
        keyevi = Object.keys(knjiga)
            .sort(sortDesc)
            .slice(0, dubinaKnjige);
    } else throw new Error('Smjer nije dobar');
    let srezana = {};
    keyevi.forEach(key => srezana[key] = knjiga[key]);
    return srezana;
}

/**
 * Funkcija za napipavanje potrebne dubine za izvršiti order (iznos)
 * @param {object} knjiga - orderbook, ali samo jedna strana (bid ili ask)
 * @param {number} iznos - base iznos koji želimo likvidirati
 * @returns {object} vraća napipano objekt
 */
function napipajDubinu(knjiga, iznos) {
    let keyevi = Object.keys(knjiga);
    let napipano = {
        zbroj: 0,
        umnozak: 0,
    };
    let i = 0;
    let ovajIznos = knjiga[keyevi[i]];
    let preostaloZaNapipati = iznos - napipano.zbroj;
    while (napipano.zbroj < iznos) {
        if (ovajIznos < preostaloZaNapipati) {
            napipano[keyevi[i]] = ovajIznos;
            napipano.zbroj += ovajIznos;
        } else if (ovajIznos > preostaloZaNapipati) {
            napipano[keyevi[i]] = preostaloZaNapipati;
            napipano.zbroj += preostaloZaNapipati;
            return izracunajUmnozak(napipano);
        }
        i++
        if (i >= keyevi.length) {
            throw new Error('Preplitak orderbook. Povečati globalnu dubinaKnjige varijablu ili smanjiti iznos za napipavanje.');
        }
    }
    // ako propadne kroz while na neku šemu, bacamo error
    throw new Error('Nešto čudno u napipajDubinu().');
}

/**
 * Sub-funkcijica za izračunati umnožak i avg cijenu objekta napipano
 * @param {object} napipano - poludovršeni napipano objekt poslan iz napipajDubinu()
 * @returns {object} vraća dovršeni napipano objekt
 */
function izracunajUmnozak(napipano) {
    let cijene = Object.keys(napipano).filter(cijena => (cijena != 'zbroj') && (cijena != 'umnozak'));
    for (let i = 0; i < cijene.length; i++) {
        let razinaCijene = Number(cijene[i]);
        let iznosNaRazini = napipano[cijene[i]];
        let omjer = iznosNaRazini / napipano.zbroj;
        napipano.umnozak += iznosNaRazini * razinaCijene;
        napipano.avgCijena += razinaCijene * omjer;
    }
    return napipano;
}


// reformirati ili izbrisati
function printajTikere() {
    console.clear();
    for (let i in memorija.tikeri) {
        let mem = memorija.tikeri[i];
        console.log();
        console.log(i);
        console.log('askovi qnt zbroj: ' + mem.askoviZbroj.toFixed(5) + ' ' + baseQuote(i).base);
        
        let cijeneAskovi = Object.keys(memorija.tikeri[i].askovi);
        let cijeneBidovi = Object.keys(memorija.tikeri[i].bidovi);
        let bestBid = Math.max(...cijeneBidovi);
        let bestAsk = Math.min(...cijeneAskovi);
        let spread = bestAsk - bestBid;
        for (let jo = 1; jo <= cijeneAskovi.length; jo++) {
            let oj = cijeneAskovi.length - jo;
            console.log(cijeneAskovi[oj] + ' ' + mem.askovi[cijeneAskovi[oj]]);
        }
        console.log(' spread: ' + spread.toFixed(8) + ' ' + baseQuote(i).quote);

        for (let j in memorija.tikeri[i].bidovi) {
            console.log(j + ' ' + memorija.tikeri[i].bidovi[j]);
        }
        console.log('bidovi qnt zbroj: ' + memorija.tikeri[i].bidoviZbroj.toFixed(5) + ' ' + baseQuote(i).base);
    }
}
/*
setInterval(() => {
    printajTikere();
}, 500);
*/


/**
 * Glavni feed za sve tikere u memoriji
 */
function pokreniDeepTikerFeed() {
    binance.websockets.depthCache(whitelista, (symbol, depth) => {
        let asks = binance.sortAsks(depth.asks);
        let bids = binance.sortBids(depth.bids);
        let askovi = srezatiKnjigu(asks, 'askovi');
        let bidovi = srezatiKnjigu(bids, 'bidovi');
        memorija.tikeri[symbol] = {
            askovi: askovi,
            bidovi: bidovi,
        }
        evaluirajStanje(symbol);
    });
}

/**
 * Funkcija za izvršavanje kalkulacija pri svakom dolasku tikera
 * @param {string} symbol - valuta koju treba evaluirati prema zadnjem tikeru
 */
function evaluirajStanje(symbol) {
    if (symbol === 'ETHBTC') {
        whitelista.forEach(par => { if (par !== 'ETHBTC') evaluirajStanje(par) });
    } else {
        let base = baseQuote(symbol).base;
        let quote = baseQuote(symbol).quote;
        let trio = {
            a: 'ETHBTC',
            b: symbol,
            c: '',
        }
        if (quote === 'BTC') {
            trio.c = base + 'ETH';
        } else if (quote === 'ETH') {
            trio.c = base + 'BTC';
        }
        provjeriArbitražniTrokut(trio);
    }
}

/**
 * Dohvaćanje svih simbola (parova) i podataka min order iznos i sl.
 */
function dohvatiExchInfo() {
    // c/p sa node-binance-api readme-a
    // čupamo minimalne Qnt
    //minQty = minimum order quantity
    //minNotional = minimum order value (price * quantity)
    binance.exchangeInfo(function(error, data) {
        for ( let obj of data.symbols ) {
            if (!whitelista.includes(obj.symbol)) continue;
            let filters = {status: obj.status};
            for ( let filter of obj.filters ) {
                if ( filter.filterType == "MIN_NOTIONAL" ) {
                    filters.minNotional = filter.minNotional;
                } else if ( filter.filterType == "LOT_SIZE" ) {
                    filters.stepSize = filter.stepSize;
                    filters.minQty = filter.minQty;
                }
            }
            memorija.exchInfo[obj.symbol] = filters;
        }
        // console.log(memorija.exchInfo.ETHBTC);
    });
}

/*
function Kendl(kendl) {
    this.openTime = kendl.openTime;
    this.closeTime = kendl.closeTime;
    this.O = kendl.open;
    this.H = kendl.high;
    this.L = kendl.low;
    this.C = kendl.close;
    this.volume = kendl.volume;
    this.trades = kendl.trades;
}
*/


/*
client.ws.ticker(whitelista, tiker => {
	memorija.tikeri[tiker.symbol] = tiker;
});

client.ws.candles(whitelista, '1m', kendl => {
    if (kendl.isFinal) {
        memorija.kendlovi[kendl.symbol]
    } 
});


(async function() {
    // Connection URL
    // Database Name
    let client;
    try {
        // Use connect method to connect to the Server
        client = await MongoClient.connect(url);

        const db = client.db(dbName);
    } catch (err) {
        console.log(err.stack);
    }

    if (client) {
        client.close();
    }
})();
*/