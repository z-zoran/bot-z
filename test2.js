"use strict";


// instanciranje klijenta prema binanceu
const binance = require('node-binance-api');

// koliko dubok orderbook želimo održavati u memoriji
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
	for ( let obj of data.symbols ) {
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
	console.log(memorija.exchInfo.ETHBTC);
});
