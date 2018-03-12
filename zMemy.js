"use strict";

// Tu držimo evidenciju o svim pozicijama, limitima, stoptriggerima i trailerima.
// tzv. Trčuće varijable.
// Ostali moduli koji trebaju čitati/pisati te podatke, require-aju ovaj modul.

let memorija = {
    pozicije: {},
    limiti: {},
    stopovi: [],
    traileri: []
}

module.exports = memorija;

/*
LIMIT TRIGGERI DOLAZE U SLIJEDEĆEM FORMATU:
memorija.limiti: {
    buy: limitOrder objekt, 
    sell: limitOrder objekt
}
*/

/*
STOP TRIGGERI DOLAZE U SLIJEDEĆEM FORMATU:
memorija.stopovi: [
    0: stopTrigger objekt,
    1: stopTrigger objekt,
    2: stopTrigger objekt,
    (...)
]
*/