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
	- LimitOrderi kod triggeranja se samo-ubijaju i stvaraju Poziciju i StopTrigger
		- StopTrigger se kod triggeranja samo-ubija i stvara Trailer.
			- Trailer se kod triggeranja samo-ubija, ubija i Poziciju i hrani njen iznos natrag u Portfolio.


*/

// KLASA ZA PORTFOLIO
function Portfolio(eur, eth, btc, ltc, bch) {
	this.EUR = eur;
	this.ETH = eth;
	this.BTC = btc;
	this.LTC = ltc;
	this.BCH = bch;
	this.pozCounter = 0;
	this.limitCounter = 0;
	this.stopCounter = 0;
	this.trailerCounter = 0;
}


// METODA ZA POSTAVLJANJE LIMITA
Portfolio.prototype.postLimit = function postLimit(limitData) {
	memorija.limiti[limitData.tip] = {};	// iniciramo novi ili brišemo stari limit
	this.limitCounter += 1; 	// povečavamo counter za limit id
	let limitCounterString = (this.limitCounter.toString()).padStart(6, "0");
	let baseTiker = limitData.market.split('/')[0];
	let quoteTiker = limitData.market.split('/')[1];
	let umnozak = limitData.iznos * limitData.limitCijena;
	let poruka = '';
	if (limitData.tip === 'buy') {
		// provjera imamo li dovoljno quote u NultojPoziciji za kupiti base
		if (this[quoteTiker] < umnozak) {
			poruka = 'BANKROT! Nema dovoljno quote-a za postavljanje buy limita. LimitID: ' + limitCounterString;
		} else {
			// exchange komunikacija
			this[quoteTiker] -= umnozak;
			memorija.limiti.buy = new limitOrder(limitCounterString, limitData);
			poruka = 'BUY LIMIT POSTAVLJEN. LimitID: ' + limitCounterString + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena;
		}
	} else if (limitData.tip === 'sell') {
		// provjera imamo li dovoljno base u NultojPoziciji za prodaju 
		if (this[baseTiker] < iznos) {
			poruka = 'BANKROT! Nema dovoljno base-a za postavljanje sell limita. LimitID: ' + limitCounterString;
		} else {
			// exchange komunikacija
			this[baseTiker] -= limitData.iznos;
			memorija.limiti.sell = new limitOrder(limitCounterString, limitData);
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
		this[quote] += memorija.limiti.buy.umnozak;
		delete memorija.limiti.buy;
		poruka = 'BUY LIMIT UBIJEN.';
	} else if (koji === 'sell') {
		this[base] += memorija.limiti.sell.iznos;
		delete memorija.limiti.sell;
		poruka = 'SELL LIMIT UBIJEN.'
	}
	pisalo.pisi(poruka);
}

// METODA ZA REALIZACIJU LIMIT ORDERA, ODNOSNO ZA STVARANJE POZICIJE
Portfolio.prototype.postPoziciju = function postPoziciju(koja) {
	let pozData = {};
	// definiramo pozData za stvaranje nove pozicije.
	pozData.tip = koja;
	pozData.market = memorija.limiti[koja].market;
	pozData.base = memorija.limiti[koja].iznos;
	pozData.quote = memorija.limiti[koja].umnozak;
	
	this.pozCounter += 1; 	// povečavamo counter za id pozicije
	let pozCounterString = (this.pozCounter.toString()).padStart(6, "0");
	let novaPoz = new Pozicija(pozCounterString, pozData);
	memorija.pozicije[pozCounterString] = novaPoz;
	delete memorija.limiti[koja];
}

// KLASA ZA LIMIT ORDERE
function LimitOrder(id, limitData) {
	this.id = id;	
	this.tip = limitData.tip;
	this.market = limitData.market;
	this.base = limitData.market.split('/')[0];
	this.quote = limitData.market.split('/')[1];
	this.iznos = limitData.iznos;
	this.limitCijena = limitData.limitCijena;
	this.umnozak = limitData.iznos * limitData.limitCijena;
}


// KLASA ZA POZICIJE
function Pozicija(id, pozData) {
	this.id = id;	
	this.tip = pozData.tip;	// buy || sell
	this.market = pozData.market;
	this.base = pozData.base;
	this.quote = pozData.quote;
	this.cijena = 
}

// KLASA ZA STOP TRIGGERE
function StopTrigger(id, stopData) {
	this.id = id;
	this.tip = stopData.tip; // iznad || ispod
	
}

// KLASA ZA TRAILERE
function Trailer(id, trailerData) {

}

/*
PODACI ZA STOP TRIGGERE
stopData = {
	pozicija: idPozicije,
	tip: 'buy', (ili 'sell')
	market: 'ETH/EUR',
	base: 2.345, 
	quote: 756.78  
}
*/

/*
PODACI ZA POZICIJE
pozData = {
	tip: 'buy', (ili 'sell')
	market: 'ETH/EUR',
	base: 2.345, 
	quote: 756.78  
}
*/

/*
PODACI ZA LIMIT ORDERE
limitData = {
	tip: 'buy', (ili 'sell')
	market: 'ETH/EUR',
	iznos: 2.345,
	limitCijena: 756.78
}
*/
