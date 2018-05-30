"use strict";

// instanciranje klijenta prema binanceu
const binance = require('node-binance-api');
const memorija = require('./memorija.js');
const symbol = 'ETHBTC';
// memorija kendlovi
if (!memorija.kendlovi[symbol]) memorija.kendlovi[symbol] = [];


function dobarRedoslijed(kendlNovi, kendlStari, rezolucija) {
    let razlika = kendlNovi.openTime - kendlStari.openTime;
    let korak = rezolucija * 60000; // rezolucija je u min, korak je u milisek
    if (razlika === korak) {
        return true;
    } else return false;
}

function krpanjeRupaKendlArraya(kendlArr, noviKendl, rezolucija) {
    if (rezolucija === 1) rezStr = '1m';
    if (rezolucija === 5) rezStr = '5m';
    if (rezolucija === 15) rezStr = '15m';
    if (rezolucija === 60) rezStr = '1h';
    let zadnji = kendlArr[kendlArr.length - 1];
    let korak = rezolucija * 60000; // rezolucija je u min, korak je u milisek
    let razlika = noviKendl.openTime - zadnji.openTime;
    if (razlika % korak === 0) {
        let koliko = (razlika / korak) - 1;
        if (koliko > 500) throw new Error('Previše kendlova je rupa. ' + noviKendl.openTime);
    } else throw new Error('Čudna razlika između timestampova. ' + noviKendl.openTime);
    dohvatiKendlove(symbol, koliko, kendlArr, rezStr).then(() => {
        if (dobarRedoslijed(noviKendl, zadnji, rezolucija)) kendlArr.push(noviKendl);
    });
}

async function dohvatiKendlove(symbol, koliko, kendlArr, rezStr) {
    let 
    binance.candlesticks(symbol, rezStr, (error, kendlovi, symbol) => {
        kendlovi.forEach(kendl => {
            let kndl = {
                openTime: kendl[0],
                open: kendl[1],
                high: kendl[2],
                low: kendl[3],
                close: kendl[4],
                volume: kendl[5],
                closeTime: kendl[6],
                quoteVolume: kendl[7],
                trades: kendl[8],
                buyBaseVolume: kendl[9],
                buyQuoteVolume: kendl[10],
            }
            memorija.kendlovi[symbol].push(new Kendl(kndl));
        });
    }, {limit: koliko, startTime: start});
}


function Kendl(kendl) {
    this.openTime = kendl.openTime;
    this.closeTime = kendl.closeTime;
    this.O = kendl.open;
    this.H = kendl.high;
    this.L = kendl.low;
    this.C = kendl.close;
    this.volume = kendl.volume;
    this.buyVolume = kendl.buyBaseVolume;
    this.trades = kendl.trades;
}
