"use strict";

// instanciranje klijenta prema binanceu
const binance = require('node-binance-api');
// pristup memoriji
const memorija = require('./memorija.js');
// koliko dubok orderbook želimo održavati
const dubinaKnjige = memorija.config.dubinaKnjige;
// manualno odobreni parovi za trejdanje
const whitelista = memorija.whitelista;
// util funkcija za ekstrahiranje base/quote iz symbola
const baseQuote = require('./alatke.js').baseQuote;

/* --------POMOĆNE FUNKCIJE------- */

/** Funkcija za srezavanje predubokog orderbooka
 * 
 * @param {object} knjiga - orderbook, ali samo jedna strana (bid ili ask)
 * @param {string} smjer - opcija: bidovi ili askovi (desc ili asc sort)
 * @returns {object} - srezan orderbook na dubinaKnjige
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

/** Funkcija za napipavanje potrebne dubine za izvršiti order (iznos)
 * 
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
        i++;
        if (i >= keyevi.length) {
            throw new Error('Preplitak orderbook. Povečati globalnu dubinaKnjige varijablu ili smanjiti iznos za napipavanje.');
        }
    }
    // ako propadne kroz while na neku šemu, bacamo error
    throw new Error('Nešto čudno u napipajDubinu().');
}

/** Sub-funkcijica za izračunati umnožak i avg cijenu objekta napipano
 * 
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

/* --------GLAVNE FUNKCIJE------- */

/** Glavni feed za sve tikere u memoriji
 * 
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

/** Funkcija za izvršavanje kalkulacija pri svakom dolasku tikera
 * 
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

/** Dohvaćanje svih simbola (parova) i podataka min order iznos i sl.
 * 
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

module.exports = {
    napipajDubinu: napipajDubinu,
    pokreniDeepTikerFeed: pokreniDeepTikerFeed,
    dohvatiExchInfo: dohvatiExchInfo,
}