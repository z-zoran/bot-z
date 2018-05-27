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

const baseQuote = require('./alatke.js').baseQuote;

// instanciranje klijenta prema binanceu
const Binance = require('binance-api-node').default;
const client = new Binance();

// manualno odobreni parovi za trejdanje
const whitelista = require('./memorija.js').whitelista;

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
let fee = 0.001

function skiniFee(broj) {
	return broj * (1 - fee);
}
/*

			ETH
		  ..    ..
	    ..		  ..
	  ..			..
	..				  ..
  ALT	:	:	:	:   BTC



*/
// konstruktor za arbitražni trokut
function Trokut(tip, ethKrozBtc, nestoKrozBtc, nestoKrozEth) {
	this.tip = tip;
	this.ethKrozBtc = ethKrozBtc;
	this.nestoKrozBtc = nestoKrozBtc;
	this.nestoKrozEth = nestoKrozEth;
	if (tip === 'posredno') {
		// 1) PRODAJ ETH KUPI BTC
		this.prvoGrlo = ethKrozBtc.bestBidQnt; // [eth] za prodati
		this.prvaNoga = ethKrozBtc.bestBidQnt * ethKrozBtc.bestBid; // [btc] za kupiti
		// 2) KUPI NEŠTO PRODAJ BTC
		this.drugoGrlo = nestoKrozBtc.bestAskQnt * nestoKrozBtc.bestAsk; // [btc] za prodati
		this.drugaNoga = nestoKrozBtc.bestAskQnt; // [nešto] za kupiti
		// 3) PRODAJ NEŠTO KUPI ETH
		this.treceGrlo = nestoKrozEth.bestBidQnt; // [nešto] za prodati
		this.trecaNoga = nestoKrozEth.bestBidQnt * nestoKrozEth.bestBid; // [eth] za kupiti
	} else if (tip === 'direktno') {
		// 1) KUPI NEŠTO PRODAJ ETH
		this.prvoGrlo = nestoKrozEth.bestAskQnt * nestoKrozEth.bestAsk; // [eth] za prodati
		this.prvaNoga = nestoKrozEth.bestAskQnt; // [nešto] za kupiti
		// 2) PRODAJ NEŠTO KUPI BTC
		this.drugoGrlo = nestoKrozBtc.bestBidQnt; // [nešto] za prodati
		this.drugaNoga = nestoKrozBtc.bestBidQnt * nestoKrozBtc.bestBid; // [btc] za kupiti
		// 3) KUPI ETH PRODAJ BTC
		this.treceGrlo = ethKrozBtc.bestAskQnt * ethKrozBtc.bestAsk; // [btc] za prodati
		this.trecaNoga = ethKrozBtc.bestAskQnt; // [eth] za kupiti
	}
}

// METODE
// koristimo ih ovako:
if (trokut.provjeraUskoGrlo().provjeraProfitabilnosti()) trokut.obaviKupnju();

// provjera da li je neki Qnt usko grlo u arbitražnom trokutu
Trokut.prototype.provjeraUskoGrlo = function provjeraUskoGrlo() {
	if (trokut.prvaNoga < trokut.drugoGrlo) {
		if (trokut.drugaNoga < trokut.treceGrlo) {
			return this;
		} else {
			// treće grlo je preusko
			// korigiraj i ponovo provjeri (rekurzivno)
			if (this.tip === 'posredno') {
				this.drugaNoga = this.treceGrlo;
				this.drugoGrlo = this.drugaNoga * nestoKrozBtc.bestAsk;
				this.prvaNoga = this.drugoGrlo;
				this.prvoGrlo = this.prvaNoga / ethKrozBtc.bestBid;
			} else if (this.tip === 'direktno') {
				this.drugaNoga = this.treceGrlo;
				this.drugoGrlo = this.drugaNoga / nestoKrozBtc.bestBid;
				this.prvaNoga = this.drugoGrlo;
				this.prvoGrlo = this.prvaNoga * nestoKrozEth.bestAsk;
			}
			return this.provjeraUskoGrlo();
		}
	} else {
		// drugo grlo je preusko
		// korigiraj i ponovo provjeri (rekurzivno)
		if (this.tip === 'posredno') {
			this.prvaNoga = this.drugoGrlo;
			this.prvoGrlo = this.prvaNoga / ethKrozBtc.bestBid;
		} else if (this.tip === 'direktno') {
			this.prvaNoga = this.drugoGrlo;
			this.prvoGrlo = this.prvaNoga * nestoKrozEth.bestAsk;
		}
		return this.provjeraUskoGrlo();
	}
}

// provjera da li je profitabilno
Trokut.prototype.provjeraProfitabilnosti = function provjeraProfitabilnosti() {
	if
}

Trokut.prototype.obaviKupnju = async function obaviKupnju() {
	if (tip === 'posredno') {
		let 
	} else if (tip === 'direktno') {

	}
}

// provjeravamo ima li usko grlo (da li je ijedna noga veća od slijedećeg grla)
function provjeraDaLiImaUskoGrlo(trokut) {
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
