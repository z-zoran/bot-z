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
const portfolio = memorija[pfID] = new klas.Portfolio(pfID, 10000, 10, 0, 0, 0);
console.log(portfolio.EUR);
const jahanje = strat.stratJahanjeCijene;

// duljina charta (broj vremenskih jedinica)
const duljinaCharta = 60;

/* pathovi za gornje i donje pecivo sendviča */
const gornjiHTMLPath = './HTMLburgerGornji.html';

/*-----------------INICIJALNE DEKLARACIJE-------------------*/

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
 * glavniPotok  -->   kanalizacija() --> set1min
 * (dolazni stream)               -----> set5min
 *                              -------> set15min
 */
//

let tekst = '123 nešto.'; 
const agroPotok = require('./agroPotok.js');

// CONFIGURACIJA ZA GLAVNI POTOK
let putanja = './exchdata/testdata2.csv';
const mod = 'simulacija' // ili 'trening-aps' ili 'trening-log'
const inputter = fs.createReadStream(putanja);
const rezolucija = 1;
const inSize = 15;
const outSize = 2;
const prosirenje = 1;

// instanciramo glavniPotok i kanale
//const glavniPotok = agroPotok.agro(mod, inputter, rezolucija, inSize, outSize, prosirenje);
const kanal = {
    k1: agroPotok.agro(mod, inputter, 1, inSize, outSize, prosirenje),
    k5: agroPotok.agro(mod, inputter, 5, inSize, outSize, prosirenje),
    k15: agroPotok.agro(mod, inputter, 15, inSize, outSize, prosirenje)
}
/*
const kanal = {
    k1: glavniPotok.pipe(agroPotok.Agregator(1)),
    k5: glavniPotok.pipe(agroPotok.Agregator(5)),
    k15: glavniPotok.pipe(agroPotok.Agregator(15))
}
*/
const set = {
    ss1: [],
    ss5: [],
    ss15: []
}

/*-----------------FUNKCIJE-------------------*/

/* algoritam */
// initFloodanje(set,kanal)

async function spremanPotok(potok) {
    return new Promise(resolve => potok.on('readable', resolve));
}

async function kapaljka(potok) {
    let kap = potok.read();
    if (kap) {
        return new Promise(resolve => resolve(kap));
    } else {
        return new Promise(resolve => {
            spremanPotok(potok).then(() => {
                kapaljka(potok).then(kap => resolve(kap));
            });
        });
    }
}

async function izKanalaKapamo(kanal) {
    let kap = {
        k1:null,
        k5:null,
        k15:null 
    }
    kap.k1 = await kapaljka(kanal.k1);
    //if (kap.k1.minuta % 5 === 0) kap.k5 = await kapaljka(kanal.k5);
    //if (kap.k1.minuta % 15 === 0) kap.k15 = await kapaljka(kanal.k15);
    console.log('kap  ' + JSON.stringify(kap.k1));
    return kap;
}

async function kapPoKap(br, kanal, set) {
    for (let i = 0; i < br; i++) {
        let kap = await izKanalaKapamo(kanal);
        if (kap.k1) set.ss1.push(kap.k1);
        if (kap.k5) set.ss5.push(kap.k5);
        if (kap.k15) set.ss15.push(kap.k15);
        console.log('kap po kap ' + i + ' ' + portfolio.EUR + '€');
        rafinerijaKapi(set);
    }
    return set;
}

function rafinerijaKapi(set) {
    // sa svakom kapi, vrtimo sve ove funkcije
    egzekutorStrategije(stratConfig, set);
    predChartifikacija(dohvatiTriplet(set));
}

async function initFloodanjeSetova(kanal, set) {
    //punimo sve setove dok najkrupniji nije došao do duljineCharta
    while (set.ss15.length < duljinaCharta) {
        let kap = await izKanalaKapamo(kanal);
        if (kap.k1) set.ss1.push(kap.k1);
        if (kap.k5) set.ss5.push(kap.k5);
        if (kap.k15) set.ss15.push(kap.k15);
        predChartifikacija(dohvatiTriplet(set));

    }
    // korigiranje duljine setova na duljinuCharta (vjerojatno 60)
    for (let ss in set) shiftUnshift(set[ss], duljinaCharta);
}

function dohvatiTriplet(set) {
    const triplet = {
        k1: set.ss1[set.ss1.length - 1],
        k5: set.ss5[set.ss5.length - 1], 
        k15: set.ss15[set.ss15.length - 1]
    }
    return triplet;
}

function parsan(url) {
    if (url.slice(0, 4) === '/?i=') {
        return url.slice(4, url.length);
    } else {
        return null;
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

// mini funkcija za produljenje/skraćenje dataseta (popunjava s null-ovima)
function shiftUnshift(array, duljina) {
    while (array.length !== duljina) {
        if (array.length < duljina) {
            array.unshift(null);
        } else if (array.length > duljina) {
            array.shift();
        }
    }
}

// FUNKCIJA KOJA ČUPA DATA IZ portfolio I KENDLOVA
// damo joj triplet kendlova (1min, 5min i 15min), a ona updejta data na odgovarajući način
// malo počistiti odnosno bolje parametrizirati layout, odnosno datasetove
function predChartifikacija(tripletKendl) {

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
    koefPhi: 0.5,
    koefLambda: 2,
    koefTau: 0.3,
    koefKappa: 2.5,
    ciklusaJahanja: 1
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
    console.log('egzekutor dev5 ' + dev5);
    for (let i = 0; i < config.ciklusaJahanja; i++) {
        jahanje(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau, koefKappa);
    }
}

function monterGlave(res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(fs.readFileSync(gornjiHTMLPath));
    res.write('<script>');
}

function nakalemiteljRepa(res) {
    let chartGeteri = "let ctx1min = document.getElementById('chart1min').getContext('2d');let ctx15min = document.getElementById('chart15min').getContext('2d');";
    let chart1min = "let chart1min = new Chart(ctx1min, " + JSON.stringify(stvaranjeCharta(chartData).m1) + ");";
    let chart15min = "let chart15min = new Chart(ctx15min, " + JSON.stringify(stvaranjeCharta(chartData).m15) + ");";
    res.write(chartGeteri);
    res.write(chart1min);
    res.write(chart15min);
    res.write('</script></body></html>');
    res.end();
}

/*-----------------ALGORITAM-------------------*/

initFloodanjeSetova(kanal, set);

// madrfakin server
http.createServer(function (request, response) {
    monterGlave(response);
    let koliko = parsan(request.url);
    console.log(koliko);
    if (koliko) {
        kapPoKap(koliko, kanal, set)
            .then(nakalemiteljRepa(response));
    } else nakalemiteljRepa(response);

}).listen(1337, '127.0.0.1');

console.log('Testiranje na http://127.0.0.1:1337/ ');

