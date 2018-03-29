"use strict";

// IMPORTANJE
let brain = require('./brain.js');
let agro = require('./agregator.js');
let putanja = './exchdata/testdata.csv';
let paketKendlova = agro(putanja);

// CONFIG
let kolikiSet = 10;
let inputSet = 9;
let outputSet = 1;

// PROVJERA JEL CONFIG DOBAR
if (kolikiSet !== (inputSet + outputSet)) {
    console.log('EROR!!1 NIJE DOBRO PODEŠEN CONFIG')
}

// INICIJALIZACIJA VARIJABLI
let setArray = [];
let idSet = 0;

// ALGORITAM //

// čupanje iz agro paketa
while (paketKendlova.arr1min.length > kolikiSet) {
    setArray[idSet] = [];
    for (let i = 0; i < kolikiSet; i++) {
        setArray[idSet].push(paketKendlova.arr1min.shift());
    }
    idSet++;
}

// data normalizacija
// prolazimo kroz sve setove
for (let i = 0; i < setArray.length; i++) {
    // sad smo u jednom setu i treba ga normalizirati na vrijednosti od 0 do 1
    // radimo to na dva načina, ovisno o tome je li normaliziramo cijenu ili volumen
    // cijenu normaliziramo ovako:
        // nađemo najveću razliku L i H za cijeli set (uključujući output)
        // onda sve ostale cijene prikazujemo kao postotak unutar te razlike
    // volumen normaliziramo ovako:
        // zbrojimo sve volumene (zasebno buy i sell) za cijeli set (bez outputa)
        // onda taj zbroj gledamo kao 100% i prikazujemo pojedine volumene kao postotke
    // u konačnici treba rezultat formatirati tako da svaki set izgleda ovako: 
    // {input: [mean0, buyVol0, sellVol0, mean1, buyVol1, sellVol1, ..., mean8, buyVol8, sellVol8], output: [mean9]}
    let zbrojBuyVol = 0;
    let zbrojSellVol = 0;
    let hSeta = 0;
    let lSeta = 10000000;
    for (let j = 0; j < setArray[i].length) {
        let kendl = setArray[i][j];
        zbrojBuyVol += kendl.volBuyeva;
        zbrojSellVol += kendl.volSellova;
        if (kendl.H > hSeta) {
            hSeta = kendl.H;
        }
        if (kendl.L < lSeta) {
            lSeta = kendl.L;
        }
    }
    let 

    let kendlMean = ((kendl.H * kendl.volBuyeva) + (kendl.L * Math.abs(kendl.volSellova))) / (kendl.volBuyeva + Math.abs(kendl.volSellova));




}

console.log(setArray.length);







/*
//create a simple feed forward neural network with backpropagation
var net = new brain.NeuralNetwork();

net.train([{input: [0, 0], output: [0]},
           {input: [0, 1], output: [1]},
           {input: [1, 0], output: [1]},
           {input: [1, 1], output: [0]}]);

var output = net.run([1, 0]);  // [0.987]
console.log(output);
*/

/*
var net = new brain.recurrent.RNN();

net.train([{input: [0, 0], output: [0]},
           {input: [0, 1], output: [1]},
           {input: [1, 0], output: [1]},
           {input: [1, 1], output: [0]}]);

var output1 = net.run([0, 0]);  // [0]
let output2 = net.run([0, 1]);  // [1]
let output3 = net.run([1, 0]);  // [1]
let output4 = net.run([1, 1]);  // [0]

console.log(output1, output2, output3, output4);
*/