"use strict";

/*--------------------------GLAVNI MODUL------------------------------*/
/*----------------------koji nezaustavljivo---------------------------*/
/*-------------------trči u nove radne pobjede------------------------*/
/*----------i testira strategije na povjesnim podacima----------------*/

/*----------------------------REQUIRE---------------------------------*/

/*-------------------standardni node.js moduli------------------------*/

const fs = require('fs');
const http = require('http');

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

// duljina charta (broj vremenskih jedinica)
let duljinaCharta = 120;

/* pathovi za gornje i donje pecivo sendviča */
let gornjiHTMLPath = './HTMLburgerGornji.html';
let donjiHTMLPath = './HTMLburgerDonji.html';
let srednjiHTMLPath = './HTMLburgerMeso.js';

/*-----------------INICIJALNE DEKLARACIJE-------------------*/

// definiramo subsete kendlova izvan while-a
let ss1min = [];
let ss5min = [];
let ss15min = [];
// definiramo countere za subsetove
let i1 = 0;
let i5 = 0;
let i15 = 0;

// definiramo chartData paket
let chartData = {};
chartData.m1 = {};

chartData.m1.vrijeme = [];
chartData.m1.close = [];
chartData.m1.pasivnoEUR = [];
chartData.m1.pasETHuEUR = [];

chartData.m1.gornjiLimit = [];
chartData.m1.donjiLimit = [];
chartData.m1.gornjiStop = [];
chartData.m1.donjiStop = [];
// chartData.m1.trail = []; // za sad izostavljamo trailere, kasnije dodati

chartData.m5 = {};
chartData.m5.vrijeme = [];
chartData.m5.high = [];
chartData.m5.low = [];
chartData.m5.pasivnoEUR = [];
chartData.m5.pasETHuEUR = [];

chartData.m15 = {};
chartData.m15.vrijeme = [];
chartData.m15.high = []
chartData.m15.low = []
chartData.m15.pasivnoEUR = [];
chartData.m15.pasETHuEUR = [];

// formatirani chData1min
let chData1min = {};

// boje za chartove
let crnaBoja = 'rgba(38, 12, 12, 0.95)';
let crvenaBoja = 'rgba(188, 32, 32, 0.76)';
let plavaBoja = 'rgba(48, 146, 166, 0.1)';
let zelenaBoja = 'rgba(36, 126, 51, 0.95)';
let zutaBoja = 'rgba(231, 227, 8, 0.95)';
let rozaBoja = 'rgba(254, 57, 211, 0.78)';
let purpleBoja = 'rgba(150, 6, 253, 0.1)';



/*-----------------FUNKCIJE-------------------*/

// dataset predložak za stopove
let jedanDataset = {
    type: 'line',
    label: '',
    data: chartData.m1.gornjiStop,
    borderColor: '',
    borderWidth: 0.1,
    pointBorderWidth: 2,
    lineTension: 0,
    fill: false,            
    yAxisID: 'right-y-axis',
    xAxisID: 'cijena-x-axis',
    pointBackgroundColor: rozaBoja,
    backgroundColor: rozaBoja
}

function izmisliBoju() {
    let r = (Math.floor(Math.random() * 255));
    let g = (Math.floor(Math.random() * 255));
    let b = (Math.floor(Math.random() * 255));
    let a = (Math.random() * 0.5);
    let boja = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    return boja;
  }

// novi chartifikator
function novaChartifikacija(kendl) {
    chartData.m1.pozStopovi;
    chartData.m1.buyLimiti = {};
    chartData.m1.sellLimiti = {};
    chartData.m1.traileri;
    // pushanje buy limita u chartData
    let gurnutBuyLimit = false;
    let buyLimit = portfolio.limiti['buy'];
    let brojBuyChart = Object.keys(chartData.m1.buyLimiti).length;
    if (brojBuyChart > 0) {
        for (let id in chartData.m1.buyLimiti) {
            if (id === buyLimit.id) {
                chartData.m1.buyLimiti[id].push(buyLimit.limitCijena);
                gurnutBuyLimit = true;
                break;
            }    
        }
    } else {
        chartData.m1.buyLimiti[buyLimit.id] = [buyLimit.limitCijena];
    }
    if (!gurnutBuyLimit) {
        
    }
// tu skratiti dužinu chartData datasetova ili produžiti ako su kratki
}

{ //
let stopDataset = new jedanDataset;
stopDataset.label = 'Stop od pozicije ' + pozicija.id;
stopDataset.borderColor = izmisliBoju();
stopDataset.data;
}

function nadjiStop(portfolio) {
    let pozCounterString;
    let pozicija;
    // traženje pozicije koja još ima stop 
    for (let i = 0; i <= portfolio.pozCounter; i++) {
        pozCounterString = ((portfolio.pozCounter - i).toString()).padStart(4, "0");
        pozicija = portfolio.pozicije[pozCounterString];
        if (pozicija && pozicija.stop) {
            break;
        }
    }
    return (pozicija && pozicija.stop ? pozicija.stop : null);    
}

function chartifikacija1m(kendl) {
    // input funkciji je jedan kendl
    // čupamo njegov Close
    chartData.m1.close.push(kendl.C);
    chartData.m1.vrijeme.push(kendl.datum + ' ' + kendl.sat + ':' + kendl.minuta);
    chartData.m1.pasivnoEUR.push(portfolio.EUR);
    chartData.m1.pasETHuEUR.push(portfolio.ETH * kendl.C);
    if (!portfolio.limiti.buy && !portfolio.limiti.sell) {
        chartData.m1.gornjiLimit.push(null);
        chartData.m1.gornjiStop.push(null);
        chartData.m1.donjiLimit.push(null);
        chartData.m1.donjiStop.push(null);
    } else {
        // traženje gornjih točaka
        if (portfolio.limiti.sell) {
            chartData.m1.gornjiLimit.push(portfolio.limiti.sell.limitCijena);
            chartData.m1.gornjiStop.push(null);
        } else if (!portfolio.limiti.sell) {
            chartData.m1.gornjiLimit.push(null);
            chartData.m1.gornjiStop.push(nadjiStop(portfolio));
        }
        // traženje donjih točaka
        if (portfolio.limiti.buy) {
            chartData.m1.donjiLimit.push(portfolio.limiti.buy.limitCijena);
            chartData.m1.donjiStop.push(null);
        } else if (!portfolio.limiti.buy) {
            chartData.m1.donjiLimit.push(null);
            chartData.m1.donjiStop.push(nadjiStop(portfolio));
        }
    }

    // podešavanje chartData da bude dug duljinaCharta
    for (let lista in chartData.m1) {
        if (chartData.m1[lista].length > duljinaCharta) {
            chartData.m1[lista].shift();
        }
    }
}

function chartifikacija5m(kendl) {
    // input funkciji je jedan kendl
    // čupamo njegove High i Low
    chartData.m5.high.push(kendl.H);
    chartData.m5.low.push(kendl.L);
    chartData.m5.vrijeme.push(kendl.datum + ' ' + kendl.sat + ':' + kendl.minuta);
    chartData.m5.pasivnoEUR.push(portfolio.EUR);
    chartData.m5.pasETHuEUR.push(portfolio.ETH * kendl.C);
    // podešavanje chartData da bude dug duljinaCharta
    for (let lista in chartData.m5) {
        if (lista.length > duljinaCharta) {
            lista.shift();
        }
    }
}

function chartifikacija15m(kendl) {
    // input funkciji je jedan kendl
    // čupamo njegove High i Low
    chartData.m15.high.push(kendl.H);
    chartData.m15.low.push(kendl.L);
    chartData.m15.vrijeme.push(kendl.datum + ' ' + kendl.sat + ':' + kendl.minuta);
    chartData.m15.pasivnoEUR.push(portfolio.EUR);
    chartData.m15.pasETHuEUR.push(portfolio.ETH * kendl.C);
    // podešavanje chartData da bude dug duljinaCharta
    for (let lista in chartData.m15) {
        if (lista.length > duljinaCharta) {
            lista.shift();
        }
    }
}

function filanjeSubsetova() {
    ss1min.push(paketKendlova.arr1min.shift());
    chartifikacija1m(ss1min[i1]);
    i1++;
    if (i1 % 5 === 0) {
        ss5min.push(paketKendlova.arr5min.shift())
        chartifikacija5m(ss5min[i5]);
        i5++;
    }
    if (i1 % 15 === 0) {
        ss15min.push(paketKendlova.arr15min.shift())
        chartifikacija15m(ss15min[i15]);
        i15++;
    }
}

/*-----------------ALGORITAM-------------------*/

// inicijalni krug da se popune subseti dovoljno za chart
while (ss15min.length < duljinaCharta) {
    filanjeSubsetova();
    formatiranjeChData(chartData);
}

// funkcija koja se vrti sa svakim klikom
function playPauza(koraka) {
    for (let i = 0; i < koraka; i++) {
        /*
        if (paketKendlova.arr1min.length < 301) {
            break;
        } 
        NEKA VRSTA BREJKA AKO SMO NA KRAJU KENDL-PAKETA.
        ZASAD NE TREBA, KASNIJE ĆE BIT BITNO.
        */
        filanjeSubsetova();
        let dev5 = devijacija(ss5min, 20);
        let dev15 = devijacija(ss15min, 20);
        let odmakPhi = 1.5 * dev5;
        let odmakLambda = dev5;
        let odmakTau = 2;
        let kendlic = ss1min[ss1min.length - 1];
        let iznos = 0.2;
        let cijenaSad = kendlic.C;
        let vrijemeSad = kendlic.datum + ' ' + kendlic.sat + ':' + kendlic.minuta;
        let poruka = 'Trenutna cijena: ' + vrijemeSad + ' || ' + kendlic.C
        // pisalo.pisi(poruka);
        for (let i = 0; i < 3; i++) {
            jahanje(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau);
        }
        formatiranjeChData(chartData);
    }
}

// chart objekti koje JSON-iramo da ih ubacimo u sendvič
let chData5min = {};
let chData15min = {};

function formatiranjeChData(chartData) {
    chData1min = {
        type: 'bar',
        options: {
            //showLines: false,
            responsive: false,
            animation: {
                duration: 0
            },
            scales: {
                xAxes: [
                    {
                        id: 'portf-x-axis',
                        stacked: true,
                        display: false
                    }, {
                        id: 'cijena-x-axis',
                        stacked: false
                    }
                ],
                yAxes: [
                    {
                        stacked: true,
                        id: 'left-y-axis',
                        type: 'linear',
                        position: 'left'
                    }, {
                        id: 'right-y-axis',
                        type: 'linear',
                        position: 'right'
                    }
                ]
            }
        },
        data: {
            labels: chartData.m1.vrijeme,
            datasets: [
                {
                    type: 'line',
                    label: 'Cijena',
                    data: chartData.m1.close,
                    borderColor: crnaBoja,
                    borderWidth: 3,
                    lineTension: 0,
                    pointBorderWidth: 1,
                    pointRadius: 2,
                    fill: false,
                    yAxisID: 'right-y-axis',
                    xAxisID: 'cijena-x-axis',
                }, {
                    type: 'bar',
                    label: 'EUR pasiva',
                    data: chartData.m1.pasivnoEUR,
                    backgroundColor: plavaBoja,
                    fill: false,
                    yAxisID: 'left-y-axis',
                    xAxisID: 'portf-x-axis'
                }, {
                    type: 'bar',
                    label: 'ETH pasiva (u EUR)',
                    data: chartData.m1.pasETHuEUR,
                    backgroundColor: purpleBoja,
                    fill: false,
                    yAxisID: 'left-y-axis',
                    xAxisID: 'portf-x-axis'
                }, {
                    type: 'line',
                    label: 'Sell limit',
                    data: chartData.m1.gornjiLimit,
                    borderColor: crvenaBoja,
                    steppedLine: true,
                    borderWidth: 0.1,
                    pointBorderWidth: 2,
                    lineTension: 0,
                    fill: false,
                    yAxisID: 'right-y-axis',
                    xAxisID: 'cijena-x-axis',
                    pointBackgroundColor: crvenaBoja,
                    backgroundColor: crvenaBoja
                }, {
                    type: 'line',
                    label: 'Buy limit',
                    data: chartData.m1.donjiLimit,
                    borderColor: zelenaBoja,
                    steppedLine: 'before',
                    borderWidth: 0.1,
                    pointBorderWidth: 2,
                    lineTension: 0,
                    fill: false,          
                    yAxisID: 'right-y-axis',
                    xAxisID: 'cijena-x-axis',
                    pointBackgroundColor: zelenaBoja,
                    backgroundColor: zelenaBoja
                }/*, { ovo izbrisati i zamjeniti arrayem koji dinamički popunjava chdata
                    type: 'line',
                    label: 'Gornji stop',
                    data: chartData.m1.gornjiStop,
                    borderColor: rozaBoja,
                    borderWidth: 0.1,
                    pointBorderWidth: 2,
                    lineTension: 0,
                    fill: false,            
                    yAxisID: 'right-y-axis',
                    xAxisID: 'cijena-x-axis',
                    pointBackgroundColor: rozaBoja,
                    backgroundColor: rozaBoja
                }, {
                    type: 'line',
                    label: 'Donji stop',
                    data: chartData.m1.donjiStop,
                    borderColor: zutaBoja,
                    borderWidth: 0.1,
                    pointBorderWidth: 2,
                    lineTension: 0,
                    fill: false,            
                    yAxisID: 'right-y-axis',
                    xAxisID: 'cijena-x-axis',
                    pointBackgroundColor: zutaBoja,
                    backgroundColor: zutaBoja
                }*/
            ]
        }
    };
    return chData1min;
}

/*
chartData.m1.vrijeme = [];
chartData.m1.close = [];
chartData.m1.pasivnoEUR = [];
chartData.m1.pasETHuEUR = [];

chartData.m1.gornjiLimit = [];
chartData.m1.donjiLimit = [];
chartData.m1.gornjiStop = [];
chartData.m1.donjiStop = [];
*/

// objekt za chartove
/*
{
    type: 'bar',
    data: {
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        datasets: [{
            label: 'apples',
            data: [12, 19, 3, 17, 6, 3, 7],
            backgroundColor: "rgba(153,255,51,0.4)"
            }, {
            label: 'oranges',
            data: [2, 29, 5, 5, 2, 3, 10],
            backgroundColor: "rgba(255,153,0,0.4)"
        }]
    }
}
*/

//let slanina = "let chart1min = new Chart(ctx1min, " + JSON.stringify(chData1min) + ");";
//let sir = "let chart5min = new Chart(ctx5min, " + JSON.stringify(chData5min) + ");";
//let mesina = "let chart15min = new Chart(ctx15min, " + JSON.stringify(chData15min) + ");";

// jebeni server
http.createServer(function (req, response) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    // gornji dio HTML-a, do <script>-a
    response.write(fs.readFileSync(gornjiHTMLPath));

    if (req.url === '/?kolikoMinuta=5') {
        playPauza(5);
    } else if (req.url === '/?kolikoMinuta=15') {
        playPauza(15);
    } else if (req.url === '/?kolikoMinuta=60') {
        playPauza(60);
    } else if (req.url === '/?kolikoMinuta=360') {
        playPauza(360);
    } else if (req.url === '/?kolikoMinuta=1440') {
        playPauza(1440);
    }
    // sastavljamo sendvič od HTML-a, JS-a i JSON-a
    response.write("let ctx1min = document.getElementById('chart1min').getContext('2d');");
    response.write("let ctx5min = document.getElementById('chart5min').getContext('2d');");
    response.write("let ctx15min = document.getElementById('chart15min').getContext('2d');");
    
    response.write("let chart1min = new Chart(ctx1min, " + JSON.stringify(chData1min) + ");");
    //response.write(slanina);
    //response.write(sir);
    //response.write(mesina);
    
    // donji dio HTML-a, od </script> nadalje
    response.write(fs.readFileSync(donjiHTMLPath));
    response.end();
}).listen(1337, '127.0.0.1');

console.log('HTMLburger ti je na adresi http://127.0.0.1:1337/ i pljunuo sam u njega.');


// treba provjeriti trailere. nešto nije u redu sa chartovima.


// pisalo.end();



