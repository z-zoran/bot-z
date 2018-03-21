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

let pfID = '001';
let portfolio = memorija[pfID] = new klas.Portfolio(pfID, 1000, 3, 0, 0, 0);

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
// duljina charta (broj vremenskih jedinica)
let duljinaCharta = 60;

// definiramo chartData paket
let chartData = {};

chartData.close = [];
chartData.gornjiLimit = [];
chartData.donjiLimit = [];
chartData.gornjiStop = [];
chartData.donjiStop = [];
// chartData.trail = []; // za sad izostavljamo trailere, kasnije dodati
chartData.ukupnoEUR = [];

function nadjiStop(portfolio) {
    let pozCounterString;
    // traženje pozicije koja još ima stop 
    for (let i = 0; i <= portfolio.pozCounter; i++) {
        pozCounterString = ((portfolio.pozCounter - i).toString()).padStart(4, "0");
        if (portfolio.pozicije[pozCounterString].stop) {
            break;
        }
    }
    return portfolio.pozicije[pozCounterString].stop;    
}

function chartifikacija(kendl) {
    // input funkciji je jedan kendl
    // čupamo njegov Close
    chartData.close.push(kendl.C);
    chartData.ukupnoEUR.push(portfolio.EUR);
    if (!portfolio.limiti.buy && !portfolio.limiti.sell) {
        chartData.gornjiLimit.push(null);
        chartData.gornjiStop.push(null);
        chartData.donjiLimit.push(null);
        chartData.donjiStop.push(null);
    } else {
        // traženje gornjih točaka
        if (portfolio.limiti.sell) {
            chartData.gornjiLimit.push(portfolio.limiti.sell.limitCijena);
            chartData.gornjiStop.push(null);
        } else if (!portfolio.limiti.sell) {
            chartData.gornjiLimit.push(null);
            chartData.gornjiStop.push(nadjiStop(portfolio));
        }
        // traženje donjih točaka
        if (portfolio.limiti.buy) {
            chartData.donjiLimit.push(portfolio.limiti.buy.limitCijena);
            chartData.donjiStop.push(null);
        } else if (!portfolio.limiti.buy) {
            chartData.donjiLimit.push(null);
            chartData.donjiStop.push(nadjiStop(portfolio));
        }
    }
    // podešavanje chartData da bude dug duljinaCharta
    for (let lista in chartData) {
        if (lista.length > duljinaCharta) {
            lista.shift();
        }
    }
}



// inicijalni krug da se popune subseti
while (ss15min.length < 20) {
    ss1min.push(paketKendlova.arr1min.shift());
    chartifikacija(ss1min[i1]);
    i1++;
    if (i1 % 5 === 0) {
        ss5min.push(paketKendlova.arr5min.shift())
        i5++;
    }
    if (i1 % 15 === 0) {
        ss15min.push(paketKendlova.arr15min.shift())
        i15++;
    }
}


{
    if (paketKendlova.arr1min.length < 301) {
    break;
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
    jahanje(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau);
}

pisalo.end();



