"use strict";

// Library sa strategijama
// Logika koja se vrti sa svakom novom informacijom s burze.
// Za potrebe backtestiranja, kendlfider bi trebao na kapaljku davati trejdove.

// U tijeku povezivanje s zEventty-jem

/*-------------------REQUIRE------------------*/

let emitterko = require('./zEventty.js');
let pozzy = require('./zPozzy.js');
let memorija = require('./zMemy.js');

// lib sa indikatorima
let indi = require('./zoki-indi.js');
let devijacija = indi.zDev;

// definiramo module.exports objekt "stratty" u koji ćemo sve trpati 
let stratty = {};

/*--------------------------FUNKCIJE----------------------------*/

/*
OVO JE TIP FUNKCIJE KOJU TREBA SKLONITI U ZASEBAN MODUL. NEKAKAV zUtilly
ILI TAKO NEŠTO. NEMA SMISLA DA JE TU SA STRATEGIJAMA.
*/
// REFORMIRATI U SKLADU S zPortfolio.js
stratty.trenutnoEuroStanje = function trenutnoEuroStanje(popisSvihCijena, portfolio) { 	
  // popisSvihCijena je popis svih različitih valuti u kojima imamo pozicije i trenutne cijene tih valuti u EUR.
  // U formatu { EUR:1.00, ETH:750.00, BTC:8500.00, XYZ:0.123 }
  let ukupnoEura = 0;
  for (let poz in portfolio.pozicije) {
  	if (poz.otvorena) {
  	  valutaOvePozicije = poz.ulazniBaseTiker;
  	  cijenaOveValute = popisSvihCijena[valutaOvePozicije];
  	  euriOvePozicije = poz.ulazniBaseIznos * cijenaOveValute;
  	  ukupnoEura += euriOvePozicije;
  	}
  }
  return ukupnoEura;
}

// funkcija vraća odnos 3 broja kao postotak (na koliko posto je srednji)
function odnosTriBroja(gornja, srednja, donja) {
  let cijeliKanal = gornja - donja;
  let donjiKanal = srednja - donja;
  let postotak = (100 * donjiKanal) / cijeliKanal;
  return postotak;
}

/*-----------------------STRATEGIJA: JAHANJE CIJENE-----------------------*/
// THE strategija
// REFORMIRATI U SKLADU S zPortfolio.js
stratty.stratJahanjeCijene = function stratJahanjeCijene(portfolio, cijenaSad, iznos, odmakPhi, odmakLambda, odmakTau) {  // strategija za jahanje cijene 
    // KOREKCIJA POSTOJEĆIH TRAILERA
    for (tr in portfolio.traileri) {
        tr.korekcija(cijenaSad);
    }
    // LOGIČKE KONSTRUKCIJE ZA ČITKIJI ALGORITAM
    let nemaNijedanLimit = (!portfolio.limiti.sell && !portfolio.limiti.buy);
    let imaObaLimita = (portfolio.limiti.sell && portfolio.limiti.buy);
    let imaSamoBuyLimit = (!portfolio.limiti.sell && portfolio.limiti.buy);
    let imaSamoSellLimit = (portfolio.limiti.sell && !portfolio.limiti.buy);
    /*-opcija 1--------------AKO NEMA NIJEDAN LIMIT-----------------------*/
    if (nemaNijedanLimit) {
        // postavimo sell limit
        let sellLimitData = {};
        sellLimitData.portfolio = portfolio.portfolio;
        sellLimitData.tip = 'sell';
        sellLimitData.market = 'ETH/EUR';
        sellLimitData.iznos = iznos;
        sellLimitData.limitCijena = cijenaSad + odmakLambda;
        portfolio.postLimit(sellLimitData);
        // postavimo buy limit
        let buyLimitData = {};
        buyLimitData.portfolio = portfolio.portfolio;
        buyLimitData.tip = 'buy';
        buyLimitData.market = 'ETH/EUR';
        buyLimitData.iznos = iznos;
        buyLimitData.limitCijena = cijenaSad - odmakLambda;
        portfolio.postLimit(buyLimitData);
    /*-opcija 2--------------AKO IMA DVA LIMITA-----------------------*/
    } else if (imaObaLimita) {
        let gornjaLimitCijena = portfolio.limiti.sell.limitCijena;
        let donjaLimitCijena = portfolio.limiti.buy.limitCijena;
        let cijenaJeGore = odnosTriBroja(gornjaLimitCijena, cijenaSad, donjaLimitCijena) > 50;
        let cijenaJeDole = odnosTriBroja(gornjaLimitCijena, cijenaSad, donjaLimitCijena) < 50;
        // korekcija udaljenijeg limita
        if (cijenaJeGore) {
            let novaBuyLimitCijena = cijenaSad - odmakLambda;
            let trebaPomaknutiLimit = novaBuyLimitCijena > donjaLimitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(portfolio.limiti.buy)); 
                noviLimitData.limitCijena = novaBuyLimitCijena;
                portfolio.ubiLimit('buy');
                portfolio.postLimit(noviLimitData);
            }
        } else if (cijenaJeDole) {
            let novaSellLimitCijena = cijenaSad + odmakLambda;
            let trebaPomaknutiLimit = novaSellLimitCijena < gornjaLimitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(portfolio.limiti.sell)); 
                noviLimitData.limitCijena = novaSellLimitCijena;
                portfolio.ubiLimit('sell');
                portfolio.postLimit(noviLimitData);
            }
        }
    /*-opcija 3--------------AKO IMA SAMO BUY LIMIT-----------------------*/
    } else if (imaSamoBuyLimit) {
        let pozCounterString;
        // traženje pozicije koja još ima stop (stop se briše kad je triggeran)
        for (let i = 0; i <= portfolio.pozCounter; i++) {
            pozCounterString = ((portfolio.pozCounter - i).toString()).padStart(4, "0");
            if (portfolio.pozicije[pozCounterString].stop) {
                break;
            }
        }
        let buyLimit = portfolio.limiti.buy;
        let zadnjaPozicijaSaStopom = portfolio.pozicije[pozCounterString];
        let stopTriggerIznadJeTriggeran = (zadnjaPozicijaSaStopom.tip === 'buy') && (cijenaSad > zadnjaPozicijaSaStopom.stop);  // prvi uvjet redundantan, ali neka ga
        let triggeranBuyLimit = (buyLimit.limitCijena > cijenaSad);
        let buyLimitPostojiAliDalekoJe = (odnosTriBroja(zadnjaPozicijaSaStopom.stop, cijenaSad, buyLimit.limitCijena) > 50);
        /*----------------------STOP TRIGGER IZNAD JE TRIGGERAN?-----------------------*/
        if (stopTriggerIznadJeTriggeran) {
            zadnjaPozicijaSaStopom.stopTriggeran(odmakTau); // stvori trailer
            // popravi buy limit ako treba
            let novaBuyLimitCijena = cijenaSad - odmakLambda;
            let trebaPomaknutiLimit = novaBuyLimitCijena > buyLimit.limitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(buyLimit)); 
                noviLimitData.limitCijena = novaBuyLimitCijena;
                portfolio.ubiLimit('buy');
                portfolio.postLimit(noviLimitData);
            }
            // provjeri da li ima uopće stop triggera još
            let nemaNijedanStopTrigger = true;
            for (poz in portfolio.pozicije) {
                if (poz.stop) {
                    nemaNijedanStopTrigger = false;
                    break;
                }
            }
            // ako nema više stop triggera (iznad cijene nema ničega), stvaramo novi sell limit
            if (nemaNijedanStopTrigger) {
                let limitData = JSON.parse(JSON.stringify(buyLimit));
                limitData.tip = 'sell';
                limitData.iznos = iznos;
                limitData.limitCijena = cijenaSad + odmakLambda;
                portfolio.postLimit(limitData);
            }
        /*-----------------------BUY LIMIT JE TRIGGERAN?-----------------------*/     
        } else if (triggeranBuyLimit) {
            let noviLimitData = JSON.parse(JSON.stringify(buyLimit));
            noviLimitData.iznos = iznos;
            noviLimitData.limitCijena = cijenaSad - odmakLambda;
            portfolio.postPoziciju('buy', odmakPhi);
            portfolio.postLimit(noviLimitData);
        /*-----------------------BUY LIMIT NAM JE DALEKO?-----------------------*/      
        } else if (buyLimitPostojiAliDalekoJe) {
            // korekcija buy limita
            let novaBuyLimitCijena = cijenaSad - odmakLambda;
            let trebaPomaknutiLimit = novaBuyLimitCijena > buyLimit.limitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(buyLimit)); 
                noviLimitData.limitCijena = novaBuyLimitCijena;
                portfolio.ubiLimit('buy');
                portfolio.postLimit(noviLimitData);
            }
        }
    /*-opcija 4--------------AKO IMA SAMO SELL LIMIT-----------------------*/
    } else if (imaSamoSellLimit) {
        let pozCounterString;
        // traženje pozicije koja još ima stop (stop se briše kad je triggeran)
        for (let i = 0; i <= portfolio.pozCounter; i++) {
            pozCounterString = ((portfolio.pozCounter - i).toString()).padStart(4, "0");
            if (portfolio.pozicije[pozCounterString].stop) {
                break;
            }
        }
        let sellLimit = portfolio.limiti.sell;
        let zadnjaPozicijaSaStopom = portfolio.pozicije[pozCounterString];
        let stopTriggerIspodJeTriggeran = (zadnjaPozicijaSaStopom.tip === 'sell') && (cijenaSad < zadnjaPozicijaSaStopom.stop);  // prvi uvjet redundantan, ali neka ga
        let triggeranSellLimit = (sellLimit.limitCijena < cijenaSad);
        let sellLimitPostojiAliDalekoJe = (odnosTriBroja(sellLimit.limitCijena, cijenaSad, zadnjaPozicijaSaStopom.stop) < 50);
        /*----------------------STOP TRIGGER ISPOD JE TRIGGERAN?-----------------------*/
        if (stopTriggerIspodJeTriggeran) {
            zadnjaPozicijaSaStopom.stopTriggeran(odmakTau); // stvori trailer
            // popravi sell limit ako treba
            let novaSellLimitCijena = cijenaSad + odmakLambda;
            let trebaPomaknutiLimit = novaSellLimitCijena < sellLimit.limitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(sellLimit)); 
                noviLimitData.limitCijena = novaSellLimitCijena;
                portfolio.ubiLimit('sell');
                portfolio.postLimit(noviLimitData);
            }
            // provjeri da li ima uopće stop triggera još
            let nemaNijedanStopTrigger = true;
            for (poz in portfolio.pozicije) {
                if (poz.stop) {
                    nemaNijedanStopTrigger = false;
                    break;
                }
            }
            // ako nema više stop triggera (ispod cijene nema ničega), stvaramo novi buy limit
            if (nemaNijedanStopTrigger) {
                let limitData = JSON.parse(JSON.stringify(sellLimit));
                limitData.tip = 'buy';
                limitData.iznos = iznos;
                limitData.limitCijena = cijenaSad - odmakLambda;
                portfolio.postLimit(limitData);
            }
        /*-----------------------SELL LIMIT JE TRIGGERAN?-----------------------*/     
        } else if (triggeranSellLimit) {
            let noviLimitData = JSON.parse(JSON.stringify(sellLimit));
            noviLimitData.iznos = iznos;
            noviLimitData.limitCijena = cijenaSad + odmakLambda;
            portfolio.postPoziciju('sell', odmakPhi);
            portfolio.postLimit(noviLimitData);
        /*-----------------------SELL LIMIT NAM JE DALEKO?-----------------------*/      
        } else if (sellLimitPostojiAliDalekoJe) {
            // korekcija sell limita
            let novaSellLimitCijena = cijenaSad + odmakLambda;
            let trebaPomaknutiLimit = novaSellLimitCijena < sellLimit.limitCijena;
            if (trebaPomaknutiLimit) {
                let noviLimitData = JSON.parse(JSON.stringify(sellLimit)); 
                noviLimitData.limitCijena = novaSellLimitCijena;
                portfolio.ubiLimit('sell');
                portfolio.postLimit(noviLimitData);
            }
        }
    } // zatvaranje zadnje opcije
} // zatvaranje cijele funkcije

module.exports = stratty;