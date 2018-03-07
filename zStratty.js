"use strict";

// Library sa strategijama
// Workhorse funkcije (funkcije mazge? funkcije tovari? neznam.)

// Trebati će poubacivati metode/funkcije za komunikaciju s exchangeovima.
// Nađi u fajlu di god piše 'exchange komunikacija'

// treba složiti funkciju "pozicioniranje" koja traži najpovoljniju poziciju iz koje bi se izašlo u novu poziciju
/* nešto tipa 
    1 nađi poziciju s najpovoljnijom base valutom
    2 provjeri je li dovoljno velika za nov izlazak
*/

/*-------------------REQUIRE------------------*/


// vučemo library s pozicijama
let pozzy = require('./zPozzy.js');

// lib sa indikatorima
let indi = require('./zoki-indi.js');
let devijacija = indi.zDev;

// definiramo module.exports objekt "stratty" u koji ćemo sve trpati 
let stratty = {};

/*-------------TRČUĆE VARIJABLE---------------*/
  // Array koji sadrži sve pozicije ikada. 
  // Dopunjavamo pri stvaranju nove pozicije (metoda .izlazak)
let svePozicijeIkada = stratty.svePozicijeIkada = pozzy.svePozicijeIkada; 

let sviLimitTriggeri = stratty.sviLimitTriggeri = pozzy.sviLimitTriggeri;	
/*
LIMIT TRIGGERI DOLAZE U SLIJEDEĆEM FORMATU:
sviLimitTriggeri: {
  buy: {idParentPozicije: ...,
        cijenaLimit: ...}, 
  sell:{idParentPozicije: ...,
        cijenaLimit: ...}
}
*/
let sviStopTriggeri = stratty.sviStopTriggeri = pozzy.sviStopTriggeri;	
/*
STOP TRIGGERI DOLAZE U SLIJEDEĆEM FORMATU:
sviStopTriggeri: [
  0: {idParentPozicije: ...,
      triggerCijena: ...},
  1: {idParentPozicije: ...,
      triggerCijena: ...},
  (...)
]
*/
let sviTrailingStopovi = stratty.sviTrailingStopovi = pozzy.sviTrailingStopovi;	
/*
TRAILING STOPOVI IMAJU SVOJU KLASU.
Njih samo treba svaki krug izvrtiti svima metodu .korekcija, da se prilagode kretanju cijene.
*/

/*--------------------------FUNKCIJE----------------------------*/

stratty.trenutnoEuroStanje = function trenutnoEuroStanje(popisSvihCijena) { 	
  // popisSvihCijena je popis svih različitih valuti u kojima imamo pozicije i trenutne cijene tih valuti u EUR.
  // U formatu { EUR:1.00, ETH:750.00, BTC:8500.00, XYZ:0.123 }
  let ukupnoEura = 0;
  for (let poz in svePozicijeIkada) {
  	if (poz.otvorena) {
  	  valutaOvePozicije = poz.ulazniBaseTiker;
  	  cijenaOveValute = popisSvihCijena[valutaOvePozicije];
  	  euriOvePozicije = poz.ulazniBaseIznos * cijenaOveValute;
  	  ukupnoEura += euriOvePozicije;
  	}
  }
  return ukupnoEura;
}

function pozicioniranje(arrayPozicija) {   // funkcija za okrupnjavanje pozicija
  let arraySlobodnihPozicija = [];
  for (let i = 0; i < arrayPozicija.length; i++) {
    if (arrayPozicija[i].slobodna) {
      arraySlobodnihPozicija.push(arrayPozicija[i]);
    }
  }
  let orderaniArraySlobodnihPozicija = [];
  // unshift() ili push()
  // dovršiti logiku za sortiranje od najpovoljnije do najmanje povoljne pozicije

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
stratty.stratJahanjeCijene = function stratJahanjeCijene(cijenaSad, odmakPhi, odmakLambda) {  // strategija za jahanje cijene 
  // cijenaSad je trenutna cijena
  // odmakPhi je odmak stop triggera (željeni profit)
  // odmakLambda je odmak slijedećeg limita (standardna devijacija ili slično)
  
  // odmakTrailing je odmak trailing stopa, recimo 1/3 odmakPhi
  let odmakTrailing = odmakPhi / 3;

  // LOGIČKE KONSTRUKCIJE ZA ČITKIJI ALGORITAM
  let nemaNijedanLimit = (!sviLimitTriggeri.sell && !sviLimitTriggeri.buy);
  let imaBaremJedanLimit = (sviLimitTriggeri.sell || sviLimitTriggeri.buy);

  // opcija 1
  /*-----------------------AKO NEMA NIJEDAN LIMIT-----------------------*/
  // ako nema niti buy niti sell limita, znači da smo na baš prvom loopu strategije.
  // trebamo inicijalizirati strategiju, na način da postavimo oba limita.
  if (nemaNijedanLimit) {
    sviLimitTriggeri.sell = {};
    sviLimitTriggeri.sell.cijenaLimit = cijenaSad + odmakLambda;
    sviLimitTriggeri.sell.idParentPozicije = 0;
    emitterko.emit('postaviSellLimit');

    sviLimitTriggeri.buy = {};
    sviLimitTriggeri.buy.cijenaLimit = cijenaSad - odmakLambda;
    sviLimitTriggeri.buy.idParentPozicije = 0;
    emitterko.emit('postaviBuyLimit');
  
  // opcija 2
  /*-----------------------AKO IMA BAREM JEDAN LIMIT-----------------------*/
  // (u normalnim uvjetima uvijek ima barem jedan, nekad i oba limita)
  } else if (imaBaremJedanLimit) {
    
    // LOGIČKE KONSTRUKCIJE ZA ČITKIJI ALGORITAM
    // ako nema limita iznad, znači da imamo stop trigger iznad
    let imamoStopTriggerIznadCijene = !sviLimitTriggeri.sell; 
    // ako nema limita ispod, znači da imamo stop trigger ispod
    let imamoStopTriggerIspodCijene = !sviLimitTriggeri.buy;  
    // stop trigger (pojedinačni) ćemo definirati tu, da ostane lokalan cijeloj ovoj else-if grani (ne samo u slijedećem if pod-bloku)
    let stopTrig = {};
    // ostale logičke konstrukcije koje ćemo isto deklarirati ovdje zbog scope-a, a definirati u slijedećem if-u
    let stopTriggerIznadJeTriggeran;
    let stopTriggerIspodJeTriggeran;
    let buyLimitPostojiAliDalekoJe;
    let sellLimitPostojiAliDalekoJe;

    // ČUPANJE STOP TRIGGERA (AKO GA IMA) I TRAŽENJE ODGOVARAJUĆE POZICIJE
    if ((imamoStopTriggerIznadCijene || imamoStopTriggerIspodCijene) && (sviStopTriggeri.length > 0)) { // drugi uvjet je redundantan ali neka ga za svaki slučaj.
      // čupamo zadnji stop trigger (otfikarili smo ga s arraya - vratiti ćemo ga kasnije ako nije triggeran)
      stopTrig = sviStopTriggeri.pop();
      // tražimo poziciju čiji je stop trigger - idemo unazad po arrayu jer je vjerojatno pri kraju arraya
      let ovaPozicija = {};
      for (let i = svePozicijeIkada.length - 1; i >= 0; i--) {
        if (svePozicijeIkada[i].idPozicije === stopTrig.idParentPozicije) {
          ovaPozicija = svePozicijeIkada[i];
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
      
      // odnos tri broja - (gornji, srednji, donji); odnosno (stop trig, trenutna cijena, buy limit), ili (sell limit, trenutna cijena, stop trig).
      // Ako imamo buy limit ispod i stop trigger iznad onda (stopTrig.triggerCijena, cijenaSad, sviLimitTriggeri.buy.cijenaLimit)
      let cijenaJeuGornjemKanalu = odnosTriBroja(stopTrig.triggerCijena, cijenaSad, sviLimitTriggeri.buy.cijenaLimit) > 50;
      // Ako imamo sell limit iznad i stop trigger ispod onda (sviLimitTriggeri.sell.cijenaLimit, cijenaSad, stopTrig.triggerCijena)
      let cijenaJeuDonjemKanalu = odnosTriBroja(sviLimitTriggeri.sell.cijenaLimit, cijenaSad, stopTrig.triggerCijena) < 50;

      // ako ima buy limit, a daleko je od cijene - treba ga približiti
      buyLimitPostojiAliDalekoJe = sviLimitTriggeri.buy && cijenaJeuGornjemKanalu;
      // ako ima sell limit, a daleko je od cijene - treba ga približiti
      sellLimitPostojiAliDalekoJe = sviLimitTriggeri.sell && cijenaJeuDonjemKanalu;
    }

    // if broj 1
    /*-----------------------STOP TRIGGER IZNAD JE TRIGGERAN?-----------------------*/
    if (stopTriggerIznadJeTriggeran) {
      // stvaramo novi trailing take profit odozdo
      let trailingTakeProfit = new TrailingStop(idOvePozicije, cijenaOvePozicije, odmakTrailing * (-1));
      sviTrailingStopovi.push(trailingTakeProfit);
      emitterko.emit('triggeranStopPremaGore');

      
      // korekcija buy limita
      let mozdaNoviBuyLimit = cijenaSad - odmakLambda;
      let trebaPomaknutiLimit = mozdaNoviBuyLimit > sviLimitTriggeri.buy.cijenaLimit;
      if (trebaPomaknutiLimit) {
        sviLimitTriggeri.buy.cijenaLimit = mozdaNoviBuyLimit;
        emitterko.emit('postaviBuyLimit');
      }

    // if broj 2
    /*-----------------------STOP TRIGGER ISPOD JE TRIGGERAN?-----------------------*/     
    } else if (stopTriggerIspodJeTriggeran) {
      // stvaramo novi trailing take profit odozgo
      let trailingTakeProfit = new TrailingStop(idOvePozicije, cijenaOvePozicije, odmakTrailing);
      sviTrailingStopovi.push(trailingTakeProfit);
      emitterko.emit('triggeranStopPremaDole');
      
      // korekcija sell limita
      let mozdaNoviSellLimit = cijenaSad + odmakLambda;
      let trebaPomaknutiLimit = mozdaNoviSellLimit < sviLimitTriggeri.sell.cijenaLimit;
      if (trebaPomaknutiLimit) {
        sviLimitTriggeri.sell.cijenaLimit = mozdaNoviSellLimit;
        emitterko.emit('postaviSellLimit');
      }

    // if broj 3
    /*-----------------------IMA BUY LIMIT I DALEKO NAM JE?-----------------------*/      
    } else if (buyLimitPostojiAliDalekoJe) {
      // nije triggeran nikakav stop trigger, pa vraćamo otfikareni stop trigger nazad u array sviStopTriggeri...
      sviStopTriggeri.push(stopTrig);

      // korekcija buy limita
      let mozdaNoviBuyLimit = cijenaSad - odmakLambda;
      let trebaPomaknutiLimit = mozdaNoviBuyLimit > sviLimitTriggeri.buy.cijenaLimit;
      
      if (trebaPomaknutiLimit) {
        sviLimitTriggeri.buy.cijenaLimit = mozdaNoviBuyLimit;
        emitterko.emit('postaviBuyLimit');
      }
      
    // if broj 4
    /*-----------------------IMA SELL LIMIT I DALEKO NAM JE?-----------------------*/            
    } else if (sellLimitPostojiAliDalekoJe) {
      // nije triggeran nikakav stop trigger, pa vraćamo otfikareni stop trigger nazad u array sviStopTriggeri...
      sviStopTriggeri.push(stopTrig);

      // korekcija buy limita
      let mozdaNoviSellLimit = cijenaSad + odmakLambda;
      let trebaPomaknutiLimit = mozdaNoviSellLimit < sviLimitTriggeri.buy.cijenaLimit;
      
      if (trebaPomaknutiLimit) {
        sviLimitTriggeri.sell.cijenaLimit = mozdaNoviSellLimit;
        emitterko.emit('postaviSellLimit');
      }
      
    } else { 
      // hvatamo error ako je algoritam procurio kroz if-ove 1-4. 
      emitterko.emit('procurioSam');
    }
  } // zatvaranje "AKO IMA BAREM JEDAN LIMIT" (opcija 2)
} // zatvaranje cijele funkcije

// SAD KAD SAM NAPRAVIO CIJELU STRATEGIJU KAO SERIJU IF-OVA, SAD SAM SE SJETIO DA SAM SE NEKI DAN SJETIO DA BI TREBALO SLOŽIT JEBENI SWITCH. KURAC PIČKA!


  // strategija za arbitražu
stratty.stratArbitrazniTrokut = function stratArbitrazniTrokut(ab, ac, cb) {
  // Proslijeđujemo funkciji 3 cijene. Za potrebe testiranja, konvencija je redoslijedom A/B, A/C, C/B (npr. ETHEUR, ETHBTC, BTCEUR).
  // Dalo bi se relativno straightforward isprogramirati da može primit bilo koja 3 para, samo treba logika za hendlanje tikera i cijene...
  
  if ((ab / ac) > cb) {	// 
  	//
  	// kupi CB, prodaj AC
  	//
  } else if ((ab / ac) < cb) {
  	//
  	// prodaj AC, kupi CB
  	//
  };

  /*
	Primjer:
	ETHEUR - cijena 1: 750,00
	ETHBTC - cijena 2: 0,0866
	BTCEUR - cijena 3: 8700,00

	1 ETH = 750 EUR
	1 ETH = 0,0866 BTC
	___________________
	750 EUR = 0,0866 BTC
	1 BTC = 8660,50 EUR

	Razlika u cijeni je 8700,00 - 8660,50 =
	= 39,50 EUR / BTC

	Kapitalizirati na način da odmah prodajemo BTCEUR (skuplju cijenu) i kupujemo odgovarajuću količinu ETHBTC (jeftiniju cijenu).
	Ovo treba biti istovremeno i insta.
	Kada bi izračunata cijena iz prve dvije bila veća od treće cijene, onda postupamo obratno - kupujemo BTCEUR i prodajemo ETHBTC

	U arbitraži, izbor šta kupiti a šta prodati ovisi o tome kolike su nam pozicije u raznim valutama. 
	U načelu, platiti valutom s kojom imamo najveću otvorenu poziciju.

	U stvarnoj instanci ove strategije, obavezno uzimati u obzir dubinu orderbooka i feejeve.

  */
}


/*
// neovisna funkcija koja ublažuje lossove svih loših pozicija
stratty.grobarPozicija = function grobarPozicija(trenutnaCijena, vrijeme) {
  for (let poz in svePozicijeIkada) {   // pregledavamo sve pozicije
  
    let ulaznaCijena = poz.ulazniQuoteIznos / poz.ulazniBaseIznos;  
    let stopTrigger = poz.stopTrigger;
    if (!poz.slobodna && !poz.zatvorena) {  // provjeravamo je li ne-slobodna i ne-zatvorena
      // ako jest, provjeravamo odnos u kakvom je stanju profita pozicija  
      let profitMargina = Math.abs(stopTrigger - ulaznaCijena);
      let lossMargina = Math.abs(ulaznaCijena - trenutnaCijena);
      
      // dopuštamo poziciji da ode u loss do (veličine profit margine * tolerancija). ako počne ić više u loss, počinjemo ju rezati postepeno.
      let tolerancija = 1.5;
      
      if (profitMargina < (tolerancija * lossMargina)) {
        // recimo
        let profitLossOdnos = profitMargina / lossMargina;
        // let 
        // poz.izlazak()
      }
      
      if (stopTrigger > trenutnaCijena) {
        let postotak = odnosTriBroja(stopTrigger, ulaznaCijena, trenutnaCijena);
      } else if (stopTrigger < trenutnaCijena) {
        let postotak = odnosTriBroja(trenutnaCijena, ulaznaCijena, stopTrigger);
      } 
      if (postotak > 50) {
        // cijena pobjegla u lošem smjeru
      } 
    }
  }   
} 
*/

module.exports = stratty;