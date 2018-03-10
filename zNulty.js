"use strict";

// Library s nultom pozicijom
// Nulta pozicija je ustvari portfolio u koji vraćamo sve slobodne pozicije.

let pozzy = require('./zPozzy.js');
let memorija = require('./zMemy.js');

let svePozicijeIkada = memorija.pozicije;
let sviLimitTriggeri = memorija.limiti;
let sviStopTriggeri = memorija.stopovi;
let sviTrailingStopovi = memorija.traileri;

let NultaPozicija = function NultaPozicija(eur, eth, btc, ltc, bch) {
	this.eur = eur;
	this.eth = eth;
	this.btc = btc;
	this.ltc = ltc;
	this.bch = bch;
}
/*
PODACI
limitData = {
	tip: 'buy', (ili 'sell')
	market: 'eth-eur',
	iznos: 2.345,
	limitCijena: 756.78
}

*/
NultaPozicija.prototype.postLimit = function postLimit(limitData) {
	let base = limitData.market.split('/')[0];
	let quote = limitData.market.split('/')[1];
	let umnozak = limitData.iznos * limitData.limitCijena;
	if (limitData.tip === 'buy') {
		// provjera imamo li dovoljno quote u NultojPoziciji za kupiti base
		if (this[quote] < umnozak) {
			console.log('Error! Nema dovoljno quote-a za postavljanje buy limita. Market: ' + limitData.market);
		} else {
			// exchange komunikacija
			this[quote] -= umnozak;
			sviLimitTriggeri.buy = {};
			sviLimitTriggeri.buy.cijenaLimit = limitData.limitCijena;
			console.log('BUY LIMIT POSTAVLJEN. Market: ' + limitData.market + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena);
		}
	} else if (limitData.tip === 'sell') {
		// provjera imamo li dovoljno base u NultojPoziciji za prodaju 
		if (this[base] < iznos) {
			console.log('Error! Nema dovoljno base-a za postavljanje sell limita. Market: ' + limitData.market);
		} else {
			// exchange komunikacija
			this[base] -= limitData.iznos;
			sviLimitTriggeri.sell = {};
			sviLimitTriggeri.sell.cijenaLimit = limitData.limitCijena;
			console.log('SELL LIMIT POSTAVLJEN. Market: ' + limitData.market + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena);
		}
	} else {
		console.log('Error! limitData nije dobro formatiran.')
	}
}

NultaPozicija.prototype.ubiLimit = function ubiLimit(koji) {
    // exchange komunikacija

}

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

