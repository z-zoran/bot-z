"use strict";

const fs = require('fs');

const agroPotok = require('./agroPotok.js');

// CONFIGURACIJA ZA DOLAZNI POTOK
const mod = 'simulacija' // ili 'trening-aps' ili 'trening-log'
const inputter = fs.createReadStream('exchdata/testdata.csv');
const rezolucija = 1;
const inSize = 15;
const outSize = 2;
const prosirenje = 1;

const potok = agroPotok.agro(mod, inputter, rezolucija, inSize, outSize, prosirenje);

let reci = new Promise(function(resolve, reject) {
})

//setTimeout(reci, 1000);

console.log(potok.read().minuta);
