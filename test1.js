let util = require('./util.js');
let logFunkcija = util.logFunkcija;
let odLogFunkcija = util.odLogFunkcija;

let broj = 37;
let koef = 1;
let a = logFunkcija(broj, koef);
let b = odLogFunkcija(a, koef);

console.log(a + ' ' + b);