"use strict";

// instanciranje klijenta prema binanceu
const binance = require('node-binance-api');
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

/*
let argZaSpremanje = {
	array, // array s kendlovima
	kolekcija, // string ime kolekcije (npr. ETHBTC-m5)
} 
*/
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
/*
let argZaPovlacenje = {
	kolekcija, // string ime kolekcije (npr. ETHBTC-m5)
	startTime, // number timestamp prvog traženog kendla
	koliko, // number koliko kendlova
}
*/
async function povuciIzMonga(mongo, arg) {
    let client, db, array;
    try {
        client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
        db = client.db(mongo.dbName);
		array = await db
			.collection(arg.kolekcija)
			.find({openTime: {$gte: arg.startTime}}, {_id: 0})
			.sort({openTime: 1})
			.limit(arg.koliko)
			.toArray();
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
 * @param {number} startTime - timestamp opentTime prvog kendla
 * @returns {Promise} - vraća Promise dok nas Binance ne resolva
 */
function dohvatiKendlove(symbol, koliko, rezStr, startTime) {
    return new Promise(function(resolve, reject) {
		console.log('prije egzekutora');
        binance.candlesticks(symbol, rezStr, resolve, {limit: koliko, startTime: startTime});
		console.log('poslje egzekutora');
    });
}

console.log('prije');

/*
// Intervals: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
binance.candlesticks("BNBBTC", "5m", (error, array, symbol) => {
	console.log("candlesticks()", array);
}, {limit: 3, endTime: 1514764800000});
console.log('poslje');
*/

dohvatiKendlove('BNBBTC', 3, '5m', startTime).then((error, array, symbol) => {
	console.log('poslje');
	console.log(error);
	console.log(array);
	console.log(symbol);
});
console.log('nakon');


// OBRISATI
async function testKonektor(mongo, noviArr) {
    let client;
    try {
        client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
        const db = client.db(mongo.dbName);
        let kolekcija = await db.collection('test-kolekcija').find().sort({a: -1}).toArray();
        let kopija = noviArr.slice(0, noviArr.length);
        noviArr.forEach(obj => {
            if (kolekcija.includes(obj)) kopija = kopija.filter(el => el !== obj);
        })
        let r = await db.collection('test-kolekcija').insertMany(kopija);
        assert.equal(noviArr.length, r.insertedCount);
    } catch (err) {
        throw new Error(err);
    }
    client.close();
}

// OBRISATI
async function testReader(mongo) {
    let client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
    let db = client.db(mongo.dbName);
    let arr = await db.collection('test-kolekcija').find().sort({a: -1}).toArray();
    arr.forEach(element => console.log(element));
}
