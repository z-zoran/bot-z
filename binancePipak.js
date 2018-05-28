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

// c/p sa node-binance-api readme-a
// čupamo minimalne Qnt
//minQty = minimum order quantity
//minNotional = minimum order value (price * quantity)
binance.exchangeInfo(function(error, data) {
	let minimums = {};
	for ( let obj of data.symbols ) {
		let filters = {status: obj.status};
		for ( let filter of obj.filters ) {
			if ( filter.filterType == "MIN_NOTIONAL" ) {
				filters.minNotional = filter.minNotional;
			} else if ( filter.filterType == "PRICE_FILTER" ) {
				filters.minPrice = filter.minPrice;
				filters.maxPrice = filter.maxPrice;
				filters.tickSize = filter.tickSize;
			} else if ( filter.filterType == "LOT_SIZE" ) {
				filters.stepSize = filter.stepSize;
				filters.minQty = filter.minQty;
				filters.maxQty = filter.maxQty;
			}
		}
		//filters.baseAssetPrecision = obj.baseAssetPrecision;
		//filters.quoteAssetPrecision = obj.quoteAssetPrecision;
		filters.orderTypes = obj.orderTypes;
		filters.icebergAllowed = obj.icebergAllowed;
		minimums[obj.symbol] = filters;
	}
	console.log(minimums);
	global.filters = minimums;
	//fs.writeFile("minimums.json", JSON.stringify(minimums, null, 4), function(err){});
});





function srezatiListu(lista) {
    let i = 0;
    let srezana = {};
    for (let a in lista) {
        srezana[a] = lista[a];
        i++;
        if (i >= dubinaKnjige) break;
    }
    return srezana;
}

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

setInterval(() => {
    printajTikere();
}, 500);

binance.websockets.depthCache(whitelista, (symbol, depth) => {
    let asks = binance.sortAsks(depth.asks);
    let bids = binance.sortBids(depth.bids);
    let askovi = srezatiListu(asks);
    let bidovi = srezatiListu(bids);
    memorija.tikeri[symbol] = {
        askovi: askovi,
        bidovi: bidovi,
    }
});


function Kendl(kendl) {
    this.O = kendl.open;
    this.H = kendl.high;
    this.L = kendl.low;
    this.C = kendl.close;
    this.volume = kendl.volume;
    this.trades = kendl.trades;
    if (kendl.closeTime) {
        this.time = new Date(kendl.closeTime + 1);
    } else if (kendl.eventTime) {
        this.time = new Date(kendl.eventTime);
        this.time.setSeconds(0, 0);
    } 
}
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