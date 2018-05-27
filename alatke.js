"use strict";

// LIBRARY ZA FUNKCIJE KOJE MOGU BITI KORISNE POSVUDA PO PROGRAMU

let alatke = {};

alatke.izmisliBoju = function izmisliBoju() {
    let r = (Math.floor(Math.random() * 255));
    let g = (Math.floor(Math.random() * 255));
    let b = (Math.floor(Math.random() * 255));
    let a = (0.4 + (Math.random() * 0.3));
    let boja = 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    return boja;
}


// mini funkcija za produljenje/skraćenje dataseta (popunjava s null-ovima)
alatke.shiftUnshift = function shiftUnshift(array, duljina) {
    while (array.length !== duljina) {
        if (array.length < duljina) {
            array.unshift(null);
        } else if (array.length > duljina) {
            array.shift();
        }
    }
}

// za dodavanje minuta date objektima
alatke.plusMinuta = function plusMinuta(vrijeme, koliko) {
    //console.log(vrijeme);
    
    return new Date(vrijeme.getTime() + (koliko * 60000));
}

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

// util funkcija za vraćanje { base: 'ABC', quote: 'DEF' } objekta
alatke.baseQuote = function baseQuote(string) {
	return {
		base: string.slice(0, string.length - 3), 
		quote: string.slice(string.length - 3, string.length)
	}
}



module.exports = alatke;