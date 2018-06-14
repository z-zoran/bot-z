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
]

async function iteratorWhiteliste(koliko, mongo, pauza, whitelista, rezolucije) {
    for (let br = 0; br < koliko; br++) {
        for (let i = 0; i < whitelista.length; i++) {
            let rez = rezolucije.m1;
            let symbol = whitelista[i];
            await staniPaSkini(mongo, pauza, symbol, rez);
        }
        if (br % 5 === 0) {
            for (let i = 0; i < whitelista.length; i++) {
                let rez = rezolucije.m5;
                let symbol = whitelista[i];
                await staniPaSkini(mongo, pauza, symbol, rez);
            }
        }
        if (br % 15 === 0) {
            for (let i = 0; i < whitelista.length; i++) {
                let rez = rezolucije.m15;
                let symbol = whitelista[i];
                await staniPaSkini(mongo, pauza, symbol, rez);
            }
        }
        if (br % 60 === 0) {
            for (let i = 0; i < whitelista.length; i++) {
                let rez = rezolucije.m60;
                let symbol = whitelista[i];
                await staniPaSkini(mongo, pauza, symbol, rez);
            }
        }
    }
}


/** Funkcija za pauzirati pa dohvatiti kendlove.
 * @param {object} mongo - setinzi za mongo bazu
 * @param {number} pauza - broj milisekundi za pauzirati prije dohvaćanja
 * @param {string} symbol - par za dohvatiti
 * @param {object} rez - rezolucija (string i milisekunde)
 */
async function staniPaSkini(mongo, pauza, symbol, rez) {
    await staniTren(pauza);
    let info = {
        symbol: symbol,
        kolekcija: symbol + '-' + rez.str,
        rez: rez,
    }
    await napipajDohvati(mongo, info);
}

/** Sub-funkcija za pauziranje egzekucije.
 * @param {number} pauza - broj milisekundi za pričekati
 */
function staniTren(pauza) {
    return new Promise(resolve => {
        setTimeout(resolve, pauza);
    })
}

/** Funkcija za dohvatiti kendlove i strpati ih u mongo.
 * @param {object} mongo - setinzi za mongo bazu
 * @param {object} info - setinzi za pojedini symbol/rez
 */
async function napipajDohvati(mongo, info) {
    let client;
    try {
        // spoji se
        client = await mongo.Client.connect(mongo.dbUrl, { useNewUrlParser: true });
        const db = client.db(mongo.dbName);
        // iščupati prvi element (sortiran po timestampu)
        let kursor = await db.collection(info.kolekcija).find().sort({openTime: 1}).limit(1);
        if (kursor.count() > 0) {
            // ako postoji taj prvi element, premotamo za 500 kendlova unazad
            let premotaniTimestamp = kursor.toArray()[0].openTime - (500 * info.rez.ms);
            let noviArr = await dohvatiObradi(info.symbol, 500, info.rez.str, premotaniTimestamp);
            let r = await db.collection(info.kolekcija).insertMany(noviArr);
            assert.equal(noviArr.length, r.insertedCount);
        } else {
            let noviArr = await dohvatiObradi(info.symbol, 500, info.rez.str);
            let r = await db.collection(info.kolekcija).insertMany(noviArr);
            assert.equal(noviArr.length, r.insertedCount);
        }
    } catch (err) {
        throw new Error(err);
    }
    client.close();
}

/** Funkcija za dohvatiti i kendlizirati kendlove s Binancea.
 * 
 * @param {string} symbol - par koji dohvaćamo
 * @param {number} koliko - koliko kendlova trebamo
 * @param {string} rezStr - rezolucija (string) npr. '1m', '5m' itd.
 * @param {number} startTime - timestamp opentTime prvog kendla
 */
function dohvatiObradi(symbol, koliko, rezStr, startTime) {
    return dohvatiKendlove(symbol, koliko, rezStr, startTime)
        .then(kendlizirajResponse(error, kendlovi))
        .catch(err => { throw new Error(err) });
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
        binance.candlesticks(symbol, rezStr, resolve, {limit: koliko, startTime: startTime});
    });
}

/** Funkcija za pretvoriti payload s Binancea u standardizirane Kendl objekte.
 * 
 * @param {*} error - potencijalni error proslijeđen iz dohvatiKendlove
 * @param {array} kendlovi - payload array kendlova u sirovom formatu
 * @returns {array} - vraća array standardnih Kendl objekata
 */
function kendlizirajResponse(error, kendlovi) {
    if (error) throw new Error('Problem u kendlizaciji payloada. ' + error)
    else return kendlovi.map(kendl => new Kendl(kendl));
}

// REFORMIRATI
/** Funkcija za dohvatiti zadnji kendl za sve parove s whiteliste.
 * 
 * @param {array} whitelista - popis symbola za trejdanje
 * @param {string} rezStr - rezolucija (string) npr. '1m', '5m' itd.
 * @param {number} startTime - timestamp opentTime prvog kendla

function dohvatiHorizontalnoSveSymbole(whitelista, rezStr, startTime) {
    whitelista.forEach(symbol => {
        let arr = memorija.kendlovi[symbol][rezStr];
        dohvatiObradi(arr, symbol, 1, rezStr, startTime);
    });
}
*/

/** Standardizirani Kendl objekat.
 * Dodati metode na kendl (indikatore i sl.)
 */
class Kendl {
    constructor(kendl) {
        this.openTime = kendl[0];
        this.O = kendl[1];
        this.H = kendl[2];
        this.L = kendl[3];
        this.C = kendl[4];
        this.sellVolume = kendl[5] - kendl[9];
        this.buyVolume = kendl[9];
        this.trades = kendl[8];
    }
}

// input za chart konstruktor
let input = {
    array,
    duljinaCharta,
    zadnjiOpenTime,
    rezolucija,
    symbol,
}

// Chart klasa drži bruto array Kendl objekata
// pastArr su kendlovi u prošlosti, futurArr su nadolazeći kendlovi (nepostojeće kod live trejdanja)
// viewArr su kendlovi koje trenutno prikazujemo (kao neka vrsta kursora)
// ovako možemo premotavati čartove napred nazad
// ps. trebamo posebnu funkciju koja konstruira Chart jer je konstrukcija async (povlačenje kendlova iz monga), a constructor() ne može biti async
class Chart {
    constructor(input) {
        this.pastArr;
        this.viewArr = input.array;
        this.futurArr;
        this.duljina = input.duljinaCharta;
        this.kursor = input.zadnjiOpenTime;
        this.rez = input.rezolucija;
    }
    async odiNaprijed(koliko) {
        // povuci koliko kendlova iz monga
    }
    async odiNazad(koliko) {
        // povuci koliko kendlova iz monga
    }
    ema() {

    }
    rsi() {

    }
    macd() {

    }
}

async function konstruktorCharta() {
    // let asyncDohvaceniPodaci = await dohvati šta treba iz monga
    return new Chart(asyncDohvaceniPodaci)
}
