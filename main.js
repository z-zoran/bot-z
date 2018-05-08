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
const alatke = require('./alatke.js');
const trenutnoEura = alatke.trenutnoEura;

/*---------------------VARIJABLE--------------------------*/

let putanja = './exchdata/testdata.csv';
// testni trejdovi i kendlovi
let paketKendlova = agro(putanja);

let pfID = '001';
let portfolio = memorija[pfID] = new klas.Portfolio(pfID, 1000, 3, 0, 0, 0);

let jahanje = strat.stratJahanjeCijene;

// duljina charta (broj vremenskih jedinica)
let duljinaCharta = 60;

/* pathovi za gornje i donje pecivo sendviča */
let gornjiHTMLPath = './HTMLburgerGornji.html';

/*-----------------INICIJALNE DEKLARACIJE-------------------*/

// definiramo subsete kendlova izvan while-a
let ss1min = [];
let ss5min = [];
let ss15min = [];

// definiramo countere za subsetove
let i1 = 0;
let i15 = 0;

// definiramo chartData paket
let chartData = {
    boje: {
        // tu trpamo "id":"boja" parove.
        // traileri će biti iste boje kao stopovi iz kojih nastanu
    },
    ulazneCijene: {
        // tu trpamo "id":"cijena" parove.
        // stopovi i traileri prikazuju na kojoj cijeni se ušlo u poziciju
    },
    // data za m1 chart
    m1: {
        close: [],
        vrijeme: [],
        buyLimiti: [],
        sellLimiti: [],
        pozStopovi: {},
        traileri: {}
    },
    // data za m15 chart
    m15: {
        high: [],
        low: [],
        vrijeme: [],
        pasivnoEUR: [],
        pasETHuEUR: [],
        aktLimitiuEUR: [],
        aktPozicijeuEUR: []
    }
}

// pred-definirane boje za chartove
let crnaBoja = 'rgba(38, 12, 12, 0.95)';
let crvenaBoja = 'rgba(188, 32, 32, 0.76)';
let zelenaBoja = 'rgba(36, 126, 51, 0.95)';
let plavaBoja = 'rgba(63, 127, 191, 0.54)';
let rozaBoja = 'rgba(191, 63, 127, 0.54)';


/*-----------------FUNKCIJE-------------------*/

function buyLimitTemplate(data) {
    let template = {
        type: 'line',
        label: 'Buy limit',
        data: data, // popuni
        borderColor: zelenaBoja, 
        borderWidth: 0.01,
        pointBorderWidth: 2,
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'vrijeme-x-axis',
        pointBackgroundColor: zelenaBoja,  
        backgroundColor: zelenaBoja 
    }
    return template;
}   

function sellLimitTemplate(data) {
    let template = {
        type: 'line',
        label: 'Sell limit',
        data: data, // popuni
        borderColor: crvenaBoja,
        borderWidth: 0.01,
        pointBorderWidth: 2,
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'vrijeme-x-axis',
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
        pointStyle: 'rect',
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'vrijeme-x-axis',
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
        pointStyle: 'cross',
        lineTension: 0,
        fill: false,
        yAxisID: 'right-y-axis',
        xAxisID: 'vrijeme-x-axis',
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
        xAxisID: 'vrijeme-x-axis'    
    }
    return template;
}

function pfTemplate(label, data, boja) {
    let template = {
        type: 'bar',
        label: label,
        data: data,
        borderColor: boja,
        backgroundColor: boja,
        borderWidth: 0,
        yAxisID: 'left-y-axis',
        xAxisID: 'portf-x-axis'    
    }
    return template;
}

function izmisliBoju() {
    let r = (Math.floor(Math.random() * 255));
    let g = (Math.floor(Math.random() * 255));
    let b = (Math.floor(Math.random() * 255));
    let a = (0.4 + (Math.random() * 0.3));
    let boja = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    return boja;
}

// FUNKCIJA KOJA ČUPA DATA IZ portfolio I KENDLOVA
function predChartifikacija(kendl1, kendl15) { 
    
    /**** GURANJE CIJENE I VREMENA ****/
    chartData.m1.close.push(kendl1.C);
    while (chartData.m1.close.length !== duljinaCharta) {
        if (chartData.m1.close.length < duljinaCharta) {
            chartData.m1.close.unshift(null);
        } else if (chartData.m1.close.length > duljinaCharta) {
            chartData.m1.close.shift();
        }
    }
    let vrijeme = `${kendl1.vrijeme.getFullYear()}-${kendl1.vrijeme.getMonth() + 1}-${kendl1.vrijeme.getDate()} ${String(kendl1.vrijeme.getHours()).padStart(2, "0")}:${String(kendl1.vrijeme.getMinutes()).padStart(2, "0")}`;
    chartData.m1.vrijeme.push(vrijeme);
    while (chartData.m1.vrijeme.length !== duljinaCharta) {
        if (chartData.m1.vrijeme.length < duljinaCharta) {
            chartData.m1.vrijeme.unshift(null);
        } else if (chartData.m1.vrijeme.length > duljinaCharta) {
            chartData.m1.vrijeme.shift();
        }
    }

    /**** GURANJE BUY LIMITA ****/
    let pfBuyLimit = portfolio.limiti['buy'];
    if (pfBuyLimit) {
        chartData.m1.buyLimiti.push(pfBuyLimit.limitCijena);
    } else {
        chartData.m1.buyLimiti.push(null);
    }
    while (chartData.m1.buyLimiti.length !== duljinaCharta) {
        if (chartData.m1.buyLimiti.length < duljinaCharta) {
            chartData.m1.buyLimiti.unshift(null);
        } else if (chartData.m1.buyLimiti.length > duljinaCharta) {
            chartData.m1.buyLimiti.shift();
        }
    }
    
    /**** GURANJE SELL LIMITA ****/
    let pfSellLimit = portfolio.limiti['sell'];
    if (pfSellLimit) {
        chartData.m1.sellLimiti.push(pfSellLimit.limitCijena);
    } else {
        chartData.m1.sellLimiti.push(null);
    }
    while (chartData.m1.sellLimiti.length !== duljinaCharta) {
        if (chartData.m1.sellLimiti.length < duljinaCharta) {
            chartData.m1.sellLimiti.unshift(null);
        } else if (chartData.m1.sellLimiti.length > duljinaCharta) {
            chartData.m1.sellLimiti.shift();
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
                    break;
                }
            }
            if (!stopRegistriran) {
                chartData.m1.pozStopovi[p] = [];
                chartData.m1.pozStopovi[p].push(portfolio.pozicije[p].stop);
                chartData.boje[p] = izmisliBoju();
                chartData.ulazneCijene[p] = portfolio.pozicije[p].cijena;
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
        while (chartData.m1.pozStopovi[c].length !== duljinaCharta) {
            if (chartData.m1.pozStopovi[c].length < duljinaCharta) {
                chartData.m1.pozStopovi[c].unshift(null);
            } else if (chartData.m1.pozStopovi[c].length > duljinaCharta) {
                chartData.m1.pozStopovi[c].shift();
            }
        }
    }
    // onda čistimo null arrayeve (ostatke starih stopova)
    for (let c in chartData.m1.pozStopovi) {
        let ovajArray = chartData.m1.pozStopovi[c];
        let ovoJeNullArr = true;
        // krećemo s pretpostavkom da je null array, ako nije onda idemo na sljedeći
        for (let i = 0; i < ovajArray.length; i++) {
            if (ovajArray[i] !== null) {
                ovoJeNullArr = false;
                break;
            }
        }
        if (ovoJeNullArr) {
            delete chartData.m1.pozStopovi[c];
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
            // tu nemoramo izmišljati boju, već ćemo ju povući iz chartData.boje
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
        while (chartData.m1.traileri[c].length !== duljinaCharta) {
            if (chartData.m1.traileri[c].length < duljinaCharta) {
                chartData.m1.traileri[c].unshift(null);
            } else if (chartData.m1.traileri[c].length > duljinaCharta) {
                chartData.m1.traileri[c].shift();
            }
        }
    }
    // onda čistimo null arrayeve (ostatke starih trailera)
    for (let c in chartData.m1.traileri) {
        let ovajArray = chartData.m1.traileri[c];
        let ovoJeNullArr = true;
        // krećemo s pretpostavkom da je null array, ako nije onda idemo na sljedeći
        for (let i = 0; i < ovajArray.length; i++) {
            if (ovajArray[i] !== null) {
                ovoJeNullArr = false;
                break;
            }
        }
        if (ovoJeNullArr) {
            delete chartData.m1.traileri[c];
            // ako brišemo trailer, znači da nam netreba više ulazna cijena i izmišljena boja
            delete chartData.boje[c];
            delete chartData.ulazneCijene[c];
        }
    }

    /**** PUNJENJE DRUGOG ČARTA S CIJENOM, VREMENOM I PORTFOLIOM ****/
    chartData.m15.high.push(kendl1.H);
    chartData.m15.low.push(kendl1.L);
    let vrijeme = `${kendl1.vrijeme.getFullYear()}-${kendl1.vrijeme.getMonth() + 1}-${kendl1.vrijeme.getDate()} ${String(kendl1.vrijeme.getHours()).padStart(2, "0")}:${String(kendl1.vrijeme.getMinutes()).padStart(2, "0")}`;
    chartData.m15.vrijeme.push(vrijeme);
    chartData.m15.pasivnoEUR.push(trenutnoEura(kendl1.C, portfolio).uEUR);
    chartData.m15.pasETHuEUR.push(trenutnoEura(kendl1.C, portfolio).uETH);
    chartData.m15.aktLimitiuEUR.push(trenutnoEura(kendl1.C, portfolio).uLimitima);
    chartData.m15.aktPozicijeuEUR.push(trenutnoEura(kendl1.C, portfolio).uPozicijama);
    for (let c in chartData.m15) {
        while (chartData.m15[c].length !== duljinaCharta) {
            if (chartData.m15[c].length < duljinaCharta) {
                chartData.m15[c].unshift(null);
            } else if (chartData.m15[c].length > duljinaCharta) {
                chartData.m15[c].shift();
            }
        }
    }
}

// FORMATIRANJE ZA CHART JS
function stvaranjeCharta(chartData) {
    let chartFormatiran = {};
    let m1Dataset = [];
    // guramo cijenu
    m1Dataset.push(cijenaTemplate(chartData.m1.close));
    // buy limite
    m1Dataset.push(buyLimitTemplate(chartData.m1.buyLimiti));
    // sell limite
    m1Dataset.push(sellLimitTemplate(chartData.m1.sellLimiti));
    // stopove
    for (let i in chartData.m1.pozStopovi) {
        let lejbl = 'Stop ' + i + ' || ulazna cijena: ' + chartData.ulazneCijene[i].toFixed(2);
        m1Dataset.push(stopTemplate(lejbl, chartData.m1.pozStopovi[i], chartData.boje[i]));
    }
    // trailere
    for (let i in chartData.m1.traileri) {
        let lejbl = 'Trailer ' + i + ' || ulazna cijena: ' + chartData.ulazneCijene[i].toFixed(2);
        m1Dataset.push(trailerTemplate(lejbl, chartData.m1.traileri[i], chartData.boje[i]));
    }
    
    chartFormatiran.m1 = {
        type: 'line',
        options: {
            responsive: false,
            animation: {
                duration: 0
            },    // MOŽDA OBRISATI
            scales: {
                xAxes: [
                    {
                        id: 'vrijeme-x-axis'
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
    m15Dataset.push(cijenaTemplate(chartData.m15.high));
    m15Dataset.push(cijenaTemplate(chartData.m15.low));
    m15Dataset.push(pfTemplate('Portfolio EUR', chartData.m15.pasivnoEUR, plavaBoja));
    m15Dataset.push(pfTemplate('Portfolio ETH u EURima', chartData.m15.pasETHuEUR, rozaBoja));
    m15Dataset.push(pfTemplate('Limiti u EURima', chartData.m15.aktLimitiuEUR, zelenaBoja));
    m15Dataset.push(pfTemplate('Pozicije u EURima', chartData.m15.aktPozicijeuEUR, crvenaBoja));
    
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
                        id: 'vrijeme-x-axis'
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
            labels: chartData.m15.vrijeme,
            datasets: m15Dataset 
        }
    };
    return chartFormatiran;
}

function inicijalnoFilanjeSubsetova() {
    for (let i = 0; i < 15 * duljinaCharta; i++) {
        ss1min.push(paketKendlova.arr1min.shift());
        if (i1 % 5 === 0) {
            ss5min.push(paketKendlova.arr5min.shift())
        }
        if (i1 % 15 === 0) {
            ss15min.push(paketKendlova.arr15min.shift())
        }
        predChartifikacija(ss1min[i1], ss15min[i15]);
        i1++;
        if (i1 % 15 === 0) {
            i15++;
        }    
    }
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
        let dev5 = devijacija(ss5min, 20);
        let dev15 = devijacija(ss15min, 20);
        let odmakPhi = 1 * dev5;
        let odmakLambda = 1 * dev5;
        let odmakTau = 0.2 * dev5;
        let koefKappa = 2; // koeficijent. ako je 2, znači killOdmak je 2*inicijalniOdmak
        let kendlic = ss1min[i1-1];
        let iznos = 0.5;
        let cijenaSad = kendlic.C;

        for (let i = 0; i < 50; i++) {
            jahanje(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau, koefKappa);
        }

        predChartifikacija(ss1min[i1-1], ss15min[i15-1]);


        ss1min.push(paketKendlova.arr1min.shift());
        if (i1 % 5 === 0) {
            ss5min.push(paketKendlova.arr5min.shift())
        }
        if (i1 % 15 === 0) {
            ss15min.push(paketKendlova.arr15min.shift())
        }

        i1++;
        if (i1 % 15 === 0) {
            i15++;
        }
    }
}

/*-----------------ALGORITAM-------------------*/

// inicijalni krug da se popune subseti dovoljno za chart
inicijalnoFilanjeSubsetova();

// madrfakin server
http.createServer(function (req, response) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    // gornji dio HTML-a, do <script>-a
    response.write(fs.readFileSync(gornjiHTMLPath));

    if (req.url === '/?i=5') {
        playPauza(5);
    } else if (req.url === '/?i=15') {
        playPauza(15);
    } else if (req.url === '/?i=60') {
        playPauza(60);
    } else if (req.url === '/?i=360') {
        playPauza(360);
    } else if (req.url === '/?i=1440') {
        playPauza(1440);
    } else if (req.url === '/?i=10080') {
        playPauza(10080);
    }
// sastavljamo sendvič od HTML-a, JS-a i JSON-a
    response.write("let ctx1min = document.getElementById('chart1min').getContext('2d');");
    response.write("let ctx15min = document.getElementById('chart15min').getContext('2d');");
    
    response.write("let chart1min = new Chart(ctx1min, " + JSON.stringify(stvaranjeCharta(chartData).m1) + ");");
    response.write("let chart15min = new Chart(ctx15min, " + JSON.stringify(stvaranjeCharta(chartData).m15) + ");");

    // donji dio HTML-a, od </script> nadalje
    response.write('</script></body></html>');
    response.end();
}).listen(1337, '127.0.0.1');

console.log('HTMLburger ti je na adresi http://127.0.0.1:1337/ i pljunuo sam u njega.');

