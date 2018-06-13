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

//testKonektor(mongo, testArr);
testReader(mongo);

async function mongoKonektor(mongo, funk, funkArg) {
    let client, db;
    try {
        client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
        db = client.db(mongo.dbName);
        await funk(db, funkArg);
    } catch (err) {
        throw new Error(err);
    }
    client.close();
}

async function spremiuMongo() {
    mongoKonektor(mongo, function(jedan) {
        
    })
}

async function povuciIzMonga() {

}

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

async function testReader(mongo) {
    let client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
    let db = client.db(mongo.dbName);
    let arr = await db.collection('test-kolekcija').find().sort({a: -1}).toArray();
    arr.forEach(element => console.log(element));
}
