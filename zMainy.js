"use strict";

/*--------------------------GLAVNI MODUL------------------------------*/
/*----------------------koji nezaustavljivo---------------------------*/
/*-------------------trči u nove radne pobjede------------------------*/
/*----------i testira strategije na povjesnim podacima----------------*/



/*----------------------------REQUIRE---------------------------------*/

/*-------------------standardni node.js moduli------------------------*/

const fs = require('fs');

/*---------------------kastom zoki.js moduli--------------------------*/

const agro = require('./zoki-agro.js');
const stratty = require('./zStratty.js');
const pisalo = require('./zLoggy.js');
let memorija = require('./zMemy.js');
let nulta = require('./zNulty.js');

/*---------------------VARIJABLE--------------------------*/


let putanja = './exchdata/testdata.txt';
// testni trejdovi i kendlovi
let paketKendlova = agro(putanja);

/*---------------------algoritam--------------------------*/

function stratWrapper(kendl) {
    let cijena = kendl.C;
    pisalo.pisi();
    pisalo.pisi();


}

for (let i = 0; i < paketKendlova.arr1min.length; i++) {
    // izdvajamo pojedini kendl
    let jednoKendlo = paketKendlova.arr1min[i];
    pisalo.pisi(jednoKendlo);
    // šaljemo kendl u wrapper koji feeda strategiju s H i L
    stratWrapper(jednoKendlo);

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

let devijacije = indi.zDev(kendlovi.k5min, 20);
// šaljemo kendlove iz -agro u -indi da dobijemo devijacije za svaki kendl
