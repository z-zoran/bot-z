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
    // LOGIČKE KONSTRUKCIJE ZA ČITKIJI ALGORITAM
    let nemaNijedanLimit = (!portfolio.limiti.sell && !portfolio.limiti.buy);
    let imaDvaLimita = (portfolio.limiti.sell && portfolio.limiti.buy);
    let imaJedanLimit = (portfolio.limiti.sell || portfolio.limiti.buy);
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
    
    /*-opcija 3--------------AKO IMA BAREM JEDAN LIMIT-----------------------*/
    } else if (imaDvaLimita) {
        let gornjiLimit = portfolio.limiti.sell.limitCijena;
        let donjiLimit = portfolio.limiti.buy.limitCijena;
        let cijenaJeGore = odnosTriBroja(gornjiLimit, cijenaSad, donjiLimit) > 50;
        let cijenaJeDole = odnosTriBroja(gornjiLimit, cijenaSad, donjiLimit) < 50;
        if (cijenaJeGore) {
            // korekcija buy limita
            let mozdaNoviBuyLimit = cijenaSad - odmakLambda;
            let trebaPomaknutiLimit = mozdaNoviBuyLimit > donjiLimit;
            if (trebaPomaknutiLimit) {
                portfolio.ubiLimit('buy');
                portfolio.postLimit()
                // ubi buy limit
                // postavi novi buy limit
            }

        } else if (cijenaJeDole) {

        }
    
    /*-opcija 3--------------AKO IMA BAREM JEDAN LIMIT-----------------------*/
    } else if (imaJedanLimit) {
        let limitCounterString = (portfolio.limitCounter.toString()).padStart(4, "0");
        let pozCounterString;
        // traženje pozicije koja još ima stop (stop se briše kad je triggeran)
        for (let i = 0; i <= portfolio.pozCounter; i++) {
            // tu dovršiti
            pozCounterString = ((portfolio.pozCounter - i).toString()).padStart(4, "0");
            if (portfolio.pozicije[pozCounterString].stop) {
                break;
            }
        } 
        let nemaNijednaPozicija = (Object.keys(portfolio.pozicije).length === 0);
        if (nemaNijednaPozicija) {
            
        }
        // provjeriti da li postoji ijedna pozicija sa stopom
        // ako ne postoji, to će utjecati na neke od if-ova, jer se ravnaju prema stop trigerima pozicija.
        // ako je ovo loop broj 2 strategije, onda postoje samo dva limita, i nema pozicija nigdje
        //

        let zadnjiLimit = portfolio.limiti[limitCounterString];
        let zadnjaPozicijaSaStopomSaStopom = portfolio.pozicije[pozCounterString];
        // LOGIČKE KONSTRUKCIJE ZA ČITKIJI ALGORITAM
        // if broj 1
        let stopTriggerIznadJeTriggeran = (zadnjaPozicijaSaStopom.tip === 'buy') && (cijenaSad > zadnjaPozicijaSaStopom.stop);
        // if broj 2
        let stopTriggerIspodJeTriggeran = (zadnjaPozicijaSaStopom.tip === 'sell') && (cijenaSad < zadnjaPozicijaSaStopom.stop);
        // if broj 3
        let triggeranBuyLimit = (portfolio.limiti.buy.limitCijena > cijenaSad);
        // if broj 4
        let triggeranSellLimit = (portfolio.limiti.sell.limitCijena < cijenaSad);
        // if broj 5
        let buyLimitPostojiAliDalekoJe = (portfolio.limiti.buy) && (odnosTriBroja(zadnjaPozicijaSaStopom.stop, cijenaSad, portfolio.limiti.buy.limitCijena) > 50);
        // if broj 6
        let sellLimitPostojiAliDalekoJe = (portfolio.limiti.sell) && (odnosTriBroja(portfolio.limiti.sell.limitCijena, cijenaSad, stopTrig.triggerCijena) < 50);

        /*-if broj 1-------------STOP TRIGGER IZNAD JE TRIGGERAN?-----------------------*/
        if (stopTriggerIznadJeTriggeran) {
        // stvaramo novi trailing take profit odozdo
        memorija[portfolio].traileri.push(trailingTakeProfit);
        let cijenaZaTrailer = cijenaSad - odmakTau;
        emitterko.emit('triggeranStopPremaGore', cijenaZaTrailer);

        
        // korekcija buy limita
        let mozdaNoviBuyLimit = cijenaSad - odmakLambda;
        let trebaPomaknutiLimit = mozdaNoviBuyLimit > memorija[portfolio].limiti.buy.cijenaLimit;
        if (trebaPomaknutiLimit) {
            memorija[portfolio].limiti.buy.cijenaLimit = mozdaNoviBuyLimit;
            emitterko.emit('postaviBuyLimit', memorija[portfolio].limiti.buy.cijenaLimit);
        }

        // if broj 2
        /*-----------------------STOP TRIGGER ISPOD JE TRIGGERAN?-----------------------*/     
        } else if (stopTriggerIspodJeTriggeran) {
        // stvaramo novi trailing take profit odozgo
        let trailingTakeProfit = new TrailingStop(idOvePozicije, cijenaOvePozicije, odmakTau);
        memorija[portfolio].traileri.push(trailingTakeProfit);
        let cijenaZaTrailer = cijenaSad + odmakTau;
        emitterko.emit('triggeranStopPremaDole', cijenaZaTrailer);
        
        // korekcija sell limita
        let mozdaNoviSellLimit = cijenaSad + odmakLambda;
        let trebaPomaknutiLimit = mozdaNoviSellLimit < memorija[portfolio].limiti.sell.cijenaLimit;
        if (trebaPomaknutiLimit) {
            memorija[portfolio].limiti.sell.cijenaLimit = mozdaNoviSellLimit;
            emitterko.emit('postaviSellLimit', memorija[portfolio].limiti.sell.cijenaLimit);
        }


        // if broj 3
        /*-----------------------BUY LIMIT JE TRIGGERAN?-----------------------*/     
        } else if (triggeranBuyLimit) {
        
        // STVORI NOVU POZICIJU
        // POPRAVI (STVORI NOVI) BUY LIMIT
        // STVORI NOVI STOP TRIGGER




        // if broj 4
        /*-----------------------SELL LIMIT JE TRIGGERAN?-----------------------*/     
        } else if (triggeranSellLimit) {
        // STVORI NOVU POZICIJU
        // POPRAVI (STVORI NOVI) SELL LIMIT
        // STVORI NOVI STOP TRIGGER

        


        // if broj 5
        /*-----------------------IMA BUY LIMIT I DALEKO NAM JE?-----------------------*/      
        } else if (buyLimitPostojiAliDalekoJe) {
        // nije triggeran nikakav stop trigger, pa vraćamo otfikareni stop trigger nazad u array memorija[portfolio].stopovi...
        memorija[portfolio].stopovi.push(stopTrig);

        // korekcija buy limita
        let mozdaNoviBuyLimit = cijenaSad - odmakLambda;
        let trebaPomaknutiLimit = mozdaNoviBuyLimit > memorija[portfolio].limiti.buy.cijenaLimit;
        
        if (trebaPomaknutiLimit) {
            memorija[portfolio].limiti.buy.cijenaLimit = mozdaNoviBuyLimit;
            emitterko.emit('postaviBuyLimit', memorija[portfolio].limiti.buy.cijenaLimit);
        }
        
        // if broj 6
        /*-----------------------IMA SELL LIMIT I DALEKO NAM JE?-----------------------*/            
        } else if (sellLimitPostojiAliDalekoJe) {
        // nije triggeran nikakav stop trigger, pa vraćamo otfikareni stop trigger nazad u array memorija[portfolio].stopovi...
        memorija[portfolio].stopovi.push(stopTrig);

        // korekcija buy limita
        let mozdaNoviSellLimit = cijenaSad + odmakLambda;
        let trebaPomaknutiLimit = mozdaNoviSellLimit < memorija[portfolio].limiti.buy.cijenaLimit;
        
        if (trebaPomaknutiLimit) {
            memorija[portfolio].limiti.sell.cijenaLimit = mozdaNoviSellLimit;
            emitterko.emit('postaviSellLimit', memorija[portfolio].limiti.sell.cijenaLimit);
        }
        
        } else { 
        // hvatamo error ako je algoritam procurio kroz if-ove 1-6. 
        emitterko.emit('procurioSam');
        }
    } // zatvaranje "AKO IMA BAREM JEDAN LIMIT" (opcija 2)
} // zatvaranje cijele funkcije

module.exports = stratty;