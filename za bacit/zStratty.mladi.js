"use strict";

// Library sa strategijama
// Logika koja se vrti sa svakom novom informacijom s burze.
// Za potrebe backtestiranja, kendlfider bi trebao na kapaljku davati trejdove.

// U tijeku povezivanje s zEventty-jem


/*-------------------REQUIRE------------------*/

let emitterko = require('./zEventty.js');
let pozzy = require('./zPozzy.js');
let memorija = require('./memorija.js');

// lib sa indikatorima
let indi = require('./indikator.js');
let devijacija = indi.zDev;

// definiramo module.exports objekt "stratty" u koji ćemo sve trpati 
let stratty = {};

/*--------------------------FUNKCIJE----------------------------*/

/*
OVO JE TIP FUNKCIJE KOJU TREBA SKLONITI U ZASEBAN MODUL. NEKAKAV zUtilly
ILI TAKO NEŠTO. NEMA SMISLA DA JE TU SA STRATEGIJAMA.
*/
// REFORMIRATI U SKLADU S klasnaBorba.js
stratty.trenutnoEuroStanje = function trenutnoEuroStanje(popisSvihCijena) { 	
  // popisSvihCijena je popis svih različitih valuti u kojima imamo pozicije i trenutne cijene tih valuti u EUR.
  // U formatu { EUR:1.00, ETH:750.00, BTC:8500.00, XYZ:0.123 }
  let ukupnoEura = 0;
  for (let poz in memorija[portfolio].pozicije) {
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

// NIJE DOBRO. PROČITAJ NA DNU ISPOD STRATEGIJE.
/*-----------------------STRATEGIJA: JAHANJE CIJENE-----------------------*/
// THE strategija
// REFORMIRATI U SKLADU S klasnaBorba.js
stratty.stratJahanjeCijene = function stratJahanjeCijene(portfolio, cijenaSad, odmakPhi, odmakLambda) {  // strategija za jahanje cijene 
  // cijenaSad je trenutna cijena
  // odmakPhi je odmak stop triggera (željeni profit)
  // odmakLambda je odmak slijedećeg limita (standardna devijacija ili slično)
  
  // odmakTrailing je odmak trailing stopa, recimo 1/3 odmakPhi
  let odmakTrailing = odmakPhi / 3;

  // LOGIČKE KONSTRUKCIJE ZA ČITKIJI ALGORITAM
  let nemaNijedanLimit = (!memorija[portfolio].limiti.sell && !memorija[portfolio].limiti.buy);
  let imaBaremJedanLimit = (memorija[portfolio].limiti.sell || memorija[portfolio].limiti.buy);

  // opcija 1
  /*-----------------------AKO NEMA NIJEDAN LIMIT-----------------------*/
  // ako nema niti buy niti sell limita, znači da smo na baš prvom loopu strategije.
  // trebamo inicijalizirati strategiju, na način da postavimo oba limita.
  if (nemaNijedanLimit) {
    // postavimo sell limit
    memorija[portfolio].limiti.sell = {};
    let ciljanaSellCijena = cijenaSad + odmakLambda;
    memorija[portfolio].limiti.sell.cijenaLimit = ciljanaSellCijena;
    memorija[portfolio].limiti.sell.idParentPozicije = 0;
    emitterko.emit('postaviSellLimit', ciljanaSellCijena);
    // postavimo buy limit
    memorija[portfolio].limiti.buy = {};
    let ciljanaBuyCijena = cijenaSad - odmakLambda;
    memorija[portfolio].limiti.buy.cijenaLimit = ciljanaBuyCijena;
    memorija[portfolio].limiti.buy.idParentPozicije = 0;
    emitterko.emit('postaviBuyLimit', ciljanaBuyCijena);
  
  // opcija 2
  /*-----------------------AKO IMA BAREM JEDAN LIMIT-----------------------*/
  // (u normalnim uvjetima uvijek ima barem jedan, nekad i oba limita)
  } else if (imaBaremJedanLimit) {
    
    // LOGIČKE KONSTRUKCIJE ZA ČITKIJI ALGORITAM
    // ako nema limita iznad, znači da imamo stop trigger iznad
    let imamoStopTriggerIznadCijene = !memorija[portfolio].limiti.sell; 
    // ako nema limita ispod, znači da imamo stop trigger ispod
    let imamoStopTriggerIspodCijene = !memorija[portfolio].limiti.buy;  
    // ako imamo buy limit, a cijena je trenutno niža, znači da je triggeran
    let triggeranBuyLimit = memorija[portfolio].limiti.buy && (memorija[portfolio].limiti.buy.cijenaLimit > cijenaSad);
    // ako imamo sell limit, a cijena je trenutno viša, znači da je triggeran
    let triggeranSellLimit = memorija[portfolio].limiti.sell && (memorija[portfolio].limiti.sell.cijenaLimit < cijenaSad);
    // za live izvođenje moramo biti precizniji jer je moguće da se npr. buy limit djelomično potroši, 
    // a cijena nikad ne propadne ispod. program uopće ne bi kužio da je ušao u poziciju.
    // to se da doraditi provjerama svaki krug -> da li limiti u programu odgovaraju limitima na burzi.
    
    // ostale logičke konstrukcije koje ćemo isto deklarirati ovdje zbog scope-a, a definirati u slijedećem if-u
    let stopTriggerIznadJeTriggeran;
    let stopTriggerIspodJeTriggeran;
    let buyLimitPostojiAliDalekoJe;
    let sellLimitPostojiAliDalekoJe;

    // stop trigger (pojedinačni) ćemo definirati tu, da ostane lokalan cijeloj ovoj else-if grani (ne samo u slijedećem if pod-bloku)
    let stopTrig = {};

    // ČUPANJE STOP TRIGGERA (AKO GA IMA) I TRAŽENJE ODGOVARAJUĆE POZICIJE
    if ((imamoStopTriggerIznadCijene || imamoStopTriggerIspodCijene) && (memorija[portfolio].stopovi.length > 0)) { // drugi uvjet je redundantan ali neka ga za svaki slučaj.
      // čupamo zadnji stop trigger (otfikarili smo ga s arraya - vratiti ćemo ga kasnije ako nije triggeran)
      stopTrig = memorija[portfolio].stopovi.pop();
      // tražimo poziciju čiji je stop trigger - idemo unazad po arrayu jer je vjerojatno pri kraju arraya
      let ovaPozicija = {};
      for (let i = memorija[portfolio].pozicije.length - 1; i >= 0; i--) {
        if (memorija[portfolio].pozicije[i].idPozicije === stopTrig.idParentPozicije) {
          ovaPozicija = memorija[portfolio].pozicije[i];
          break;
        }
      }
      // sad kad imamo poziciju, nabrzaka povučemo ulaznu cijenu i id pozicije
      let cijenaOvePozicije = ovaPozicija.ulazniQuoteIznos / ovaPozicija.ulazniBaseIznos;
      let idOvePozicije = ovaPozicija.idPozicije;

      // ako bi stop trigger trebao biti iznad cijene, a cijena je sad iznad stop triggera, znači da je triggeran stop trigger!
      stopTriggerIznadJeTriggeran = imamoStopTriggerIznadCijene && (cijenaSad > stopTrig.triggerCijena);
      // inače ako je obratna situacija (triger treba biti ispod, a ispada da je cijena sad ispod triggera!)
      stopTriggerIspodJeTriggeran = imamoStopTriggerIspodCijene && (cijenaSad < stopTrig.triggerCijena);
      
      // Ako imamo buy limit ispod i stop trigger iznad onda (stopTrig.triggerCijena, cijenaSad, memorija[portfolio].limiti.buy.cijenaLimit)
      let cijenaJeuGornjemKanalu = odnosTriBroja(stopTrig.triggerCijena, cijenaSad, memorija[portfolio].limiti.buy.cijenaLimit) > 50;
      // Ako imamo sell limit iznad i stop trigger ispod onda (memorija[portfolio].limiti.sell.cijenaLimit, cijenaSad, stopTrig.triggerCijena)
      let cijenaJeuDonjemKanalu = odnosTriBroja(memorija[portfolio].limiti.sell.cijenaLimit, cijenaSad, stopTrig.triggerCijena) < 50;

      // ako ima buy limit, a daleko je od cijene - treba ga približiti
      buyLimitPostojiAliDalekoJe = memorija[portfolio].limiti.buy && cijenaJeuGornjemKanalu;
      // ako ima sell limit, a daleko je od cijene - treba ga približiti
      sellLimitPostojiAliDalekoJe = memorija[portfolio].limiti.sell && cijenaJeuDonjemKanalu;
    }

    // if broj 1
    /*-----------------------STOP TRIGGER IZNAD JE TRIGGERAN?-----------------------*/
    if (stopTriggerIznadJeTriggeran) {
      // stvaramo novi trailing take profit odozdo
      let trailingTakeProfit = new TrailingStop(idOvePozicije, cijenaOvePozicije, (odmakTrailing * (-1)));
      memorija[portfolio].traileri.push(trailingTakeProfit);
      let cijenaZaTrailer = cijenaSad - odmakTrailing;
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
      let trailingTakeProfit = new TrailingStop(idOvePozicije, cijenaOvePozicije, odmakTrailing);
      memorija[portfolio].traileri.push(trailingTakeProfit);
      let cijenaZaTrailer = cijenaSad + odmakTrailing;
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