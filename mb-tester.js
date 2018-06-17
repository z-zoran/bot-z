"use strict";

// instanciranje klijenta prema binanceu
const binance = require('node-binance-api');
require('isomorphic-fetch');

const assert = require('assert');
const whitelista = [
	'ETHBTC',
	'XRPBTC', 'XRPETH', // Ripple
	'EOSBTC', 'EOSETH', // EOS
	'LTCBTC', 'LTCETH', // LiteCoin
	'ADABTC', 'ADAETH', // Cardano
	'XLMBTC', 'XLMETH', // Stellar
	'IOTABTC','IOTAETH',// Iota
	'NEOBTC', 'NEOETH', // NEO
	'XMRBTC', 'XMRETH', // Monero
	'DASHBTC','DASHETH',// Dash
	'XEMBTC', 'XEMETH', // Nem
	'VENBTC', 'VENETH', // VeChain
	'ETCBTC', 'ETCETH', // Ethereum Classic
	'BNBBTC', 'BNBETH', // Binance Coin
	'ZECBTC', 'ZECETH', // Zcash
	'QTUMBTC','QTUMETH',// Qtum
	'ICXBTC', 'ICXETH', // Icon
	'OMGBTC', 'OMGETH', // OmiseGO
	'LSKBTC', 'LSKETH', // Lisk
	'ZILBTC', 'ZILETH', // Zilliqa
	'AEBTC',  'AEETH',  // Aeternity
	'XVGBTC', 'XVGETH', // Verge
	'STEEMBTC', 'STEEMETH', // Steem
	'ONTBTC', 'ONTETH', // Ontology
	'NANOBTC','NANOETH',// Nano
	'ZRXBTC', 'ZRXETH', // 0x
	'BTSBTC', 'BTSETH', // BitShares
	'PPTBTC', 'PPTETH', // Populous
	'WANBTC', 'WANETH', // Wanchain
	'WAVESBTC', 'WAVESETH', // Waves
	'REPBTC', 'REPETH', // Augur
	'STRATBTC', 'STRATETH', // Stratis
	'GNTBTC', 'GNTETH', // Golem
	'IOSTBTC','IOSTETH',// IOStoken
	'DGDBTC', 'DGDETH', // DigixDAO
	'HSRBTC', 'HSRETH', // Hshare
	'AIONBTC','AIONETH',// Aion
	'WTCBTC', 'WTCETH', // Waltonchain
	'LRCBTC', 'LRCETH', // Loopring
	'BATBTC', 'BATETH', // Basic Attention Token
	'KMDBTC', 'KMDETH', // Komodo
	'ARKBTC', 'ARKETH', // Ark
	'ELFBTC', 'ELFETH', // aelf
	'LOOMBTC','LOOMETH',// Loom Network
	'PIVXBTC','PIVXETH',// PIVX
	'BNTBTC', 'BNTETH', // Bancor
	'FUNBTC', 'FUNETH', // FunFair
	'KNCBTC', 'KNCETH', // Kyber Network
	'SYSBTC', 'SYSETH', // Syscoin
	'GXSBTC', 'GXSETH', // GXchain
	'SUBBTC', 'SUBETH', // Substratum
	'CMTBTC', 'CMTETH', // CyberMiles
	'STORMBTC', 'STORMETH', // Storm
	'RLCBTC', 'RLCETH', // iExecRLC
	'ENGBTC', 'ENGETH', // Enigma
	'NULSBTC','NULSETH',// Nuls
	'XZCBTC', 'XZCETH', // Zcoin
	'SALTBTC','SALTETH',// Salt
	'GTOBTC', 'GTOETH', // Gifto
];
const startTime = 1525132800000; //Human time (GMT): Tuesday, May 1, 2018 12:00:00 AM
const pauza = 1000;
const rezolucije = {
    m1: {ms: 60000, str: '1m'},
    m5: {ms: 300000, str: '5m'},
    m15: {ms: 900000, str: '15m'},
    m60: {ms: 3600000, str: '1h'},
}
// MONGO podaci
const mongo = {
    Client: require('mongodb').MongoClient,
    dbUrl: 'mongodb://localhost:27017',
    dbName: 'baza',
}

let koliko = 59;
// iteratorWhiteliste(koliko, mongo, pauza, whitelista, rezolucije);
let testArr = [
    {
        a: 123,
        aaads: 'asd',
    },
    {
        a: 323,
        adsss: 'dsadas',
    },
    {
        a: 444,
        axyxcds: 'aasdd',
    },
    {
        a: 0.32,
        qqq: 'aasaaaad',
    },
]


let argZaSpremanje = {
	array: testArr, // array s kendlovima
	kolekcija: 'test-kolekcija', // string ime kolekcije (npr. ETHBTC-m5)
} 

// spremiuMongo(mongo, argZaSpremanje);

async function spremiuMongo(mongo, arg) {
    let client, db;
    try {
        client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
		db = client.db(mongo.dbName);
		let r = await db.collection(arg.kolekcija).insertMany(arg.array);
		assert.equal(arg.array.length, r.insertedCount);
    } catch (err) {
        throw new Error(err);
    }
	client.close();
}

let argZaPovlacenje = {
	kolekcija: 'ETHBTC-1h', // string ime kolekcije (npr. ETHBTC-5m)
	// startTime, // number timestamp prvog traženog kendla
	koliko: 5, // number koliko kendlova
}

povuciIzMonga(mongo, argZaPovlacenje);

async function povuciIzMonga(mongo, arg) {
    let client, db, array;
    try {
        client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
        db = client.db(mongo.dbName);
		array = await db
			.collection(arg.kolekcija)
			.find(/*{openTime: {$gte: arg.startTime}}, {_id: 0}*/)
			.sort({openTime: 1})
			//.limit(arg.koliko)
			.toArray();
		for (let i = 0; i < (array.length - 1); i++) {
			if (array[i].openTime === array[i + 1].openTime) {
				console.log(array[i] + array[i+1]);
			}
		}
		// console.log(array.length);
    } catch (err) {
        throw new Error(err);
    }
	client.close();
	return array;
}

/** Promise za dohvatiti arbitrarni broj kendlova s Binancea.
 * 
 * @param {string} symbol - par koji dohvaćamo
 * @param {number} koliko - koliko kendlova trebamo
 * @param {string} rezStr - rezolucija (string) npr. '1m', '5m' itd.
 * @param {number} startTime - timestamp openTime prvog kendla
 * @returns {Promise} - vraća Promise dok nas Binance ne resolva
 */
async function dohvatiKendlove(symbol, koliko, rezStr, startTime) {
	let apiUrl = `https://api.binance.com/api/v1/klines?symbol=${symbol}&interval=${rezStr}&limit=${koliko}&startTime=${startTime}`;
	return fetch(apiUrl, {method: 'GET'})
		.then(response => response.json())
		.catch(err => console.log('ERROR pri dohvaćanju s Binancea: ' + err))
}

/** Standardizirani Kendl objekat.
 * Dodati metode na kendl (indikatore i sl.)
 */
class Kendl {
    constructor(kendl) {
        this.openTime = kendl[0];
        this.O = Number(kendl[1]);
        this.H = Number(kendl[2]);
        this.L = Number(kendl[3]);
        this.C = Number(kendl[4]);
        this.sellVolume = Number(kendl[5] - kendl[9]);
        this.buyVolume = Number(kendl[9]);
        this.trades = kendl[8];
    }
}

/*
(async () => {
	dohvatiKendlove('ETHBTC', 2, '15m', startTime)
		.then(arr => arr.forEach(el => {
			let kendlo = new Kendl(el);
			console.log(kendlo);
		}))
})();
*/

// izlistajKolekcije(mongo);


async function izlistajKolekcije(mongo) {
    let client, db;
    try {
        client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
		db = client.db(mongo.dbName);
		let arr = await db.listCollections().toArray();
		console.log(arr);
	} catch (err) {
        throw new Error(err);
    }
	client.close();
}
