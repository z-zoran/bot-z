"use strict";

// Tu držimo evidenciju o svim pozicijama, limitima, stoptriggerima i trailerima.
// tzv. Trčuće varijable.
// Ostali moduli koji trebaju čitati/pisati te podatke, require-aju ovaj modul.
/*
let memorija = {
    portfoliji: {
        pozicije: {},
        limiti: {},
        traileri: {}
    }
}
*/
let memorija = {};




// memorija.001.pozicije.0001.tip
// memorija.001.limitCounter
// itd...

module.exports = memorija;
