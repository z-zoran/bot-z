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
let duljinaCharta = 60;

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
let plavaBoja = 'rgba(48, 146, 166, 0.95)';
let zelenaBoja = 'rgba(36, 126, 51, 0.95)';
let zutaBoja = 'rgba(231, 227, 8, 0.95)';
let rozaBoja = 'rgba(254, 57, 211, 0.78)';
let purpleBoja = 'rgba(150, 6, 253, 0.78)';



/*-----------------FUNKCIJE-------------------*/

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
<<<<<<< HEAD
        if (lista.length > duljinaCharta) {
            console.log(lista.length);
            //console.log(lista);
            lista.shift();
=======
        if (chartData.m1[lista].length > duljinaCharta) {
            chartData.m1[lista].shift();
>>>>>>> 29abb675ea37107903de3eda64c68696d9dca140
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
        } NEKA VRSTA BREJKA AKO SMO NA KRAJU KENDL-PAKETA.
        ZASAD NE TREBA, KASNIJE ĆE BIT BITNO.
        */
        filanjeSubsetova();
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
        // pisalo.pisi(poruka);
        jahanje(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau);
        formatiranjeChData(chartData);
    }
}

// chart objekti koje JSON-iramo da ih ubacimo u sendvič
let chData5min = {};
let chData15min = {};

<<<<<<< HEAD
let chData1min = {};
chData1min.type = 'bar';
chData1min.data = {};
chData1min.data.labels = chartData.m1.vrijeme;
chData1min.data.datasets = [];
chData1min.options = {};
//chData1min.options.
for (let i = 0; i < 7; i++) {
    chData1min.data.datasets[i] = {};
}

chData1min.data.datasets[0].type = 'line';
chData1min.data.datasets[0].label = 'Cijena';
chData1min.data.datasets[0].data = chartData.m1.close;

chData1min.data.datasets[1].type = 'line';
chData1min.data.datasets[1].label = 'EUR pasiva';
chData1min.data.datasets[1].data = chartData.m1.pasivnoEUR;

chData1min.data.datasets[2].type = 'line';
chData1min.data.datasets[2].label = 'ETH pasiva (u EUR)';
chData1min.data.datasets[2].data = chartData.m1.pasETHuEUR;
=======
>>>>>>> 29abb675ea37107903de3eda64c68696d9dca140


function formatiranjeChData(chartData) {
    chData1min.type = 'bar';
    chData1min.data = {};
    chData1min.data.labels = chartData.m1.vrijeme;
    chData1min.data.datasets = [];
    chData1min.options = {};
    chData1min.options.responsive = false;
    chData1min.options.animation = {};
    chData1min.options.animation.duration = 0;
    chData1min.options.scales = {};
    //chData1min.options.scales.xAxes = {stacked: true};
    //chData1min.options.scales.yAxes = {stacked: true};
    for (let i = 0; i < 7; i++) {
        chData1min.data.datasets[i] = {};
        chData1min.data.datasets[i].fill = false;
    }
    
    chData1min.data.datasets[0].type = 'line';
    chData1min.data.datasets[0].label = 'Cijena';
    chData1min.data.datasets[0].data = chartData.m1.close;
    chData1min.data.datasets[0].borderColor = crnaBoja;
    
    chData1min.data.datasets[1].type = 'bar';
    chData1min.data.datasets[1].label = 'EUR pasiva';
    chData1min.data.datasets[1].data = chartData.m1.pasivnoEUR;
    
    chData1min.data.datasets[2].type = 'bar';
    chData1min.data.datasets[2].label = 'ETH pasiva (u EUR)';
    chData1min.data.datasets[2].data = chartData.m1.pasETHuEUR;
    
    chData1min.data.datasets[3].type = 'line';
    chData1min.data.datasets[3].label = 'Sell limit';
    chData1min.data.datasets[3].data = chartData.m1.gornjiLimit;
    chData1min.data.datasets[3].options = {};
    chData1min.data.datasets[3].options.showLine = false;
    
    chData1min.data.datasets[4].type = 'line';
    chData1min.data.datasets[4].label = 'Buy limit';
    chData1min.data.datasets[4].data = chartData.m1.donjiLimit;
    chData1min.data.datasets[4].options = {};
    chData1min.data.datasets[4].options.showLine = false;
    
    chData1min.data.datasets[5].type = 'line';
    chData1min.data.datasets[5].label = 'Gornji stop';
    chData1min.data.datasets[5].data = chartData.m1.gornjiStop;
    chData1min.data.datasets[5].options = {};
    chData1min.data.datasets[5].options.showLine = false;
    
    chData1min.data.datasets[6].type = 'line';
    chData1min.data.datasets[6].label = 'Donji stop';
    chData1min.data.datasets[6].data = chartData.m1.donjiStop;
    chData1min.data.datasets[6].options = {};
    chData1min.data.datasets[6].options.showLine = false;

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


// djelovi sendviča koje server sklapa da bi dao cjeloviti html sa js skriptama unutra.
let salata1 = "let ctx1min = document.getElementById('chart1min').getContext('2d');";
//let salata2 = "let ctx5min = document.getElementById('chart5min').getContext('2d');";
//let salata3 = "let ctx15min = document.getElementById('chart15min').getContext('2d');";

<<<<<<< HEAD
=======
//let slanina = "let chart1min = new Chart(ctx1min, " + JSON.stringify(chData1min) + ");";
//let sir = "let chart5min = new Chart(ctx5min, " + JSON.stringify(chData5min) + ");";
//let mesina = "let chart15min = new Chart(ctx15min, " + JSON.stringify(chData15min) + ");";

>>>>>>> 29abb675ea37107903de3eda64c68696d9dca140

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
    }
    // sastavljamo sendvič od HTML-a, JS-a i JSON-a
    response.write(salata1);
    //response.write(salata2);
    //response.write(salata3);


<<<<<<< HEAD
    let slanina = "let chart1min = new Chart(ctx1min, " + JSON.stringify(chData1min) + ");";
    let sir = "let chart5min = new Chart(ctx5min, " + JSON.stringify(chData5min) + ");";
    let mesina = "let chart15min = new Chart(ctx15min, " + JSON.stringify(chData15min) + ");";
    
    


    response.write(slanina);
    response.write(sir);
    response.write(mesina);

    response.write(String(chartData.m1.close.length));
=======
    
    response.write("let chart1min = new Chart(ctx1min, " + JSON.stringify(chData1min) + ");");
    //response.write(slanina);
    //response.write(sir);
    //response.write(mesina);
>>>>>>> 29abb675ea37107903de3eda64c68696d9dca140
    
    // donji dio HTML-a, od </script> nadalje
    response.write(fs.readFileSync(donjiHTMLPath));
    response.end();
}).listen(1337, '127.0.0.1');

console.log('HTMLburger ti je na adresi http://127.0.0.1:1337/ i pljunuo sam u njega.');





// pisalo.end();



