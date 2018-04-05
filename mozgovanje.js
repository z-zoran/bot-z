"use strict";

// IMPORTANJE
let fs = require('fs');
let brain = require('./brain.js');
let agro = require('./agregator.js');
let putanja = './exchdata/testdata.csv';
let paketKendlova = agro(putanja);
let testPutanja = './exchdata/testdata3.csv';
let testPaket = agro(testPutanja);

// CONFIG
const kolikiSet = 20;  // koliki je jedan input + output set za treniranje
const inputSetSize = 19;   // koliki je input set
const outputSetSize = 1;  // koliki je output set
const testSet = 10;    // koliko elemenata izvući prije treninga da bi testirali kasnije
const izvorKendlova = paketKendlova.arr5min;  // odakle čupamo kendlove
const izvorTestKendlova = testPaket.arr5min;  // kendlovi za testiranje (zaseban izvorni testdata)
const kKoef = 1;  // koeficijent za logističku funkciju

// PROVJERA JEL CONFIG DOBAR
if (kolikiSet !== (inputSetSize + outputSetSize)) {
    console.log('EROR!!1 NIJE DOBRO PODEŠEN CONFIG')
}

// FUNKCIJE

// funkcija vraća odnos 3 broja kao faktor (od 0 do 1)
function odnosTriBroja(gornja, srednja, donja) {
    let cijeliRaspon = gornja - donja;
    let donjiRaspon = srednja - donja;
    let faktor = donjiRaspon / cijeliRaspon;
    return faktor;
}

// MAPIRANJE CIJENE NA [0,1] - LOGISTIČKA FUNKCIJA
function logFunkcija(x) {
    let y = (1 / (1 + (Math.E ** (-kKoef * x))));
    return y;
}

// MAPIRANJE [0,1] NA CIJENU - ANTI-LOGISTIČKA FUNKCIJA
function odLogFunkcija(y) {
    let x = (Math.log((1-y) / y) / (-kKoef));
    return x;
}

// UZETI KENDLOVE, MAPIRATI RAZLIKU NA [0,1]
function logCijena(kendl0, kendl1) {
    let razlika = kendl0.C - kendl1.C;
    return logFunkcija(razlika);
}

// UZETI [0,1], VRATITI RAZLIKU U CIJENI
function odLogCijena(normRazlika) {
    return odLogFunkcija(normRazlika);
}

// FORMATIRANJE SETA ZA NN
function jedanSetZaNN(array) {
    let ioSet = {
        input: [],
        output: []
    }
    let zbrojBuyVol = 0;
    let zbrojSellVol = 0;
    for (let i = 1; i < inputSetSize; i++) {
        let kendl = array[i];
        zbrojBuyVol += kendl.volBuyeva;
        zbrojSellVol += kendl.volSellova;
    }
    let br = 1;
    for (let i = 1; i < inputSetSize; i++) {
        let kendl0 = array[br];
        let kendl1 = array[br-1];
        ioSet.input.push(logCijena(kendl0, kendl1))
        ioSet.input.push(kendl0.volBuyeva / zbrojBuyVol);
        ioSet.input.push(kendl0.volSellova / zbrojSellVol);
        br++;
    }
    for (let i = 0; i < outputSetSize; i++) {
        let kendl0 = array[br];
        let kendl1 = array[br-1];
        ioSet.output.push(logCijena(kendl0, kendl1))
        br++;
    }
    return ioSet;
}

function arraySetovaZaNN(izvor) {
    let siroviArray = [];
    let ioArray = [];
    let idSet = 0;
    while (izvor.length > kolikiSet) {
        siroviArray[idSet] = [];
        for (let i = 0; i < kolikiSet; i++) {
            siroviArray[idSet].push(izvorKendlova.shift());
        }
        idSet++;
    }
    for (let i = 0; i < siroviArray.length; i++) {
        ioArray[i] = jedanSetZaNN(siroviArray[i]);
    }
    return ioArray;
}

// rendomiziramo ioArray (neki algoritam s interneta, Fisher-Yates)
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function testiranje(array, mozak) {
    let sumaRazlika = 0;
    for (let i = 0; i < array.length; i++) {
        let testRes = mozak.run(array[i].input);
        let razlika = Math.abs(odLogCijena(testRes[0]) - odLogCijena(array[i].output[0]));
        sumaRazlika += razlika;
    }
    return (sumaRazlika / array.length);
}

// ALGORITAM //

let ioArray = shuffle(arraySetovaZaNN(izvorKendlova));

/*
// čupanje test arraya
let testArray = [];
for (let i = 0; i < testSet; i++) {
    testArray.push(ioArray.shift());
}
*/

// log prije treninga
console.log(ioArray.length);


//let net = new brain.recurrent.RNN();
let net = new brain.NeuralNetwork();

net.train(ioArray, {log:true, logPeriod:100});
//console.log(net.train(ioArray));

ioArray = [];
ioArray = arraySetovaZaNN(izvorTestKendlova);

console.log(testiranje(ioArray, net));

/*
let jsonMozak = net.toJSON();
fs.writeFileSync('./mozak.json', JSON.stringify(jsonMozak));
*/



/*
for (let i = 0; i < testArray.length; i++) {
    let output = net.run(testArray[i].input);
    console.log(i + ' Projekcija  -> ' + output[0].toFixed(2));
    console.log(i + ' Stvarnost   -> ' + testArray[i].output[0].toFixed(2));
    console.log('');
} */