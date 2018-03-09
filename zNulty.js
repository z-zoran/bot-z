"use strict";

// Library s nultom pozicijom. To je de facto portfolio iz kojeg stvaramo nove pozicije, i u koji se vraćaju slobodne pozicije.

// Prebaciti metode za stvaranje pozicija ovdje.
// Objekt Pozicija ostati će za potrebe logiranja ali neće imati svoje metode.


// vučemo iz pozzy-ja
let pozzy = require('./zPozzy.js');



let svePozicijeIkada = pozzy.svePozicijeIkada;
let sviLimitTriggeri = pozzy.sviLimitTriggeri;
let sviStopTriggeri = pozzy.sviStopTriggeri;
let sviTrailingStopovi = pozzy.sviTrailingStopovi;

let NultaPozicija = function NultaPozicija(eur, eth, btc, ltc, bch) {
	this.eur = eur;
	this.eth = eth;
	this.btc = btc;
	this.ltc = ltc;
	this.bch = bch;
}

NultaPozicija.prototype.postaviLimit = function postaviLimit(tiker, iznos, tip) {
    // exchange komunikacija
    

}

NultaPozicija.prototype.povuciLimit = function povuciLimit(tiker, iznos, tip) {
    // exchange komunikacija

}