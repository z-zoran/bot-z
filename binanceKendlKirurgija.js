"use strict";

// instanciranje klijenta prema binanceu
const binance = require('node-binance-api');
const memorija = require('./memorija.js');
const symbol = 'ETHBTC';
// memorija kendlovi
if (!memorija.kendlovi[symbol]) memorija.kendlovi[symbol] = [];


function dobarRedoslijed(kendlNovi, kendlStari, rez) {
    let razlika = kendlNovi.openTime - kendlStari.openTime;
    let korak = rez * 60000; // rezolucija je u min, korak je u milisek
    if (razlika === korak) {
        return true;
    } else return false;
}

function krpanjeRupaKendlArraya(kendlArr, noviKendl, rez) {
    let rezStr = rez === 1 ? '1m' : rez === 5 ? '5m' : rez === 15 ? '15m' : rez === 60 ? '1h' : new Error('Rezolucija');
    let zadnji = kendlArr[kendlArr.length - 1];
    let korak = rez * 60000; // rezolucija je u min, korak je u milisek
    let razlika = noviKendl.openTime - zadnji.openTime;
    if (razlika % korak === 0) {
        let koliko = (razlika / korak) - 1;
        if (koliko > 500) throw new Error('Previše kendlova je rupa. ' + noviKendl.openTime);
    } else throw new Error('Čudna razlika između timestampova. ' + noviKendl.openTime);
    dohvatiKendlove(symbol, koliko, rezStr, start)
        .then((error, kendlovi, symbol) => {
            let arr = [];
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
                //memorija.kendlovi[symbol].push(new Kendl(kndl));
                arr.push(new Kendl(kndl));
            });
            let zadnjiMem = memorija.kendlovi[symbol][rezStr]
            /// tu smo
        })
        if (dobarRedoslijed(noviKendl, zadnji, rez)) kendlArr.push(noviKendl);
    });
}

function dohvatiKendlove(symbol, koliko, rezStr, start) {
    return new Promise(function(resolve, reject) {
        binance.candlesticks(symbol, rezStr, resolve, {limit: koliko, startTime: start});
    });
}


    binance.candlesticks(symbol, rezStr, (error, kendlovi, symbol) => {
        let arr = [];
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
            //memorija.kendlovi[symbol].push(new Kendl(kndl));
            arr.push(new Kendl(kndl));
        });
        return arr;
    }, {limit: koliko, startTime: start});
}

function timeout(delay) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, delay);
    });
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
