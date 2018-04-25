"use strict";

// LIBRARY ZA FUNKCIJE KOJE MOGU BITI KORISNE POSVUDA PO PROGRAMU

let alatke = {};

// funkcija vraća odnos 3 broja kao postotak (na koliko posto je srednji)
alatke.odnosTriBroja = function odnosTriBroja(gornja, srednja, donja) {
    let cijeliKanal = gornja - donja;
    let donjiKanal = srednja - donja;
    let postotak = (100 * donjiKanal) / cijeliKanal;
    return postotak;
}

// template za limite
alatke.limitDataTemplate = function limitDataTemplate(pfID, tip, market, iznos, limitCijena) {
    this.pfID = pfID;
    this.tip = tip;
    this.market = market;
    this.iznos = iznos;
    this.limitCijena = limitCijena;
}

// vraća cijelu vrijednost portfolia u eurima 
alatke.trenutnoEura = function trenutnoEura(cijenaSad, portfolio) { 	
    // popisSvihCijena je stari način ove funkcije, po novome, uzima samo trenutnu cijenu i onda preračunava.
    // dakle uzima kao pretpostavku da se radi o ETH/EUR paru.
        // --staro-- popisSvihCijena je popis svih različitih valuti u kojima imamo pozicije i trenutne cijene tih valuti u EUR.
        // --staro-- U formatu { 'EUR':1.00, 'ETH':750.00, 'BTC':8500.00, 'LTC':123.45, 'BCH':1234.56 }
    let ukupnoEura = {
        'uEUR': portfolio.EUR, // pasiva
        'uETH': portfolio.ETH * cijenaSad, // pasiva
        'uLimitima': 0, // aktiva u limitima
        'uPozicijama': 0    // aktiva u pozicijama
    };
    // pretvaranje postojećih limita u EUR
    if (portfolio.limiti.buy) {
        ukupnoEura.uLimitima += portfolio.limiti.buy.umnozak;
    }
    if (portfolio.limiti.sell) {
        ukupnoEura.uLimitima += portfolio.limiti.sell.iznos * cijenaSad;
    }
    for (let pozID in portfolio.pozicije) {
        let pozicija = portfolio.pozicije[pozID];
        if (pozicija.tip === 'buy') {
            ukupnoEura.uPozicijama += pozicija.base * cijenaSad;
        } else if (pozicija.tip === 'sell') {
            ukupnoEura.uPozicijama += pozicija.quote;
        }
    }
    return ukupnoEura;
}

// MAPIRANJE CIJENE NA [0,1] - LOGISTIČKA FUNKCIJA
alatke.logisticka = function logisticka(cijenaZadnja, cijenaPredzadnja, kKoef) {
    let x = cijenaZadnja - cijenaPredzadnja;
    let y = (1 / (1 + (Math.E ** (-kKoef * x))));
    return y;
}

// MAPIRANJE [0,1] NA CIJENU - ANTI-LOGISTIČKA FUNKCIJA
alatke.antiLogisticka = function antiLogisticka(cijenaNormalna, proslaCijena, kKoef) {
    let y = cijenaNormalna;
    let x = (Math.log((1-y) / y) / (-kKoef));
    return proslaCijena + x;
}

module.exports = alatke;