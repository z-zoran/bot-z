"use strict";

/*--------------------------GLAVNI MODUL------------------------------*/
/*----------------------koji nezaustavljivo---------------------------*/
/*-------------------trči u nove radne pobjede------------------------*/
/*----------i testira strategije na povjesnim podacima----------------*/



/*----------------------------REQUIRE---------------------------------*/

/*-------------------standardni node.js moduli------------------------*/

const fs = require('fs');

/*---------------------kastom zoki.js moduli--------------------------*/

let agro = require('./agregator.js');
let strat = require('./strategos.js');
let pisalo = require('./pisalo.js');
let memorija = require('./memorija.js');
let klas = require('./klasnaBorba.js');
let devijacija = require('./indikator.js');

/*---------------------VARIJABLE--------------------------*/


let putanja = './exchdata/testdata.csv';
// testni trejdovi i kendlovi
let paketKendlova = agro(putanja);

let portfolio = new klas.Portfolio('001', 1000, 3, 0, 0, 0);

let jahanje = strat.stratJahanjeCijene;

/*---------------------algoritam--------------------------*/

// definiramo subsete kendlova izvan while-a
let ss1min = [];
let ss5min = [];
let ss15min = [];
// definiramo countere za subsetove
let i1 = 0;
let i5 = 0;
let i15 = 0;
while (paketKendlova.arr1min.length > 0) {
    ss1min.push(paketKendlova.arr1min.shift());
    i1++;
    if (i1 % 5 === 0) {
        ss5min.push(paketKendlova.arr5min.shift())
        i5++;
    }
    if (i1 % 15 === 0) {
        ss15min.push(paketKendlova.arr15min.shift())
        i15++;
    }
    if (ss15min.length < 20) {
        continue;
    }
    let dev5 = devijacija(ss5min, 20);
    let dev15 = devijacija(ss15min, 20);
    let odmakPhi = dev5;
    let odmakLambda = dev5;
    let odmakTau = dev5 / 3;
    let kendlic = ss1min[ss1min.length - 1];
    let iznos = 0.01;
    let cijenaSad = kendlic.C;
    let vrijemeSad = kendlic.datum + ' ' + kendlic.sat + ':' + kendlic.minuta;
    let poruka = 'Trenutna cijena: ' + vrijemeSad + ' || ' + kendlic.C
    pisalo.pisi(poruka);
    // debug:
    console.log(poruka);
    jahanje(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau);
}

pisalo.end();



