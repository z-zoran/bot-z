"use strict";

// Library s klasama. WIP
// portfolio je ustvari "glavna pozicija" u koju vraćamo sve slobodne pozicije. 
// Vezana za strategiju. Svaka strategija imati će svoj portfolio.

let memorija = require('./zMemy.js');
let pisalo = require('./zLoggy.js');

/*
Neka osnovna logika je slijedeća:
- Portfolio postavlja/ubija limitOrdere.
	(njihova vrijednost se insta oduzima/dodaje portfoliju)
	- LimitOrderi kod triggeranja se samo-ubijaju i stvaraju Poziciju koja pamti svoj stop trigger
		- kad se triggera stop trigger, briše se stop trigger i stvara Trailer.
			- Trailer se kod triggeranja samo-ubija, ubija i Poziciju i hrani njen iznos natrag u Portfolio.

PORTFOLIO METODE:
	.postLimit(limitData)
	.ubiLimit(koji)
	.postPoziciju(koja, odmakPhi)
	
POZICIJA METODE:
	.stopTriggeran(odmak)
	.likvidacija(cijenaSad)

TRAILER METODE:
	.korekcija(cijenaSad)

*/

// KLASA ZA PORTFOLIO
function Portfolio(portfolio, eur, eth, btc, ltc, bch) {
	this.portfolio = portfolio;
	this.EUR = eur;
	this.ETH = eth;
	this.BTC = btc;
	this.LTC = ltc;
	this.BCH = bch;
	this.pozCounter = 0;
	this.limitCounter = 0;
	this.limiti = {};
	this.pozicije = {};
	this.traileri = {};
}


// KLASA ZA LIMIT ORDERE
function LimitOrder(id, limitData) {
	this.portfolio = limitData.portfolio;
	this.id = id;	
	this.tip = limitData.tip;
	this.market = limitData.market;
	this.baseTiker = limitData.market.split('/')[0];
	this.quoteTiker = limitData.market.split('/')[1];
	this.iznos = limitData.iznos;
	this.limitCijena = limitData.limitCijena;
	this.umnozak = limitData.iznos * limitData.limitCijena;
}


// METODA ZA POSTAVLJANJE LIMITA
Portfolio.prototype.postLimit = function postLimit(limitData) {
	this.limiti[limitData.tip] = {};	// iniciramo novi ili brišemo stari limit
	this.limitCounter += 1; 	// povečavamo counter za limit id
	let limitCounterString = (this.limitCounter.toString()).padStart(4, "0");
	let baseTiker = limitData.market.split('/')[0];
	let quoteTiker = limitData.market.split('/')[1];
	let umnozak = limitData.iznos * limitData.limitCijena;
	let poruka = '';
	if (limitData.tip === 'buy') {
		// provjera imamo li dovoljno quote u portfoliu za kupiti base
		if (this[quoteTiker] < umnozak) {
			poruka = 'BANKROT! Nema dovoljno quote-a za postavljanje buy limita. LimitID: ' + limitCounterString;
		} else {
			// exchange komunikacija
			this[quoteTiker] -= umnozak;
			this.limiti.buy = new LimitOrder(limitCounterString, limitData);
			poruka = 'BUY LIMIT POSTAVLJEN. LimitID: ' + limitCounterString + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena;
		}
	} else if (limitData.tip === 'sell') {
		// provjera imamo li dovoljno base u portfoliu za prodaju 
		if (this[baseTiker] < iznos) {
			poruka = 'BANKROT! Nema dovoljno base-a za postavljanje sell limita. LimitID: ' + limitCounterString;
		} else {
			// exchange komunikacija
			this[baseTiker] -= limitData.iznos;
			this.limiti.sell = new LimitOrder(limitCounterString, limitData);
			poruka = 'SELL LIMIT POSTAVLJEN. LimitID: ' + limitCounterString + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena;
		}
	} else {
		poruka = 'ERROR! limitData nije dobro formatiran. LimitID: ' + limitCounterString;
	}
	pisalo.pisi(poruka);
}

// METODA ZA UBIJANJE LIMITA
Portfolio.prototype.ubiLimit = function ubiLimit(koji) {
    // exchange komunikacija
	let poruka = '';
	if (koji === 'buy') {
		this[quoteTiker] += this.limiti.buy.umnozak;
		delete this.limiti.buy;
		poruka = 'BUY LIMIT UBIJEN.';
	} else if (koji === 'sell') {
		this[baseTiker] += this.limiti.sell.iznos;
		delete this.limiti.sell;
		poruka = 'SELL LIMIT UBIJEN.'
	}
	pisalo.pisi(poruka);
}

// METODA ZA REALIZACIJU LIMIT ORDERA, ODNOSNO ZA STVARANJE POZICIJE
Portfolio.prototype.postPoziciju = function postPoziciju(koja, odmakPhi) {
	let pozData = {};
	// definiramo pozData za stvaranje nove pozicije.
	pozData.portfolio = this.portfolio;
	pozData.tip = koja;
	pozData.market = this.limiti[koja].market;
	pozData.baseTiker = this.limiti[koja].baseTiker;
	pozData.base = this.limiti[koja].iznos;
	pozData.quoteTiker = this.limiti[koja].quoteTiker;
	pozData.quote = this.limiti[koja].umnozak;
	pozData.cijena = pozData.quote / pozData.base;
	if (koja === 'buy') {
		pozData.stop = pozData.cijena + odmakPhi;
	} else if (koja === 'sell') {
		pozData.stop = pozData.cijena - odmakPhi;
	}
	this.pozCounter += 1; 	// povečavamo counter za id pozicije
	let pozCounterString = (this.pozCounter.toString()).padStart(4, "0");
	this.pozicije[pozCounterString] = new Pozicija(pozCounterString, pozData);
	let poruka = 'LimitOrder ' + this.limiti[koja].id + ' konzumiran. Stvorena ' + koja + ' pozicija id: ' + pozCounterString + ' | iznos: ' + pozData.base.toFixed(6) + ' | cijena: ' + pozData.cijena.toFixed(2) + ' | stop: ' + pozData.stop.toFixed(2);
	pisalo.pisi(poruka);
	delete this.limiti[koja];
}

// KLASA ZA POZICIJE
function Pozicija(id, pozData) {
	this.portfolio = pozData.portfolio;
	this.id = id;	
	this.tip = pozData.tip;	// buy || sell
	this.market = pozData.market;
	this.baseTiker = pozData.baseTiker;
	this.base = pozData.base;	// iznos limita
	this.quoteTiker = pozData.quoteTiker;
	this.quote = pozData.quote;	// umnožak
	this.cijena = pozData.cijena;
	this.stop = pozData.stop;
}

// METODA ZA TRIGGERANJE STOPA
Pozicija.prototype.stopTriggeran = function(odmak) {
	let trailerData = {};
	trailerData.portfolio = this.portfolio;
	trailerData.id = this.id;
	trailerData.cijena = this.cijena;
	if (this.tip === 'buy') {
		trailerData.odmak = odmak * (-1);
	} else if (this.tip === 'sell') {
		trailerData.odmak = odmak;
	}
	memorija[this.portfolio].traileri[this.id] = new Trailer(trailerData);
	let poruka = 'Stop trigger ' + memorija[this.portfolio].pozicije[this.id] + 
	delete this.stop;
}

// METODA ZA LIKVIDACIJU POZICIJE
Pozicija.prototype.likvidacija = function(cijenaSad) {
	if (this.tip === 'buy') {
		let prihod = this.base * cijenaSad;
		memorija[this.portfolio][this.quoteTiker] += prihod;
	} else if (this.tip === 'sell') {
		let prihod = this.quote / cijenaSad;
		memorija[this.portfolio][this.baseTiker] += prihod;
	}
}

// KLASA ZA TRAILERE
function Trailer(trailerData) {
	this.portfolio = trailerData.portfolio;
	this.id = trailerData.id;				// izvorna pozicija
	this.cijena = trailerData.cijena;		// ulazna cijena pozicije
	this.odmak = trailerData.odmak;			// odmak trailera (pozitivan ili negativan)
	this.gdjeSam = this.cijena + this.odmak;	// na kojoj cijeni je trenutno trailing stop
	/* Kad se trailer inicira, postavlja se s odmakom od cijene. 
	Svaki candle zovemo svim Trailerima metodu .korekcija koja podešava trailing stop. */
}
  
// METODA ZA KOREKCIJU TRAILERA
Trailer.prototype.korekcija = function korekcija(cijenaSad) {
	let trenutnaUdaljenost = cijenaSad - this.gdjeSam;
	// logičke konstrukcije za čitkiji algoritam
	let pratimOdozdo = (this.odmak < 0);
	let pratimOdozgo = (this.odmak > 0);
	let iznadCijeneSam = (cijenaSad < this.gdjeSam);
	let ispodCijeneSam = (cijenaSad > this.gdjeSam);
	let cijenaMeTriggerala = (pratimOdozdo && iznadCijeneSam) || (pratimOdozgo && ispodCijeneSam);
	let cijenaMiJePobjegla = (Math.abs(trenutnaUdaljenost) > Math.abs(this.odmak));
	// algoritam korekcije
	if (cijenaMiJePobjegla) {
		this.gdjeSam = cijenaSad + this.odmak;
	} else if (cijenaMeTriggerala) {
		memorija[this.portfolio].pozicije[this.id].likvidacija(cijenaSad);
	}
}

// DOPUNITI OVAJ API S PRECIZNO DEFINIRANIM PROPERTYJIMA

/*
PODACI ZA TRAILERE
trailerData = {
	id: (id pozicije),
	cijena: 740.40, 
	odmak: -5.30  
}
*/

/*
PODACI ZA POZICIJE
pozData = {
	portfolio
	tip: 'buy', (ili 'sell')
	market: 'ETH/EUR',
	base: 2.345, 
	quote: 756.78,  
	stop: 780.50
}
*/

/*
PODACI ZA LIMIT ORDERE
limitData = {
	portfolio
	tip: 'buy', (ili 'sell')
	market: 'ETH/EUR',
	iznos: 2.345,
	limitCijena: 756.78
}
*/
