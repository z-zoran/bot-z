"use strict";

// LIBRARY ZA FUNKCIJE KOJE MOGU BITI KORISNE POSVUDA PO PROGRAMU

let util = {};

// funkcija vraća odnos 3 broja kao postotak (na koliko posto je srednji)
util.odnosTriBroja = function odnosTriBroja(gornja, srednja, donja) {
    let cijeliKanal = gornja - donja;
    let donjiKanal = srednja - donja;
    let postotak = (100 * donjiKanal) / cijeliKanal;
    return postotak;
}

// template za limite
util.limitDataTemplate = function limitDataTemplate(pfID, tip, market, iznos, limitCijena) {
    this.pfID = pfID;
    this.tip = tip;
    this.market = market;
    this.iznos = iznos;
    this.limitCijena = limitCijena;
}

// (nije funkcionalno trenutno) REFORMIRATI U SKLADU S klasnaBorba.js 
util.trenutnoEuroStanje = function trenutnoEuroStanje(popisSvihCijena, portfolio) { 	
    // popisSvihCijena je popis svih različitih valuti u kojima imamo pozicije i trenutne cijene tih valuti u EUR.
    // U formatu { 'EUR':1.00, 'ETH':750.00, 'BTC':8500.00, 'LTC':123.45, 'BCH':1234.56 }
    let ukupnoEura = 0;
    // pretvaranje pasivnog kapitala portfolia u EUR
    for (let valuta in popisSvihCijena) {
        ukupnoEura += popisSvihCijena[valuta] * portfolio[valuta];
    }
    // pretvaranje postojećih limita u EUR
    if (portfolio.limiti.buy) {
        ukupnoEura += portfolio.limiti.buy.umnozak * popisSvihCijena[portfolio.limiti.buy.quoteTiker];
    }
    if (portfolio.limiti.sell) {
        ukupnoEura += portfolio.limiti.sell.iznos * popisSvihCijena[portfolio.limiti.sell.baseTiker];
    }
    for (let pozicija in portfolio.pozicije) {
        if (pozicija.tip === 'buy') {
            ukupnoEura += pozicija.iznos * popisSvihCijena[pozicija.baseTiker];
        } else if (pozicija.tip === 'sell') {
            ukupnoEura += pozicija.umnozak * popisSvihCijena[pozicija.quoteTiker];
        }
    }
    return ukupnoEura;
}

module.exports = util;