"use strict";

// Tu držimo evidenciju o svim pozicijama, limitima, stoptriggerima i trailerima.
// tzv. Trčuće varijable.
// Ostali moduli koji trebaju čitati/pisati te podatke, require-aju ovaj modul.

let memorija = {
    portfoliji: {
        pozicije: {},
        limiti: {},
        traileri: {}
    }
}

module.exports = memorija;
