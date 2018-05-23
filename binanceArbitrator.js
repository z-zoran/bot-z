"use strict";

/* RATE LIMIT OSIGURAČ */

// rate limit brojač smanjujemo cijelo vrijeme (svakih 1/10 sekunde)
let brojac = 0;
setInterval(() => {
	if (brojac > 1) brojac -= 1
	else brojac = 0;
}, 100);

// rate limit checking funkcija, vraća true ako može, inače tjera na čekanje
async function rateLimitCheck() {
	setTimeout(() => {
		if (brojac < 5) return true;
		else return rateLimitCheck();
	}, 200);
}

// util funkcija za vraćanje { base: 'ABC', quote: 'DEF' } objekta
function baseQuote(string) {
	return {
		base: string.slice(0, string.length - 3), 
		quote: string.slice(string.length - 3, string.length)
	}
}

// instanciranje klijenta prema binanceu
const Binance = require('binance-api-node').default;
const client = new Binance();

// manualno odobreni parovi za trejdanje
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

let tekst = [];
let datum = [];

const prag = 0.001;

const tikeri = {};
/*
(async function() {
	console.log((await client.exchangeInfo()).rateLimits)
})();
*/
function usporediTrio(ethKrozBtc, nestoKrozBtc, nestoKrozEth) {
	// INTEGRIRATI AUTOMATSKO ODUZIMANJE FEE-JA
	// prvo moramo assertirati da su dobri simboli
	let ethSePoklapa = baseQuote(ethKrozBtc.symbol).base === baseQuote(nestoKrozEth.symbol).quote;
	let btcSePoklapa = baseQuote(ethKrozBtc.symbol).quote === baseQuote(nestoKrozBtc.symbol).quote;
	let nestoSePoklapa = baseQuote(nestoKrozBtc.symbol).base === baseQuote(nestoKrozEth.symbol).base;
	if (ethSePoklapa && btcSePoklapa && nestoSePoklapa) {
		// cijene ETH direktno i posredno, izražene u BTC
		let prodajnaCijenaEthDirektno = ethKrozBtc.bestBid;
		let kupovnaCijenaEthDirektno = ethKrozBtc.bestAsk;
		let prodajnaCijenaEthPosredno = nestoKrozBtc.bestBid / nestoKrozEth.bestAsk;
		let kupovnaCijenaEthPosredno = nestoKrozBtc.bestAsk / nestoKrozEth.bestBid;
		// razlika kupovne cijene direktno ili posredno
		let kupiPosrednoRazlikaApsolutna = String((prodajnaCijenaEthDirektno - kupovnaCijenaEthPosredno).toFixed(8)).padStart(10);
		let kupiPosrednoRazlikaRelativna = String(((prodajnaCijenaEthDirektno / kupovnaCijenaEthPosredno) - 1).toFixed(8)).padStart(10);
		let kupiDirektnoRazlikaApsolutna = String((prodajnaCijenaEthPosredno - kupovnaCijenaEthDirektno).toFixed(8)).padStart(10);
		let kupiDirektnoRazlikaRelativna = String(((prodajnaCijenaEthPosredno / kupovnaCijenaEthDirektno) - 1).toFixed(8)).padStart(10);
		// ako ijedna varijanta prelazi prag profitabilnosti onda zabilježimo priliku
		if (kupiPosrednoRazlikaRelativna > prag) {
			let zaGurnut = ' BTC =>  ' + baseQuote(nestoKrozBtc.symbol).base.padEnd(5) + ' => ETH  ||   Razlika: ' + String((kupiPosrednoRazlikaApsolutna * 1e8).toFixed(0)).padStart(7) + ' satoshi' + '  ||   Ratio = ' + (kupiPosrednoRazlikaRelativna * 100).toFixed(2) + ' %';
			if (!tekst.includes(zaGurnut)) {
				tekst.push(zaGurnut);
				datum.push(String(new Date(Date.now())).slice(4, 25));
				kupi('posredno', ethKrozBtc, nestoKrozBtc, nestoKrozEth);
			}
		}
		if (kupiDirektnoRazlikaRelativna > prag) {
			let zaGurnut = ' ETH =>  ' + baseQuote(nestoKrozBtc.symbol).base.padEnd(5) + ' => BTC  ||   Razlika: ' + String((kupiDirektnoRazlikaApsolutna * 1e8).toFixed(0)).padStart(7) + ' satoshi' + '  ||   Ratio = ' + (kupiDirektnoRazlikaRelativna * 100).toFixed(2) + ' %';
			if (!tekst.includes(zaGurnut)) {
				tekst.push(zaGurnut);
				datum.push(String(new Date(Date.now())).slice(4, 25));
				kupi('direktno', ethKrozBtc, nestoKrozBtc, nestoKrozEth);
			}
		}
	} else throw new Error('Usporedio bih trio, ali baseQuote ne štimaju');
}

let euroCijena = 600;
let euroUkupno = 0;
let porez = 0.001

function skiniFee(broj) {
	return broj * (1 - porez);
}

// pokušavamo riješiti trokorak arbitraže
let trokutPosredno = { // dabl čekirati logiku
	// 1) PRODAJ ETH KUPI BTC
	prvoGrlo: ethKrozBtc.bestBidQnt, // [eth] za prodati
	prvaNoga: ethKrozBtc.bestBidQnt * ethKrozBtc.bestBid, // [btc] za kupiti

	// 2) KUPI NEŠTO PRODAJ BTC
	drugoGrlo: nestoKrozBtc.bestAskQnt * nestoKrozBtc.bestAsk, // [btc] za prodati
	drugaNoga: nestoKrozBtc.bestAskQnt, // [nešto] za kupiti

	// 3) PRODAJ NEŠTO KUPI ETH
	treceGrlo: nestoKrozEth.bestBidQnt, // [nešto] za prodati
	trecaNoga: nestoKrozEth.bestBidQnt * nestoKrozEth.bestBid, // [eth] za kupiti
}

let trokutDirektno = {
	// 1) KUPI ETH PRODAJ BTC
	prvoGrlo: ethKrozBtc.bestAskQnt, // [eth] za kupiti
	prvaNoga: ethKrozBtc.bestAskQnt * ethKrozBtc.bestAsk, // [btc] za prodati

	// 2) PRODAJ NEŠTO KUPI BTC
	drugoGrlo: nestoKrozBtc.bestBidQnt * nestoKrozBtc.bestBid, // [btc] za kupiti
	drugaNoga: nestoKrozBtc.bestBidQnt, // [nešto] za prodati

	// 3) KUPI NEŠTO PRODAJ ETH
	treceGrlo: nestoKrozEth.bestAskQnt, // [nešto] za kupiti
	trecaNoga: nestoKrozEth.bestAskQnt * nestoKrozEth.bestAsk, // [eth] za prodati
}

// provjeravamo ima li usko grlo (da li je ijedna noga veća od slijedećeg grla)
function odrediKolikoMozeProci(trokut) {
	if (prvaNoga < drugoGrlo) {
		if (drugaNoga < treceGrlo) {
			if (trecaNoga < prvoGrlo) {
				// prošli smo sva grla
			} else {
				// nismo prošli prvo grlo
				// korigiraj i ponovo provjeri (rekurzivno)
			}
		} else {
			// nismo prošli treće grlo
				// korigiraj i ponovo provjeri (rekurzivno)
		}
	} else {
		// nismo prošli drugo grlo
		// korigiraj i ponovo provjeri (rekurzivno)
	}
}


function kupi(kako, ethKrozBtc, nestoKrozBtc, nestoKrozEth) {
	if (kako === 'posredno') {
		let prvaNoga, drugaNoga, trecaNoga;
		// prva noga
		prvaNoga = ethKrozBtc.bestBidQnt * ethKrozBtc.bestBid; // btc
		if (nestoKrozBtc.bestAskQnt < prvaNoga) {
			prvaNoga = skiniFee(nestoKrozBtc.bestAskQnt); // btc
		} else {
			prvaNoga = skiniFee(ethKrozBtc.bestBidQnt * ethKrozBtc.bestBid); // btc
		}
		// druga noga, s povratnom korekcijom ako je potrebno
		drugaNoga = prvaNoga / nestoKrozBtc.bestAsk; // nešto
		if (nestoKrozEth.bestBidQnt < drugaNoga) {
			drugaNoga = skiniFee(nestoKrozEth.bestBidQnt); // nešto
			prvaNoga = skiniFee(nestoKrozEth.bestBidQnt * nestoKrozBtc.bestAsk); // btc
		} else {
			// tu sam
			drugaNoga = skiniFee(prvaNoga / nestoKrozBtc.bestAsk); // nešto
		}
		// treća noga, s korekcijama ako treba
		trecaNoga = drugaNoga * nestoKrozEth.bestBid; // eth
		if (ethKrozBtc.bestBidQnt < trecaNoga) {

			prvaNoga = skiniFee(nestoKrozBtc.bestAskQnt);
		} else {
			prvaNoga = skiniFee(ethKrozBtc.bestBidQnt * ethKrozBtc.bestBid);
		}

		// prodamo eth/btc najboljem bidu
		let prvaNoga = ethKrozBtc.bestBidQnt * ethKrozBtc.bestBid; // valuta: btc
		// provjerimo da li treba smanjiti
		if (nestoKrozBtc.bestAskQnt < prvaNoga) {
			prvaNoga = nestoKrozBtc.bestAskQnt;		
		}
		prvaNoga = skiniFee(prvaNoga);
		// kupimo nesto/btc od najboljeg aska
		let drugaNoga = prvaNoga / nestoKrozBtc.bestAsk; // valuta: nešto
		// provjerimo da li treba smanjiti
		if (nestoKrozEth.bestBidQnt < drugaNoga) {
			drugaNoga = nestoKrozEth.bestBidQnt; // nešto
			prvaNoga = drugaNoga * nestoKrozBtc.bestAsk; // btc
		}
		drugaNoga = skiniFee(drugaNoga);
		// prodamo nesto/eth najboljem bidu
		let trecaNoga = drugaNoga * nestoKrozEth.bestBid; // valuta eth
		// provjerimo da li treba smanjiti
		if (ethKrozBtc.bestBidQnt < trecaNoga) {
			trecaNoga = ethKrozBtc.bestBidQnt; // eth
			drugaNoga = trecaNoga / nestoKrozEth.bestBid; // nešto
			prvaNoga = drugaNoga * nestoKrozBtc.bestAsk; // btc
		}
		// kupimo eth/btc od najboljeg aska
		let nultaNoga = prvaNoga / ethKrozBtc.bestBid; // eth
		let profitEth = (trecaNoga - nultaNoga).toFixed(5);
		let profitEur = ((trecaNoga - nultaNoga) * euroCijena).toFixed(2);

		let zaGurnut = 'eth prodano: ' + Number(nultaNoga).toFixed(5);
		zaGurnut += '  eth kupljeno: ' + Number(trecaNoga).toFixed(5);
		zaGurnut += '  profit: ' + profitEth + ' ETH';
		zaGurnut += '   ' + profitEur + ' €';
		tekst.push(zaGurnut);
		datum.push('       ');
		euroUkupno += Number(profitEur);
		/*
		// prodamo eth/btc najboljem bidu
		let prvaNoga = ethKrozBtc.bestBid * ethKrozBtc.bestBidQnt; // valuta: btc
		// kupimo nesto/btc od najboljeg aska
		let drugaNoga = nestoKrozBtc.bestAsk * nestoKrozBtc.bestAskQnt; // valuta: nešto
		// prodamo nesto/eth najboljem bidu
		let trecaNoga = nestoKrozEth.bestBid * nestoKrozEth.bestBidQnt // valuta eth
		*/

		/*
		let zaGurnut = 'ETH/BTC bid qnt: ' + ethKrozBtc.bestBidQnt;
		zaGurnut += '  ' + baseQuote(nestoKrozBtc.symbol).base + '/BTC ask qnt: ' + nestoKrozBtc.bestAskQnt;
		zaGurnut += '  ' + baseQuote(nestoKrozEth.symbol).base + '/ETH bid qnt: ' + nestoKrozEth.bestBidQnt;
		tekst.push(zaGurnut);
		datum.push('       ');
		zaGurnut = 'ETH/BTC bid: ' + ethKrozBtc.bestBid;
		zaGurnut += '  ' + baseQuote(nestoKrozBtc.symbol).base + '/BTC ask: ' + nestoKrozBtc.bestAsk;
		zaGurnut += '  ' + baseQuote(nestoKrozEth.symbol).base + '/ETH bid: ' + nestoKrozEth.bestBid;
		tekst.push(zaGurnut);
		datum.push('       ');
		*/
	} else if (kako === 'direktno') {

	}
}

client.ws.ticker(whitelista, tiker => {
	tikeri[tiker.symbol] = tiker;
	for (let i = 1; i < (whitelista.length / 2); i++) {
		if (tikeri[whitelista[0]] && tikeri[whitelista[(i * 2) - 1]] && tikeri[whitelista[i * 2]]) {
			usporediTrio(tikeri[whitelista[0]], tikeri[whitelista[(i * 2) - 1]], tikeri[whitelista[i * 2]]);
		}
	}
});

setInterval(() => {
	console.clear();
	console.log('Timestamp: ' + new Date(Date.now()));
	console.log();
	for (let i = 0; i < tekst.length; i++) {
		console.log(datum[i] + tekst[i]);
	}
	console.log('Ukupno profit dosad: ' + euroUkupno.toFixed(2));
}, 5000);
