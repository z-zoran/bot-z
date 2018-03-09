"use strict";

<<<<<<< HEAD
// Library s nultom pozicijom. To je de facto portfolio iz kojeg stvaramo nove pozicije, i u koji se vraćaju slobodne pozicije.

// Prebaciti metode za stvaranje pozicija ovdje.
// Objekt Pozicija ostati će za potrebe logiranja ali neće imati svoje metode.


// vučemo iz pozzy-ja
=======
// Library s nultom pozicijom

>>>>>>> afc4dd989a71c17b832c21e3311d9834588e0575
let pozzy = require('./zPozzy.js');
let memorija = require('./zMemy.js');

<<<<<<< HEAD


let svePozicijeIkada = pozzy.svePozicijeIkada;
let sviLimitTriggeri = pozzy.sviLimitTriggeri;
let sviStopTriggeri = pozzy.sviStopTriggeri;
let sviTrailingStopovi = pozzy.sviTrailingStopovi;
=======
let svePozicijeIkada = memorija.pozicije;
let sviLimitTriggeri = memorija.limiti;
let sviStopTriggeri = memorija.stopovi;
let sviTrailingStopovi = memorija.traileri;
>>>>>>> afc4dd989a71c17b832c21e3311d9834588e0575

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
	let base = limitData.market.split('-')[0];
	let quote = limitData.market.split('-')[1];
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
			console.log('SELL LIMIT POSTAVLJEN. Market: ' + limitData.market + ', iznos: ' + limitData.iznos + ', limit cijena: ' + limitData.limitCijena);
		}
	} else {
		console.log('Error! limitData nije dobro formatiran.')
	}
}

NultaPozicija.prototype.ubiLimit = function ubiLimit(idLimita) {
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

