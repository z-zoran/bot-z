"use strict";

/*--------------------------GLAVNI MODUL------------------------------*/
/*----------------------koji nezaustavljivo---------------------------*/
/*-------------------trči u nove radne pobjede------------------------*/
/*----------i testira strategije na povjesnim podacima----------------*/

/*----------------------------REQUIRE---------------------------------*/

/*-------------------standardni node.js moduli------------------------*/

const fs = require('fs');
const http = require('http');
const stream = require('stream');

/*---------------------kastom zoki.js moduli--------------------------*/

const strat = require('./strategos.js');
const memorija = require('./memorija.js');
const klas = require('./klasnaBorba.js');
const devijacija = require('./indikator.js');
const alatke = require('./alatke.js');
const trenutnoEura = alatke.trenutnoEura;
const templ = require('./chartTemplejti.js');

/*---------------------VARIJABLE--------------------------*/
/*
// testni trejdovi i kendlovi
let paketKendlova = agro(putanja);
*/
const pfID = '001';
const portfolio = memorija[pfID] = new klas.Portfolio(pfID, 1000, 3, 0, 0, 0);
const jahanje = strat.stratJahanjeCijene;

// duljina charta (broj vremenskih jedinica)
const duljinaCharta = 60;

/* pathovi za gornje i donje pecivo sendviča */
const gornjiHTMLPath = './HTMLburgerGornji.html';

/*-----------------INICIJALNE DEKLARACIJE-------------------*/

// subset kendlova iz potoka
const jezerce = [];

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

/*---------OSIGURAČ-------- */

process.on('unhandledRejection', (err) => { 
    console.error(err);
    process.exit(1);
});

/*--------------STREAM IMPLEMENTACIJA-----------------*/
/***
 * dolazni potok  --> jezerce array --> kanalizacija() --> set1min
 * (dolazni stream)  (privremeni pool)              -----> set5min
 *                                                -------> set15min
 */
//

let tekst = '123 nešto.'; 
const agroPotok = require('./agroPotok.js');

// CONFIGURACIJA ZA DOLAZNI POTOK
let putanja = './exchdata/testdata.csv';
const mod = 'simulacija' // ili 'trening-aps' ili 'trening-log'
const inputter = fs.createReadStream(putanja);
const rezolucija = 1;
const inSize = 15;
const outSize = 2;
const prosirenje = 1;

const potok = agroPotok.agro(mod, inputter, rezolucija, inSize, outSize, prosirenje);

/*-----------------FUNKCIJE-------------------*/

function kanalizacijaStaraZaBaciti(jezerce) {
    const pisac = {
        p1: new agroPotok.PisacPotok(duljinaCharta),
        p5: new agroPotok.PisacPotok(duljinaCharta),
        p15: new agroPotok.PisacPotok(duljinaCharta)
    }
    const kanal = {
        k1: new agroPotok.Agregator(1),
        k5: new agroPotok.Agregator(5),
        k15: new agroPotok.Agregator(15)
    }
    // cjedimo jezerce u kanale
    jezerce.forEach((kendl) => {
        kanal.k1.write(kendl);
        kanal.k5.write(kendl);
        kanal.k15.write(kendl);
    })
    // pajpamo kanale kroz pisce u promise set
    const set = {
        ss1: kanal.k1.pipe(pisac.p1).tempArr,
        ss5: kanal.k5.pipe(pisac.p5).tempArr,
        ss15: kanal.k15.pipe(pisac.p15).tempArr
    }
    setTimeout(() => {
        Promise.all([set.ss1, set.ss5, set.ss15])
        .then(() => {
            console.log(set.ss15[set.ss15.length - 1].minuta);
            egzekutorStrategije(stratConfig, set);
            predChartifikacija(dohvatiTriplet(set));
        })
    }, 0);
}

function kanalizacija(jezerce) {
    const pisac = {
        p1: new agroPotok.PisacPotok(duljinaCharta),
        p5: new agroPotok.PisacPotok(duljinaCharta),
        p15: new agroPotok.PisacPotok(duljinaCharta)
    }
    const kanal = {
        k1: new agroPotok.Agregator(1),
        k5: new agroPotok.Agregator(5),
        k15: new agroPotok.Agregator(15)
    }
    // cjedimo jezerce u kanale
    jezerce.forEach((kendl) => {
        kanal.k1.write(kendl);
        kanal.k5.write(kendl);
        kanal.k15.write(kendl);
    })
    // pajpamo kanale kroz pisce u promise set
    const set = {
        ss1: kanal.k1.pipe(pisac.p1).tempArr,
        ss5: kanal.k5.pipe(pisac.p5).tempArr,
        ss15: kanal.k15.pipe(pisac.p15).tempArr
    }
    setTimeout(() => {
        Promise.all([set.ss1, set.ss5, set.ss15])
        .then(() => {
            console.log(set.ss15[set.ss15.length - 1].minuta);
            egzekutorStrategije(stratConfig, set);
            predChartifikacija(dohvatiTriplet(set));
        })
    }, 0);
}

function floodanjeJezerca() {
    setTimeout(function() {
        while (jezerce.length < (duljinaCharta * 15)) {
            let kap = potok.read();
            if (kap) {
                jezerce.push(kap);
            }
        }
    }, 1000);
}

function dohvatiTriplet(set) {
    const triplet = {
        k1: set.ss1[set.ss1.length - 1],
        k5: set.ss5[set.ss5.length - 1], 
        k15: set.ss15[set.ss15.length - 1]
    }
    return triplet;
}

function kapaljka(br) {
    for (let i = 0; i < br; i++) {
        let kap = potok.read();
        if (kap) {
            jezerce.push(kap);
            jezerce.shift();
            kanalizacija(jezerce);
        }
    }
}

function parsaj(url) {
    if (url.slice(0, 4) === '/?i=') {
        return url.slice(4, url.length);
    }
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
// ne koristi uopće kendl15 ali neki stari nazivi su ostali (m15dataset - iako nema 15min već 1min kendlove)
// malo počistiti odnosno vidjeti što dodati u layout
function predChartifikacija(tripletKendl) {
    // mini funkcija za produljenje/skraćenje chart dataseta
    function shiftUnshift(array, duljina) {
        while (array.length !== duljina) {
            if (array.length < duljina) {
                array.unshift(null);
            } else if (array.length > duljina) {
                array.shift();
            }
        }
    }

    /**** GURANJE CIJENE I VREMENA ****/
    chartData.m1.close.push(tripletKendl.k1.C);
    shiftUnshift(chartData.m1.close, duljinaCharta);

    chartData.m1.vrijeme.push(tripletKendl.k1.datum + ' ' + String(tripletKendl.k1.sat).padStart(2, "0") + ':' + String(tripletKendl.k1.minuta).padStart(2, "0"));
    shiftUnshift(chartData.m1.vrijeme, duljinaCharta);

    /**** GURANJE BUY LIMITA ****/
    let pfBuyLimit = portfolio.limiti['buy'];
    if (pfBuyLimit) {
        chartData.m1.buyLimiti.push(pfBuyLimit.limitCijena);
    } else {
        chartData.m1.buyLimiti.push(null);
    }
    shiftUnshift(chartData.m1.buyLimiti, duljinaCharta);
    
    /**** GURANJE SELL LIMITA ****/
    let pfSellLimit = portfolio.limiti['sell'];
    if (pfSellLimit) {
        chartData.m1.sellLimiti.push(pfSellLimit.limitCijena);
    } else {
        chartData.m1.sellLimiti.push(null);
    }
    shiftUnshift(chartData.m1.sellLimiti, duljinaCharta);

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
        shiftUnshift(chartData.m1.pozStopovi[c], duljinaCharta);
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
        shiftUnshift(chartData.m1.traileri[c], duljinaCharta);
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
    chartData.m15.high.push(tripletKendl.k1.H);
    chartData.m15.low.push(tripletKendl.k1.L);
    chartData.m15.vrijeme.push(tripletKendl.k1.datum + ' ' + String(tripletKendl.k1.sat).padStart(2, "0") + ':' + String(tripletKendl.k1.minuta).padStart(2, "0"));
    chartData.m15.pasivnoEUR.push(trenutnoEura(tripletKendl.k1.C, portfolio).uEUR);
    chartData.m15.pasETHuEUR.push(trenutnoEura(tripletKendl.k1.C, portfolio).uETH);
    chartData.m15.aktLimitiuEUR.push(trenutnoEura(tripletKendl.k1.C, portfolio).uLimitima);
    chartData.m15.aktPozicijeuEUR.push(trenutnoEura(tripletKendl.k1.C, portfolio).uPozicijama);
    for (let c in chartData.m15) {
        shiftUnshift(chartData.m15[c], duljinaCharta);
    }
}

// FORMATIRANJE ZA CHART JS
function stvaranjeCharta(chartData) {
    let chartFormatiran = {};
    let m1Dataset = [];
    // guramo cijenu
    m1Dataset.push(templ.cijenaTemplate(chartData.m1.close));
    // buy limite
    m1Dataset.push(templ.buyLimitTemplate(chartData.m1.buyLimiti));
    // sell limite
    m1Dataset.push(templ.sellLimitTemplate(chartData.m1.sellLimiti));
    // stopove
    for (let i in chartData.m1.pozStopovi) {
        let lejbl = 'Stop ' + i + ' || ulazna cijena: ' + chartData.ulazneCijene[i].toFixed(2);
        m1Dataset.push(templ.stopTemplate(lejbl, chartData.m1.pozStopovi[i], chartData.boje[i]));
    }
    // trailere
    for (let i in chartData.m1.traileri) {
        let lejbl = 'Trailer ' + i + ' || ulazna cijena: ' + chartData.ulazneCijene[i].toFixed(2);
        m1Dataset.push(templ.trailerTemplate(lejbl, chartData.m1.traileri[i], chartData.boje[i]));
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
    m15Dataset.push(templ.cijenaTemplate(chartData.m15.high));
    m15Dataset.push(templ.cijenaTemplate(chartData.m15.low));
    m15Dataset.push(templ.pfTemplate('Portfolio EUR', chartData.m15.pasivnoEUR, plavaBoja));
    m15Dataset.push(templ.pfTemplate('Portfolio ETH u EURima', chartData.m15.pasETHuEUR, rozaBoja));
    m15Dataset.push(templ.pfTemplate('Limiti u EURima', chartData.m15.aktLimitiuEUR, zelenaBoja));
    m15Dataset.push(templ.pfTemplate('Pozicije u EURima', chartData.m15.aktPozicijeuEUR, crvenaBoja));
    
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

const stratConfig = {
    iznosZaUlog: 0.5,
    koefPhi: 1,
    koefLambda: 1,
    koefTau: 0.2,
    koefKappa: 2,
    ciklusaJahanja: 3
}

function egzekutorStrategije(config, set) {
    let dev5 = devijacija(set.ss5, 20);
    let dev15 = devijacija(set.ss15, 20);
    
    let kendlic = set.ss1[set.ss1.length - 1];
    let cijenaSad = kendlic.C;
    let iznos = config.iznosZaUlog;
    let odmakPhi = config.koefPhi * dev5;
    let odmakLambda = config.koefLambda * dev5;
    let odmakTau = config.koefTau * dev5;
    let koefKappa = config.koefKappa; 

    for (let i = 0; i < config.ciklusaJahanja; i++) {
        jahanje(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau, koefKappa);
    }
}

/*-----------------ALGORITAM-------------------*/

// inicijalni krug da se popune subseti dovoljno za chart
floodanjeJezerca();


// madrfakin server
http.createServer(function (req, response) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(fs.readFileSync(gornjiHTMLPath));
    response.write('<script>');
    if (parsaj(req.url)) { kapaljka(parsaj(req.url)) } 
    // sastavljamo sendvič od HTML-a, JS-a i JSON-a
    let chartGeteri = "let ctx1min = document.getElementById('chart1min').getContext('2d');let ctx15min = document.getElementById('chart15min').getContext('2d');";
    let chart1min = "let chart1min = new Chart(ctx1min, " + JSON.stringify(stvaranjeCharta(chartData).m1) + ");";
    let chart15min = "let chart15min = new Chart(ctx15min, " + JSON.stringify(stvaranjeCharta(chartData).m15) + ");";
    response.write(chartGeteri);
    response.write(chart1min);
    response.write(chart15min);
    response.write('</script></body></html>');
    response.end();
}).listen(1337, '127.0.0.1');

console.log('Testiranje na http://127.0.0.1:1337/ ');

