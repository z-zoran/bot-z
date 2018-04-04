"use strict";

// IMPORTANJE
let brain = require('./brain.js');
let agro = require('./agregator.js');
let putanja = './exchdata/testdata4.csv';
let paketKendlova = agro(putanja);

// CONFIG
let kolikiSet = 15;  // koliki je jedan input + output set za treniranje
let inputSet = 13;   // koliki je input set
let outputSet = 2;  // koliki je output set
let prosirenjeSeta = 1; // za koliko EUR proširujemo high-low raspon input seta
let testSet = 10;    // koliko elemenata izvući prije treninga da bi testirali kasnije
let izvorKendlova = paketKendlova.arr5min;  // odakle čupamo kendlove
let velicinaKanala = 30;    // u slučaju da fiksiramo H-L kanal, kolika mu je veličina

// PROVJERA JEL CONFIG DOBAR
if (kolikiSet !== (inputSet + outputSet)) {
    console.log('EROR!!1 NIJE DOBRO PODEŠEN CONFIG')
}

// INICIJALIZACIJA VARIJABLI
let setArray = [];
let idSet = 0;
let ioArray = [];

// FUNKCIJE

// funkcija vraća odnos 3 broja kao faktor (od 0 do 1)
function odnosTriBroja(gornja, srednja, donja) {
    let cijeliRaspon = gornja - donja;
    let donjiRaspon = srednja - donja;
    let faktor = donjiRaspon / cijeliRaspon;
    return faktor;
}




// ALGORITAM //

// čupanje iz agro paketa
while (izvorKendlova.length > kolikiSet) {
    setArray[idSet] = [];
    for (let i = 0; i < kolikiSet; i++) {
        setArray[idSet].push(izvorKendlova.shift());
    }
    idSet++;
}

// data normalizacija
// prolazimo kroz sve setove
for (let i = 0; i < setArray.length; i++) {
    // sad smo u jednom setu i treba ga normalizirati na vrijednosti od 0 do 1
    // radimo to na dva načina, ovisno o tome je li normaliziramo cijenu ili volumen
    // cijenu normaliziramo ovako:
        // nađemo najniži L i najviši H cijelog input seta, povisimo H i snizimo L za prosirenjeSeta (config vrijednost)
        // onda sve cijene (uključujući output) prikazujemo kao postotak unutar te razlike
    // volumen normaliziramo ovako:
        // zbrojimo sve volumene (zasebno buy i sell) za cijeli input set (bez outputa)
        // onda taj zbroj gledamo kao 100% i prikazujemo pojedine volumene kao postotke
    // u konačnici treba rezultat formatirati tako da svaki set izgleda ovako: 
    // {input: [mean0, buyVol0, sellVol0, mean1, buyVol1, sellVol1, ..., mean8, buyVol8, sellVol8], output: [high9, low9]}
    // ili možda ovako:
    // {input: [high0, low0, buyVol0, sellVol0, high1, low1, buyVol1, sellVol1, ..., high8, low8, buyVol8, sellVol8], output: [high9, low9]}
    ioArray[i] = {
        input: [],
        output: []
    }
    let zbrojBuyVol = 0;
    let zbrojSellVol = 0;
    let highSeta = 0;
    let lowSeta = 10000000;
    // prvo prođemo jedan for da nađemo najviši H i najniži L, te da zbrojimo volumene
    for (let j = 0; j < setArray[i].length; j++) {
        let kendl = setArray[i][j];
        zbrojBuyVol += kendl.volBuyeva;
        zbrojSellVol += kendl.volSellova;
        if (kendl.H > highSeta) {
            highSeta = kendl.H;
        }
        if (kendl.L < lowSeta) {
            lowSeta = kendl.L;
        }
    }

    // treći pristup. gledamo trenutnu cijenu (zadnji kendl) kao centar (0.50)
    let kendl = setArray[i][inputSet - 1]; // zadnji kendl inputa
    let rangeHL = highSeta - lowSeta;
    let kendlMean = ((kendl.H * kendl.volBuyeva) + (kendl.L * Math.abs(kendl.volSellova))) / (kendl.volBuyeva + Math.abs(kendl.volSellova));
    highSeta = kendlMean + rangeHL;
    lowSeta = kendlMean - rangeHL;


    // proširimo H-L range za prosirenjeSeta (config vrijednost)
    /*
    highSeta += prosirenjeSeta;
    lowSeta -= prosirenjeSeta; 
    */

    // alternativno, uzmemo fiksan kanal pa onda unutar njega prikazujemo cijene.
    // na ovaj način, trebali bi dobiti konzistentnije cijene (neće biti uvjetovane varijacijom H-L)
    // možda će dolaziti do curenja (cijena izvan predodređenog kanala), treba obratiti pozornost
    /*
    let rangeSeta = highSeta - lowSeta;
    if (rangeSeta > velicinaKanala) {console.log('EROR! H-L varijacija seta je prevelika. Rezultati nisu dobri. Povećaj kanal. (velicinaKanala)')}
    let razlika = velicinaKanala - rangeSeta;
    prosirenjeSeta = razlika / 2;
    highSeta += prosirenjeSeta;
    lowSeta -= prosirenjeSeta; 
    */

    // slaganje input seta
    let br = 0;
    for (let j = 0; j < inputSet; j++) {
        let kendl = setArray[i][j];
        /* možda vratiti na samo mean a ne H i L, ovisi šta daje bolje rezultate */
        let kendlMean = ((kendl.H * kendl.volBuyeva) + (kendl.L * Math.abs(kendl.volSellova))) / (kendl.volBuyeva + Math.abs(kendl.volSellova));
        
        ioArray[i].input.push(odnosTriBroja(highSeta, kendlMean, lowSeta));
       
        /*
        ioArray[i].input.push(odnosTriBroja(highSeta, kendl.H, lowSeta));
        ioArray[i].input.push(odnosTriBroja(highSeta, kendl.L, lowSeta));
        */
        let normBV = (kendl.volBuyeva / zbrojBuyVol);
        ioArray[i].input.push(normBV);
        let normSV = (kendl.volSellova / zbrojSellVol);
        ioArray[i].input.push(normSV);
        br++;
    }

    // slaganje output seta
    for (let j = 0; j < outputSet; j++) {
        let kendl = setArray[i][br];
        let kendlMean = ((kendl.H * kendl.volBuyeva) + (kendl.L * Math.abs(kendl.volSellova))) / (kendl.volBuyeva + Math.abs(kendl.volSellova));
        
        if (kendlMean > highSeta) {
            console.log('Projekcija previsoka, stabiliziram na 1.00');
            ioArray[i].output.push(1);
        } else if (kendlMean < lowSeta) {
            console.log('Projekcija preniska, stabiliziram na 0.00');
            ioArray[i].output.push(0);
        } else {
            ioArray[i].output.push(odnosTriBroja(highSeta, kendlMean, lowSeta));
        }
        /*
        ioArray[i].output.push(odnosTriBroja(highSeta, kendl.H, lowSeta));
        ioArray[i].output.push(odnosTriBroja(highSeta, kendl.L, lowSeta));
        */

        br++;
    }
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

ioArray = shuffle(ioArray);

// čupanje test arraya
let testArray = [];
for (let i = 0; i < testSet; i++) {
    testArray.push(ioArray.shift());
}

// log prije treninga
console.log(ioArray.length);


//let net = new brain.recurrent.RNN();
let net = new brain.NeuralNetwork();

net.train(ioArray, {log:true, logPeriod:100});
//console.log(net.train(ioArray));
let jsonMozak = net.toJSON();


for (let i = 0; i < testArray.length; i++) {
    let output = net.run(testArray[i].input);
    /*
    console.log(i + ' Projekcija  H:' + (output[0] * 100).toFixed(2) + ' |  H:' + (testArray[i].output[0] * 100).toFixed(2) + '  Stvarnost');
    console.log(i + '             L:' + (output[1] * 100).toFixed(2) + ' |  L:' + (testArray[i].output[1] * 100).toFixed(2));
    */
    console.log(i + ' Projekcija  -> ' + (output[0] * 100).toFixed(2) + ' -> ' + (output[1] * 100).toFixed(2));
    console.log(i + ' Stvarnost   -> ' + (testArray[i].output[0] * 100).toFixed(2) + ' -> ' + (testArray[i].output[1] * 100).toFixed(2));
    console.log('');
}