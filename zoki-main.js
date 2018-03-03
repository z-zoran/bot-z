"use strict";

/*--------------------------GLAVNI MODUL------------------------------*/
/*----------------------koji nezaustavljivo---------------------------*/
/*-------------------trči u nove radne pobjede------------------------*/
/*----------i testira strategije na povjesnim podacima----------------*/



/*----------------------------REQUIRE---------------------------------*/

/*-------------------standardni node.js moduli------------------------*/

const http = require('http');
const fs = require('fs');
const events = require('events');


/*---------------------kastom zoki.js moduli--------------------------*/

const agro = require('./zoki-agro.js');
const stratty = require('./zoki-strat.js');
const plotty = require('./zoki-plot.js');

/*---------------------varijable--------------------------*/

const kendlEmitter = new events.EventEmitter(); // ovaj emitira kendlove
kendlEmitter.on('kendl', )

// testni materijal
let putanja = './exchdata/testdata.txt';
// testni trejdovi i kendlovi
let paketKendlova = agro(putanja);

// glavni testing loop
for (let i = 0; i < 20000; i++) {
    let jednoMaloKendlo = paketKendlova.arr1min[i];
    kendlEmitter.emit('kendl');
}


// kad se pojavi novi kendl, zovemo slijedeće module
kendlEmitter.on('kendl', modulOvaj);
kendlEmitter.on('kendl', modulOnaj);
kendlEmitter.emit('kendl');

let devijacije = indi.zDev(kendlovi.k5min, 20);
// šaljemo kendlove iz -agro u -indi da dobijemo devijacije za svaki kendl

// treba ovo sad osmisliti, main bi trebao čitati kendlove i onda ih feedati strategiji

function bekTester() {
    // učitamo neki period trejda
    // izkendlamo ga 
    // složit emiter i listener
    // složimo setTimeout funkciju da svakih t milisekundi emita kendl
    // strategija se odvrti sa svakim kendlom
    // postavit ćemo da stratty emitira komande prema burzi
    // 
}

