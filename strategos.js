"use strict";

// Library sa strategijama
// Logika koja se vrti sa svakom novom informacijom s burze.

/*-------------------REQUIRE------------------*/

let memorija = require('./memorija.js');
let pisalo = require('./pisalo.js');

// definiramo module.exports objekt "strat" u koji ćemo sve trpati 
let strat = {};

/*-----------------------STRATEGIJA: JAHANJE CIJENE-----------------------*/
// THE strategija
strat.stratJahanjeCijene = function stratJahanjeCijene(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau, koefKappa) {  // strategija za jahanje cijene 
    portfolio.provjeriTrailere(cijenaSad);
    portfolio.obaviKillove(cijenaSad, koefKappa);
    portfolio.provjeriLimite(cijenaSad, iznos, odmakLambda, odmakPhi);
    portfolio.provjeriStopove(cijenaSad, odmakTau);
    portfolio.korigirajLimite(cijenaSad, iznos, odmakLambda)

    // sve smo izvadili u klasnaBorba.js
    // ovdje samo zovemo metode
} 

module.exports = strat;