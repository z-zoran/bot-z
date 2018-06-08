"use strict";

// Tu držimo evidenciju o svim pozicijama, limitima, stoptriggerima i trailerima.
// tzv. Trčuće varijable.
// Ostali moduli koji trebaju čitati/pisati te podatke, require-aju ovaj modul.
/*
let memorija = {
    portfoliji: {
        pozicije: {},
        limiti: {},
        traileri: {}
    }
}
*/
const memorija = {
	exchInfo: {},
	tikeri: {},
	kendlovi: {},
};

// skraćena whitelista za testiranje
memorija.whitelista = [
	'ETHBTC',
	'XRPBTC', // Ripple
];

memorija.config = {
	dubinaKnjige: 3,
}


/*
// puna whitelista
memorija.whitelista = [
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

// SLOŽITI SEGREGIRANE WHITELISTE PO TIPOVIMA COINOVA
// npr, BTC, ETH, IOTA itd u 1. klasu
// Drugorazredne u drugu klasu
// privacy coinove npr
// shit coinove (mali market cap tipa < 500,000.00$)
*/


/*
memorija.tikeri = {
	'ETHBTC': {dubinski tiker (zadnje stanje orderbooka)},
	'ALTETH': {dubinski tiker (zadnje stanje orderbooka)},
	'ALTBTC': {dubinski tiker (zadnje stanje orderbooka)},
	...
}

memorija.kendlovi = {
	'ETHBTC': {kendl},
	'ALTETH': {kendl},
	'ALTBTC': {kendl},
	...
}
*/

// memorija.001.pozicije.0001.tip
// memorija.001.limitCounter
// itd...


/* MONGO DB id kendlova će biti:
<timestamp>-<rezStr>-<symbol>
	npr: 1514764800-m1-ETHBTC
	tako da za svaki slučaj ako sortiramo po id-u,
	obzirom da je timestamp prvi slog, sortirat će prema njemu.
	Ali inače uvijek sortirati prema timestampu.
id stanja će biti:
<timestamp>-<portfolio>-<symbol>
*/

/* STRUKTURA MONGO BAZE PODATAKA:
horizontalne kolekcije kendlova. dakle nema nestanja.
> db:
	> ETHBTC-m1:
		> ... (kendlovi)
	> ETHBTC-m5:
		> ... (kendlovi)
	> ETHBTC-m15:
		> ... (kendlovi)
	> ETHBTC-m60:
		> ... (kendlovi)
	> XRPETH-m1:
		> ... (kendlovi)
	> XRPETH-m5:
		> ... (kendlovi)
	> ... (kolekcije se nastavljaju)
*/

/* MONGO BAZA KOLEKCIJE: 
> db:
	> ETHBTC-m1
	> ETHBTC-m5
	> ETHBTC-m15
	> ....
	> BNBBTC-m15
	> BNBBTC-m60
	> stanje (tu spašavamo dokumente sa snimkama stanja svaki put kad se nešto događa)

*/

module.exports = memorija;
