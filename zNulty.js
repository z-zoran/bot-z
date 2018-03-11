"use strict";

// Library s nultom pozicijom
// Nulta pozicija je ustvari portfolio u koji vraćamo sve slobodne pozicije.

let pozzy = require('./zPozzy.js');
let memorija = require('./zMemy.js');
let pisalo = require('./zLoggy.js');

// KLASA ZA NULTU POZICIJU
const NultaPozicija = function NultaPozicija(eur, eth, btc, ltc, bch) {
	this.EUR = eur;
	this.ETH = eth;
	this.BTC = btc;
	this.LTC = ltc;
	this.BCH = bch;
	this.limitCounter = 0;
	this.stopCounter = 0;
	this.trailerCounter = 0;
}
/*
PODACI ZA LIMIT ORDERE
limitData = {
	tip: 'buy', (ili 'sell')
	market: 'eth-eur',
	iznos: 2.345,
	limitCijena: 756.78
}
*/

// KLASA ZA LIMIT ORDERE
const limitOrder = function limitOrder(id, limitData) {
	this.id = id;	
	this.tip = limitData.tip;
	this.market = limitData.market;
	this.iznos = limitData.iznos;
	this.limitCijena = limitData.limitCijena;
	this.umnozak = limitData.iznos * limitData.limitCijena;
}

// METODA ZA POSTAVLJANJE LIMITA
NultaPozicija.prototype.postLimit = function postLimit(limitData) {
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
NultaPozicija.prototype.ubiLimit = function ubiLimit(koji) {
    // exchange komunikacija
	delete memorija.limiti[koji];
}

// KLASA ZA STOP TRIGGERE
const stopTrigger = function stopTrigger() {
	
}

// METODA ZA POSTAVLJANJE STOP TRIGGERA
NultaPozicija.prototype.postStopTrig = function postStopTrig() {
	// exchange komunikacija

}

NultaPozicija.prototype.ubiStopTrig = function ubiStopTrig() {
    // exchange komunikacija

}

NultaPozicija.prototype.postTrailer = function postTrailer() {
    // exchange komunikacija

}

NultaPozicija.prototype.ubiTrailer = function ubiTrailer() {
    // exchange komunikacija

}

