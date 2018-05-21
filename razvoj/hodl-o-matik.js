"use strict";

/*** PROTOTIP IMPLEMENTACIJA HODL-BOTa ***/

const ccxt = require('ccxt');

let coinMarketCap = new ccxt.coinmarketcap()

let blacklista = [
    'tether',
    'bitcoin-gold',
    'bitcoin-diamond',
    'ethereum-classic'
]

async function provjera() {
    await coinMarketCap.loadMarkets();
    let koliko = 50;
    //let kepovi = await coinMarketCap.publicGetTicker();
    let kepovi = pocistiBlacklistane(await coinMarketCap.publicGetTicker(), blacklista);

    kalkulirajPostotke(kepovi, koliko);
    plotaj(kepovi, koliko);

    redistribuirajPostotke(kepovi, koliko);
    plotaj(kepovi, koliko);
}

function plotaj(kepovi, koliko) {
    for (let i = 0; i < koliko; i++) {
        console.log(`${kepovi[i].rank.padEnd(2, ' ')}  ${String((kepovi[i].postotak * 100).toFixed(2)).padStart(4, ' ')} ${kepovi[i].id.padEnd(15, ' ')} `);
    }
}

function kalkulirajPostotke(kepovi, koliko) {
    let zbroj = 0;
    for (let i = 0; i < koliko; i++) {
        zbroj += Number(kepovi[i].market_cap_usd);
    }
    for (let i = 0; i < koliko; i++) {
        kepovi[i].postotak = Number(kepovi[i].market_cap_usd) / zbroj;
    }
}

function redistribuirajPostotke(kepovi, koliko) {
    for (let i = 0; i < koliko; i++) {
        if (kepovi[i].postotak > 0.1) {
            let razlika = kepovi[i].postotak - 0.1;
            kepovi[i].postotak = 0.1;
            let zbroj = 0; // zbrojimo sve preostale udjele
            for (let j = (i + 1); j < koliko; j++) {
                zbroj += kepovi[j].postotak;
            }
            // onda dodamo svakome dio razlike prema udjelu koji imaju u preostalom zbroju
            for (let j = (i + 1); j < koliko; j++) {
                kepovi[j].postotak += (kepovi[j].postotak / zbroj) * razlika;
            }
        }
    }
    let ukupno = 0;
    for (let i = 0; i < koliko; i++) {
        ukupno += kepovi[i].postotak;
    }
    console.log(ukupno);
    
}

function pocistiBlacklistane(kepovi, blacklista) {
    return kepovi.filter(kep => !blacklista.includes(kep.id));
}


provjera();

/*
let gdaxTest = new ccxt.gdax();
gdaxTest.urls = {
    api: 'https://api-public.sandbox.gdax.com'
}
gdaxTest.apiKey = '7993d522db71c00daf48bbabe2296523';
gdaxTest.secret = 'zwI0ILHWxS02fQOOrdltmuDjuASgW7354kC7oNLT0j/4GERB9tt0785P2ptszU8B4tYCYjrtD20oG7wsFYwimQ==';
gdaxTest.password = 'frazablablatrebamizbogapija';
//gdaxTest.verbose = true;


(async () => {
    let markets = await gdaxTest.loadMarkets();
    //console.log(await gdaxTest.createMarketBuyOrder ('ETH/EUR', 50));
    //console.log(await gdaxTest.createLimitBuyOrder ('ETH/EUR', 5, 180));
    //console.log(await gdaxTest.fetchMyTrades());
    let trejdovi = await gdaxTest.fetchTrades('ETH/EUR');
    console.log(trejdovi);
}) ();
*/
// GDAX obrnuto prikazuje "side" svakog trejda.
// CCXT to okrene naopako za svaki trejd.
// Dakle, kad neko napravi market buy, odnosno bude taker,
// gdax krivo kaže da je napravljen "sell", a ccxt ispravno kaže da je "buy"

