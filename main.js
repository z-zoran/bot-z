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
let stratty = require('./strategos.js');
let pisalo = require('./pisalo.js');
let memorija = require('./memorija.js');
let klas = require('./klasnaBorba.js');

/*---------------------VARIJABLE--------------------------*/


let putanja = './exchdata/testdata.txt';
// testni trejdovi i kendlovi
let paketKendlova = agro(putanja);

let portfolio = new klas.Portfolio('001', 1000, 3, 0, 0, 0);

let jahanje = stratty.stratJahanjeCijene;

/*---------------------algoritam--------------------------*/




let devijacije = indi.zDev(kendlovi.k5min, 20);
// šaljemo kendlove iz -agro u -indi da dobijemo devijacije za svaki kendl

// definiramo subsete izvan for-a
let ss1min = [];
let ss5min = [];
let ss15min = [];
for (let i = 0; i < paketKendlova.arr1min.length; i++) {
    ss1min.push(paketKendlova.arr1min[i]);
    if (i % 5 === 0) {
        ss5min.push(paketKendlova.arr5min // dovršiti pušanje kendlova u subsete. )
    }
    if (i % 15 === 0) {

    }
    if (i < 100) {
        continue;
    }
    // izdvajamo pojedini kendl
    let jednoKendlo = paketKendlova.arr1min[i];
    pisalo.pisi('Ovaj kendl: ' + jednoKendlo);
    // fidamo kendl u strategiju
    let cijenaSad = jednoKendlo.C;
    jahanje(portfolio, cijenaSad, );
}

pisalo.end();

/*
agro-aj cijeli sample
feed-aj kendl po kendl
algoritam svaki kendl provjerava jel nešto trigerano
    i podešava sve šta treba.
ako je u jednom kendlu trigeran gornji limit, provjeriti je li u istom kendlu trigeran donji limit.
ako su trigerana oba, onda javiti 
*/

