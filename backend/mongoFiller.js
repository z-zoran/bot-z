"use strict";
// puna whitelista
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
const startTime = 1514764800;
const pauza = 0;
const rezolucije = {
    m1: {ms: 60000, str: '1m'},
    m5: {ms: 300000, str: '5m'},
    m15: {ms: 900000, str: '15m'},
    m60: {ms: 3600000, str: '1h'},
}
let globBrojilo = 0;

/* FILLER MONGO BAZE S KENDLOVIMA */

function staniTren(pauza) {
    return new Promise(resolve => {
        setTimeout(resolve, pauza);
    })
}

function skini(startTime, symbol, rez) {
    globBrojilo += 1;
    if (globBrojilo % 10000 === 0) console.log('Iteracija br '+ globBrojilo);
    // console.log('StartTime: ' + startTime + ' Symbol: ' + symbol + ' Rezolucija: ' + rez.str + ' Brojač iteracija: ' + globBrojilo);
}

async function staniPaSkini(pauza, startTime, symbol, rez) {
    await staniTren(pauza);
    skini(startTime, symbol, rez);
}

async function iteratorWhiteliste(pauza, startTime, whitelista, rez) {
    for (let i = 0; i < whitelista.length; i++) {
        let symbol = whitelista[i];
        await staniPaSkini(pauza, startTime, symbol, rez);
    }
}

async function iteratorVremena(pauza, startTime, whitelista, rez) {
    let pocetak = Number(startTime);
    while (pocetak < Date.now()) {
        await iteratorWhiteliste(pauza, pocetak, whitelista, rez);
        pocetak += 500 * rez.ms;
    }
}

async function iteratorRezolucije(pauza, startTime, whitelista, rezolucije) {
    for (let i in rezolucije) {
        let rez = rezolucije[i];
        await iteratorVremena(pauza, startTime, whitelista, rez);
    }
}

iteratorRezolucije(pauza, startTime, whitelista, rezolucije);

/*
// master hendler
function masterHendler(request, response) {
    console.log('Blaaa');
    response.send('Evo me');
}

// express router
app.get('/', masterHendler);

// uvo sluša
app.listen(873, () => console.log('Example app listening on port 873!'));
*/