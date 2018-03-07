"use strict";

// Library s pozicijama.


// assignamo sve varijable, funkcije i klase u objekt "pozzy" koji ćemo module.exportati na kraju
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