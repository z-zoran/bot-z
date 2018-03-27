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

/*-----------------INICIJALNE DEKLARACIJE-------------------*/

// definiramo subsete kendlova izvan while-a
let ss1min = [];
let ss15min = [];

// definiramo countere za subsetove
let i1 = 0;
let i15 = 0;

// definiramo chartData paket
let chartData = {
    m1: {
        close: [],
        vrijeme: [],
        pozStopovi: {},
        buyLimiti: {},
        sellLimiti: {},
        traileri: {}
    },
    m15: {
        high: [],
        low: [],
        vrijeme: [],
        pasivnoEUR: [],
        pasETHuEUR: []
    }
}

// boje za chartove
let crnaBoja = 'rgba(38, 12, 12, 0.95)';
let crvenaBoja = 'rgba(188, 32, 32, 0.76)';
let zelenaBoja = 'rgba(36, 126, 51, 0.95)';

/*-----------------FUNKCIJE-------------------*/


function buyLimitTemplate(label, data) {
    let template = {
        type: 'line',
        label: label, // popuni
        data: data, // popuni
        borderColor: zelenaBoja, 
        borderWidth: 0.01,
        pointBorderWidth: 2,
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'cijena-x-axis',
        pointBackgroundColor: zelenaBoja,  
        backgroundColor: zelenaBoja 
    }
    return template;
}   

function sellLimitTemplate(label, data) {
    let template = {
        type: 'line',
        label: label, // popuni
        data: data, // popuni
        borderColor: crvenaBoja,
        borderWidth: 0.01,
        pointBorderWidth: 2,
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'cijena-x-axis',
        pointBackgroundColor: crvenaBoja,
        backgroundColor: crvenaBoja
    }
    return template;
}

function stopTemplate(label, data, boja) {
    let template = {
        type: 'line',
        label: label, // popuni
        data: data, // popuni
        borderColor: boja, // popuni
        borderWidth: 0.01,
        pointBorderWidth: 1,
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'cijena-x-axis',
        pointBackgroundColor: boja,  // popuni
        backgroundColor: boja // popuni
    }
    return template;
}

function trailerTemplate(label, data, boja) {
    let template = {
        type: 'line',
        label: label, // popuni
        data: data, // popuni
        borderColor: boja, // popuni
        borderWidth: 0.01,
        pointBorderWidth: 1,
        pointStyle: 'rect',
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'cijena-x-axis',
        pointBackgroundColor: boja,  // popuni
        backgroundColor: boja // popuni
    }
    return template;
}

function cijenaTemplate(data) {
    let template = {
        type: 'line',
        label: 'Cijena',
        data: data,
        borderColor: crnaBoja,
        borderWidth: 3,
        lineTension: 0,
        pointBorderWidth: 1,
        pointRadius: 2,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'cijena-x-axis'    
    }
    return template;
}


// FUNKCIJA KOJA ČUPA DATA IZ portfolio I KENDLOVA
function predChartifikacija(kendl1, kendl15) { 
    
    /**** GURANJE CIJENE I VREMENA ****/
    chartData.m1.close.push(kendl1.C);
    while (!(chartData.m1.close.length === duljinaCharta)) {
        if (chartData.m1.close.length < duljinaCharta) {
            chartData.m1.close.unshift(null);
        } else if (chartData.m1.close.length > duljinaCharta) {
            chartData.m1.close.shift();
        }
    }
    chartData.m1.vrijeme.push(kendl1.datum + ' ' + kendl1.sat + ':' + kendl1.minuta);
    while (!(chartData.m1.vrijeme.length === duljinaCharta)) {
        if (chartData.m1.vrijeme.length < duljinaCharta) {
            chartData.m1.vrijeme.unshift(null);
        } else if (chartData.m1.vrijeme.length > duljinaCharta) {
            chartData.m1.vrijeme.shift();
        }
    }

    /**** GURANJE STOPOVA ****/
    // ako pozicija ima stop, guraj u chartData
    for (let p in portfolio.pozicije) {
        if (portfolio.pozicije[p].stop) {
            let stopRegistriran = false;
            for (let c in chartData.m1.pozStopovi) {
                if (p === c) {
                    chartData.m1.pozStopovi[p].push(portfolio.pozicije[p].stop);
                    stopRegistriran = true;
                    break
                }
            }
            if (!stopRegistriran) {
                chartData.m1.pozStopovi[p] = [];
                chartData.m1.pozStopovi[p].push(portfolio.pozicije[p].stop);
                stopRegistriran = true;
            }
        }
    }
    // još jednom proći sve pozStop arrayeve i gurnuti null ako neki nije taknut u prošlom for-u
    for (let c in chartData.m1.pozStopovi) {
        if (chartData.m1.pozStopovi[c].length === duljinaCharta) {
            chartData.m1.pozStopovi[c].push(null);
        }
    }
    // onda skraćujemo / produžujemo sve arrayeve po potrebi
    for (let c in chartData.m1.pozStopovi) {
        while (!(chartData.m1.pozStopovi[c].length === duljinaCharta)) {
            if (chartData.m1.pozStopovi[c].length < duljinaCharta) {
                chartData.m1.pozStopovi[c].unshift(null);
            } else if (chartData.m1.pozStopovi[c].length > duljinaCharta) {
                chartData.m1.pozStopovi[c].shift();
            }
        }
    }

    /**** GURANJE TRAILERA ****/
    // isti postupak za trailere
    // preletimo sve trailere pa ih tutnemo u chartdata
    for (let p in portfolio.traileri) {
        let trailerRegistriran = false;
        for (let c in chartData.m1.traileri) {
            if (p === c) {
                chartData.m1.traileri[p].push(portfolio.traileri[p].gdjeSam);
                trailerRegistriran = true;
                break;
            }
        }
        if (!trailerRegistriran) {
            chartData.m1.traileri[p] = [];
            chartData.m1.traileri[p].push(portfolio.traileri[p].gdjeSam);
            trailerRegistriran = true;
        }
    }
    // još jednom proći sve trailer arrayeve i gurnuti null ako neki nije taknut u prošlom for-u
    for (let c in chartData.m1.traileri) {
        if (chartData.m1.traileri[c].length === duljinaCharta) {
            chartData.m1.traileri[c].push(null);
        }
    }
    // skraćivanje odnosno produživanje arrayeva
    for (let c in chartData.m1.traileri) {
        while (!(chartData.m1.traileri[c].length === duljinaCharta)) {
            if (chartData.m1.traileri[c].length < duljinaCharta) {
                chartData.m1.traileri[c].unshift(null);
            } else if (chartData.m1.traileri[c].length > duljinaCharta) {
                chartData.m1.traileri[c].shift();
            }
        }
    }

    /**** GURANJE BUY LIMITA ****/
    // ovaj put za buy limite
    let buyLimitRegistriran = false;
    let pfBuyLimit = portfolio.limiti['buy'];
    for (let c in chartData.m1.buyLimiti) {
        // produži postojeći limit array
        if (c === pfBuyLimit.id) {
            chartData.m1.buyLimiti[c].push(pfBuyLimit.limitCijena);
            buyLimitRegistriran = true;
            break;
        }
    }
    // stvori novi limit array
    if (!buyLimitRegistriran) {
        chartData.m1.buyLimiti[pfBuyLimit.id] = [pfBuyLimit.limitCijena];
        buyLimitRegistriran = true;
    }
    // dodaj null svima koji nisu taknuti dosad
    for (let c in chartData.m1.buyLimiti) {
        if (chartData.m1.buyLimiti[c].length === duljinaCharta) {
            chartData.m1.buyLimiti[c].push(null);
        }
    }
    // skraćivanje / produživanje na željenu duljinu charta
    for (let c in chartData.m1.buyLimiti) {
        while (!(chartData.m1.buyLimiti[c].length === duljinaCharta)) {
            if (chartData.m1.buyLimiti[c].length < duljinaCharta) {
                chartData.m1.buyLimiti[c].unshift(null);
            } else if (chartData.m1.buyLimiti[c].length > duljinaCharta) {
                chartData.m1.buyLimiti[c].shift();
            }
        }
    }

    /**** GURANJE SELL LIMITA ****/
    // i konačno za sell limite
    let sellLimitRegistriran = false;
    let pfSellLimit = portfolio.limiti['sell'];
    for (let c in chartData.m1.sellLimiti) {
        // produži postojeći limit array
        if (c === pfSellLimit.id) {
            chartData.m1.sellLimiti[c].push(pfSellLimit.limitCijena);
            sellLimitRegistriran = true;
            break;
        }
    }
    // stvori novi limit array
    if (!sellLimitRegistriran) {
        chartData.m1.sellLimiti[pfSellLimit.id] = [pfSellLimit.limitCijena];
        sellLimitRegistriran = true;
    }
    // dodaj null svima koji nisu taknuti dosad
    for (let c in chartData.m1.sellLimiti) {
        if (chartData.m1.sellLimiti[c].length === duljinaCharta) {
            chartData.m1.sellLimiti[c].push(null);
        }
    }
    // skraćivanje / produživanje na željenu duljinu charta
    for (let c in chartData.m1.sellLimiti) {
        while (!(chartData.m1.sellLimiti[c].length === duljinaCharta)) {
            if (chartData.m1.sellLimiti[c].length < duljinaCharta) {
                chartData.m1.sellLimiti[c].unshift(null);
            } else if (chartData.m1.sellLimiti[c].length > duljinaCharta) {
                chartData.m1.sellLimiti[c].shift();
            }
        }
    }

    /**** PUNJENJE DRUGOG ČARTA S CIJENOM, VREMENOM I PORTFOLIOM ****/
    if (i1 % 5 === 0) {
        chartData.m15.high.push(kendl15.H);
        while (!(chartData.m15.high.length === duljinaCharta)) {
            if (chartData.m15.high.length < duljinaCharta) {
                chartData.m15.high.unshift(null);
            } else if (chartData.m15.high.length > duljinaCharta) {
                chartData.m15.high.shift();
            }
        }
        chartData.m15.low.push(kendl15.L);
        while (!(chartData.m15.low.length === duljinaCharta)) {
            if (chartData.m15.low.length < duljinaCharta) {
                chartData.m15.low.unshift(null);
            } else if (chartData.m15.low.length > duljinaCharta) {
                chartData.m15.low.shift();
            }
        }
        chartData.m15.vrijeme.push(kendl15.datum + ' ' + kendl15.sat + ':' + kendl15.minuta);
        while (!(chartData.m15.vrijeme.length === duljinaCharta)) {
            if (chartData.m15.vrijeme.length < duljinaCharta) {
                chartData.m15.vrijeme.unshift(null);
            } else if (chartData.m15.vrijeme.length > duljinaCharta) {
                chartData.m15.vrijeme.shift();
            }
        }
        chartData.m15.pasivnoEUR.push(portfolio.EUR);
        while (!(chartData.m15.pasivnoEUR.length === duljinaCharta)) {
            if (chartData.m15.pasivnoEUR.length < duljinaCharta) {
                chartData.m15.pasivnoEUR.unshift(null);
            } else if (chartData.m15.pasivnoEUR.length > duljinaCharta) {
                chartData.m15.pasivnoEUR.shift();
            }
        }
        chartData.m15.pasETHuEUR.push(portfolio.ETH * kendl15.C);
        while (!(chartData.m15.pasETHuEUR.length === duljinaCharta)) {
            if (chartData.m15.pasETHuEUR.length < duljinaCharta) {
                chartData.m15.pasETHuEUR.unshift(null);
            } else if (chartData.m15.pasETHuEUR.length > duljinaCharta) {
                chartData.m15.pasETHuEUR.shift();
            }
        }        
    }
}

// FUNKCIJA KOJA ČISTI NULL ARRAY-EVE
function sanitizacijaCharta() {
    // čišćenje buy limita
    for (let c in chartData.m1.buyLimiti) {
        let ovoJeNullArr = false;
        for (let i = 0; i < chartData.m1.buyLimiti[c].length; i++) {
            if (!(chartData.m1.buyLimiti[c][i] === null)) {
                ovoJeNullArr = true;
                break;
            }
        }
        if (ovoJeNullArr) {
            delete chartData.m1.buyLimiti[c];
        }
    }
    // čišćenje sell limita
    for (let c in chartData.m1.sellLimiti) {
        let ovoJeNullArr = false;
        for (let i = 0; i < chartData.m1.sellLimiti[c].length; i++) {
            if (!(chartData.m1.sellLimiti[c][i] === null)) {
                ovoJeNullArr = true;
                break;
            }
        }
        if (ovoJeNullArr) {
            delete chartData.m1.sellLimiti[c];
        }
    }
    // čišćenje stopova
    for (let c in chartData.m1.pozStopovi) {
        let ovoJeNullArr = false;
        for (let i = 0; i < chartData.m1.pozStopovi[c].length; i++) {
            if (!(chartData.m1.pozStopovi[c][i] === null)) {
                ovoJeNullArr = true;
                break;
            }
        }
        if (ovoJeNullArr) {
            delete chartData.m1.pozStopovi[c];
        }
    }
    // čišćenje trailera
    for (let c in chartData.m1.traileri) {
        let ovoJeNullArr = false;
        for (let i = 0; i < chartData.m1.traileri[c].length; i++) {
            if (!(chartData.m1.traileri[c][i] === null)) {
                ovoJeNullArr = true;
                break;
            }
        }
        if (ovoJeNullArr) {
            delete chartData.m1.traileri[c];
        }
    }
}

// FORMATIRANJE ZA CHART JS
function stvaranjeCharta() {
    let m1Dataset = [];
    // tu popuniti m1dataset sa svim potrebnim templateima
    
    let chartFormatiran = {};
    chartFormatiran.m1 = {
        type: 'bar',
        options: {
            responsive: false,
            animation: {
                duration: 0
            },
            scales: {
                xAxes: [
                    {
                        id: 'cijena-x-axis'
                    }
                ],
                yAxes: [
                    {
                        id: 'right-y-axis',
                        position: 'right'
                    }
                ]
            }
        },
        data: {
            labels: chartData.m1.vrijeme,
            datasets: m1Dataset
        }
    };

    let m15Dataset = [];
    chartFormatiran.m15 = {
        type: 'bar',
        options: {
            responsive: false,
            animation: {
                duration: 0
            },
            scales: {
                xAxes: [
                    {
                        stacked: true,
                        id: 'portf-x-axis',
                        display: false
                    }, {
                        stacked: false,
                        id: 'cijena-x-axis'
                    }
                ],
                yAxes: [
                    {
                        stacked: true,
                        id: 'left-y-axis',
                        type: 'linear',
                        position: 'left'
                    }, {
                        stacked: false,
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
    return chartFormatiran;
}

function izmisliBoju() {
    let r = (Math.floor(Math.random() * 255));
    let g = (Math.floor(Math.random() * 255));
    let b = (Math.floor(Math.random() * 255));
    let a = (Math.random() * 0.5);
    let boja = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    return boja;
}


/*  // OBRISATI
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
} */

function filanjeSubsetova() {   // reformirati u skladu s predChartifikacija() i stvaranjeCharta()
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
        for (let i = 0; i < 3; i++) {
            jahanje(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau);
        }
        formatiranjeChData(chartData);
    }
}



// madrfakin server
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
    response.write("let ctx15min = document.getElementById('chart15min').getContext('2d');");
    
    response.write("let chart1min = new Chart(ctx1min, " + JSON.stringify(chData1min) + ");");
    response.write("let chart15min = new Chart(ctx1min, " + JSON.stringify(chData1min) + ");");
    
    // donji dio HTML-a, od </script> nadalje
    response.write(fs.readFileSync(donjiHTMLPath));
    response.end();
}).listen(1337, '127.0.0.1');

console.log('HTMLburger ti je na adresi http://127.0.0.1:1337/ i pljunuo sam u njega.');

