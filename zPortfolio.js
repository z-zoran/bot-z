"use strict";

// Library s klasama. WIP
// portfolio pozicija je ustvari portfolio u koji vraćamo sve slobodne pozicije.

let pozzy = require('./zPozzy.js');
let memorija = require('./zMemy.js');
let pisalo = require('./zLoggy.js');

/*
Neka osnovna logika je slijedeća:
- Portfolio postavlja/ubija limitOrdere.
	(njihova vrijednost se insta oduzima/dodaje od nultoj poziciji)
	- LimitOrderi kod triggeranja se samo-ubijaju i stvaraju Poziciju i StopTrigger
		- StopTrigger se kod triggeranja samo-ubija i stvara Trailer.
			- Trailer se kod triggeranja samo-ubija, ubija i Poziciju i hrani njen iznos natrag u nultu poziciju.


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
/*
PODACI ZA LIMIT ORDERE
limitData = {
	tip: 'buy', (ili 'sell')
	market: 'ETH/EUR',
	iznos: 2.345,
	limitCijena: 756.78
}
*/

// KLASA ZA LIMIT ORDERE
function LimitOrder(id, limitData) {
	this.id = id;	
	this.tip = limitData.tip;
	this.market = limitData.market;
	this.iznos = limitData.iznos;
	this.limitCijena = limitData.limitCijena;
	this.umnozak = limitData.iznos * limitData.limitCijena;
}

// METODA ZA POSTAVLJANJE LIMITA
Portfolio.prototype.postLimit = function postLimit(limitData) {
	memorija.limiti[limitData.tip] = {};	// iniciramo novi ili brišemo stari limit
	this.limitCounter += 1; 	// povečavamo counter za limit id
	let counterString = (this.limitCounter.toString()).padStart(6, "0");
	let base = limitData.market.split('/')[0];
	let quote = limitData.market.split('/')[1];
	let umnozak = limitData.iznos * limitData.limitCijena;
	let poruka = '';
	if (limitData.tip === 'buy') {
		// provjera imamo li dovoljno quote u NultojPoziciji za kupiti base
		if (this[quote] < umnozak) {
			poruka = 'BANKROT! Nema dovoljno quote-a za postavljanje buy limita. LimitID: ' + counterString;
		} else {
			// exchange komunikacija
			this[quote] -= umnozak;
			memorija.limiti.buy = new limitOrder(this.limitCounter, limitData);
			poruka = 'BUY LIMIT POSTAVLJEN. LimitID: ' + counterString + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena;
		}
	} else if (limitData.tip === 'sell') {
		// provjera imamo li dovoljno base u NultojPoziciji za prodaju 
		if (this[base] < iznos) {
			poruka = 'BANKROT! Nema dovoljno base-a za postavljanje sell limita. LimitID: ' + counterString;
		} else {
			// exchange komunikacija
			this[base] -= limitData.iznos;
			memorija.limiti.sell = new limitOrder(this.limitCounter, limitData);
			poruka = 'SELL LIMIT POSTAVLJEN. LimitID: ' + counterString + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena;
		}
	} else {
		poruka = 'ERROR! limitData nije dobro formatiran. LimitID: ' + counterString;
	}
	pisalo.pisi(poruka);
}

// METODA ZA UBIJANJE LIMITA
Portfolio.prototype.ubiLimit = function ubiLimit(koji) {
    // exchange komunikacija
	if (koji === 'buy') {
		this.quote += memorija.limiti.buy.umnozak;
	} else if (koji === 'sell') {

	}
	delete memorija.limiti[koji];

}

/*
PODACI ZA POZICIJE
pozData = {
	tip: 'buy', (ili 'sell')
	market: 'ETH/EUR',
	kupljeno: 2.345, (ako je 'buy' onda su ETH, ako je sell onda su 'EUR')
	prodano: 756.78  (obratno od prodano! valuta ovisi o tome jel buy ili sell...)
}
*/

// KLASA ZA POZICIJE
function Pozicija(id, pozData) {
	this.id = id;	
	this.tip = pozData.tip;
	this.market = pozData.market;
	this.kupljeno = {};
	this.prodano = {};

}

// KLASA ZA STOP TRIGGERE
function StopTrigger(stopData) {
	
}

// KLASA ZA TRAILERE
function Trailer(trailerData) {

}