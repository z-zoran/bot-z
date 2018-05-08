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
    console.log('provjeri trailere ' + ' ' + portfolio.EUR + '€');
    portfolio.provjeriTrailere(cijenaSad);
    console.log('obavi killove ' + ' ' + portfolio.EUR + '€');
    portfolio.obaviKillove(cijenaSad, koefKappa);
    console.log('provjeri limite ' + ' ' + portfolio.EUR + '€');
    portfolio.provjeriLimite(cijenaSad, iznos, odmakLambda, odmakPhi);
    console.log('provjeri stopove ' + ' ' + portfolio.EUR + '€');
    portfolio.provjeriStopove(cijenaSad, odmakTau);
    console.log('korigiraj limite ' + ' ' + portfolio.EUR + '€');
    portfolio.korigirajLimite(cijenaSad, iznos, odmakLambda)
    console.log('kraj jahanja ' + ' ' + portfolio.EUR + '€');

    // sve smo izvadili u klasnaBorba.js
    // ovdje samo zovemo metode
} 

module.exports = strat;