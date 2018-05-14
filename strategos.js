"use strict";

// Library sa strategijama
// Logika koja se vrti sa svakom novom informacijom s burze.

/*-------------------REQUIRE------------------*/

let memorija = require('./memorija.js');
// let pisalo = require('./pisalo.js');

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

/*-----------------------STRATEGIJA: EMA PROBLEMA-------------------------*/
strat.emaProblema = function emaProblema(portfolio, cijenaSad, iznos) {
    /*
        pratimo 6 EMA indikatora: 5, 8, 13, 21, 34, 55 (dobar stari Fibo)
        ustvari pratimo kanale između susjednih EMA-i (5_8, 8_13, 13_21, 21_34, 34_55)
            (kanal = manji EMA - veći EMA)
        svaki put kad kanal promjeni predznak, 


    */
    // provjeri svaki od kanala kako stoji
        // složiti emaSet koji drži povijest svih kanala duljine duljinaCharta
    // ako je neki promjenio predznak, aktiviraj order
    // 
}

module.exports = strat;