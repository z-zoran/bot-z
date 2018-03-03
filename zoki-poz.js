"use strict";

// Library s pozicijama.


// assignamo sve varijable, funkcije i klase u objekt "pozzy" koji ćemo module.exportati na kraju
let pozzy = {};
pozzy.svePozicijeIkada = [];
pozzy.sviLimitTriggeri = {};
pozzy.sviStopTriggeri = [];
pozzy.sviTrailingStopovi = [];


let svePozicijeIkada = pozzy.svePozicijeIkada; 

let sviLimitTriggeri = pozzy.sviLimitTriggeri;	
/*
LIMIT TRIGGERI DOLAZE U SLIJEDEĆEM FORMATU:
sviLimitTriggeri: {
  buy: {idParentPozicije: ...,
        cijenaLimit: ...}, 
  sell:{idParentPozicije: ...,
        cijenaLimit: ...}
}
*/
let sviStopTriggeri = pozzy.sviStopTriggeri;	
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
let sviTrailingStopovi = pozzy.sviTrailingStopovi;	
/*
TRAILING STOPOVI IMAJU SVOJU KLASU.
Njih samo treba svaki krug izvrtiti svima metodu .korekcija, da se prilagode kretanju cijene.
*/

/*--------------POZICIJA: KONSTRUKTOR---------------------*/

  /* Konstruktor za osnovnu klasu Pozicija */
pozzy.Pozicija = function Pozicija(id, parent, vrijeme, baseTiker, baseIznos, quoteTiker, quoteIznos) {

  /* Osnovni identifikatori */
  this.idPozicije = id;				// jedinstveni id svake pozicije
  this.idParenta = parent;			// id parent pozicije
  this.vrijemePozicije = vrijeme;	// vrijeme ulaska u poziciju
  this.otvorena = true;				// da li pozicija još postoji (radi prebrojavanja)
  this.slobodna = (id === 0 ? true : false);	// može li strategija koristiti ovu poziciju za stvaranje novih, prva pozicija po defaultu da.
  this.stopTrigger = null; 	// cijena na kojoj je pripadajući stop trigger.
  this.nextLimit = null;	// cijena na kojoj je slijedeći limit
  this.strat = '';  // strategija kojoj ova pozicija pripada.

  /* Podaci o poziciji */ 
  /* Imenovanje varijabli se temelji na Base/Quote principu. */
  /* Base je uvijek kupljena stvar, quote je ono s čim se plaća. */
  /* Kasnije, u metodi .izlazak zamjenjuju se base i quote. */
  /* Zato što npr. ako je ovo BTC/EUR pozicija, child će biti EUR/BTC. */
  this.ulazniBaseTiker = baseTiker;		// ticker i iznos valute u koju se ulazi
  this.ulazniBaseIznos = baseIznos;		
  this.ulazniQuoteTiker = quoteTiker;	// ticker i iznos valute kojom smo platili ulazak
  this.ulazniQuoteIznos = quoteIznos;
  this.preostaliBaseIznos = baseIznos;	// preostali iznos pozicije
  this.mojiChildIzlazi = {}				// u ovaj objekt stvaramo sve izlaze iz ove pozicije (sve child pozicije)
}

/*--------------POZICIJA: STOP TRIGGER---------------------*/
  /* STOP TRIGGER. Odrediti temeljeno na ATR-u ili Donchian ch. ili Bollinger ili sličnim indikatorima */
Pozicija.prototype.postaviStopTrigger = function (odmak) {
  let ulaznaCijena = this.ulazniQuoteIznos / this.ulazniBaseIznos;
  let stopTrigger = ulaznaCijena + odmak; 
  let id = this.idPozicije;
  sviStopTriggeri[id] = stopTrigger;
}	// stop trigger je fiksan kad se jednom postavi

/*--------------POZICIJA: NOVI LIMIT---------------------*/
  /* Metoda za postavljanje narednih limita kad se aktivira buy ili sell limit. Odrediti sa Donchian ili Bollinger kanalom i najbližim stop triggerom. */
Pozicija.prototype.postaviNaredniLimit = function (odakle, odmak) {
  let id = this.idPozicije;
  let naredniLimit = odakle + odmak;
  let kakavLimit;
  if (odmak < 0) { kakavLimit = 'buy' } 
  	else if (odmak > 0) { kakavLimit = 'sell' }
  sviLimitTriggeri[kakavLimit] = {id: naredniLimit}
}	// naredni limit nije fiksan, već se podešava prema stop triggeru svaki candle

/*--------------POZICIJA: IZLAZAK---------------------*/
  /* Metoda za obradu izlaska (iz perspektive pozicije) odnosno stvaranje nove pozicije */
Pozicija.prototype.izlazak = function (vrijeme, izTiker, izIznos, smanjenje) {

  /* Ulazni podaci */
  /* Valute obratne od parent pozicije */
  let izlazniBaseTiker = izTiker;				// valuta u koju se izašlo
  let izlazniBaseIznos = izIznos;				// iznos u koliko se izašlo
  let izlazniQuoteTiker = this.ulazniBaseTiker;	// base tiker parent pozicije je quote tiker child pozicije
  let izlazniQuoteIznos = smanjenje;			// iznos ulazne valute koji je izašao (smanjenje parent pozicije)
  let idParenta = this.idPozicije;				// novu poziciju stvaramo iz ove parent pozicije
  let vrijeme = vrijeme;
  
  if (this.preostaliBaseIznos < izlazniQuoteIznos) {	// sigurnosna provjera da pozicija ne ode u minus 
    baciNekiError();
  }     
  
  this.preostaliBaseIznos -= izlazniQuoteIznos;	// pri izlasku, smanjuje se veličina parent pozicije za veličinu izlazne child pozicije
  
  if (this.preostaliBaseIznos = 0)	{		// ako smo potrošili poziciju, zatvaramo ju
  	this.otvorena = false;
  }

  idIzlaza = svePozicijeIkada.length; 	// Tražimo novi globalni id za novu poziciju
  
  // stvaranje nove pozicije
  novaPozicija = new Pozicija(idIzlaza, idParenta, vrijeme, izlazniBaseTiker, izlazniBaseIznos, izlazniQuoteTiker, izlazniQuoteIznos);
  
  this.mojiChildIzlazi[idIzlaza] = novaPozicija;	// Svaka Pozicija čuva listu svojih izlazaka. 
  svePozicijeIkada.push(novaPozicija);	// Ovo pohranjuje poziciju u globalni array svih pozicija i automatski povećava slijedeći id.

  return novaPozicija;	// Vraćamo novostvorenu poziciju. Možda će biti korisno kasnije.
}
  
/*------------TRAILING-STOP-------------*/
// kada cijena probije stop trigger, instanciramo trailing stop za tu poziciju

  /* Konstruktor za trailing stopove. */
pozzy.TrailingStop = function TrailingStop(id, ulaz, odmak) {
  this.idMojePozicije = id;		// trailer pamti svoju izvornu poziciju
  this.ulaznaCijena = ulaz;		// ulazna cijena pozicije
  this.odmakOdCijene = odmak;	// odmak trailing stopa (take profit) od trenutne cijene (pozitivan ili negativan)

  this.gdjeSam = this.ulaznaCijena + this.odmakOdCijene;	// na kojoj cijeni je trenutno trailing stop
  /* Kad se trailing stop inicira, postavlja se s odmakom od cijene. 
  Svaki candle zovemo svim TrailingStopovima metodu .korekcija koja podešava trailing stop. */
}

TrailingStop.prototype.korekcija = function (trenutnaCijena) {
  let pratimOdozdo = (this.odmakOdCijene < 0);	// ako je odmak negativan, znači da pratimo cijenu odozdo
  let pratimOdozgo = (this.odmakOdCijene > 0);	// odmak pozitivan - znači pratimo cjenu odozgo prema dole
  let trenutnaUdaljenost = trenutnaCijena - this.gdjeSam;

  // ako je trenutna udaljenost veća od postavljenog odmaka
  // znači da nam je cijena pobjegla i moramo ju pratiti
  let cijenaMiJePobjegla = (Math.abs(trenutnaUdaljenost) > Math.abs(this.odmakOdCijene));
  if (cijenaMiJePobjegla) {
  	this.gdjeSam = trenutnaCijena + this.odmakOdCijene;		// podesi trailing stop tako da je udaljen od trenutne cijene za odmak
  }

  // ako pratimo cijenu prema dole, ona skoči i triggera trailing stop
  // ako pratimo cijenu odozdo, ona padne i triggera trailing stop
  let cijenaMeTriggerala = (pratimOdozdo && (trenutnaCijena <= this.gdjeSam)) || (pratimOdozgo && (trenutnaCijena >= this.gdjeSam));
  if (cijenaMeTriggerala) {
  	// 
  	//
  	//	zovi zatvaranje pozicije kojoj pripadam
  	//
  	//
  }
}



module.exports = pozzy;