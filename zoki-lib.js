"use strict";

// Library s klasama i metodama.
// To će biti osnova svake strategije.

// Više dokumentacije nego koda :)

// Trebati će poubacivati metode/funkcije za komunikaciju s exchangeovima.
// Nađi u fajlu di god piše 'exchange komunikacija'

// treba složiti funkciju "pozicioniranje" koja traži najpovoljniju poziciju iz koje bi se izašlo u novu poziciju
/* nešto tipa 
    1 nađi poziciju s najpovoljnijom base valutom
    2 provjeri je li dovoljno velika za nov izlazak

*/

// FILE SYSTEM STRUKTURA
const fs = require('fs');

/*
var crashoSamKoBudala = true;

// funkcija za učitavanje rama ako je program flisnuo
function ucitajPozicije() {
  if (crashoSamKoBudala) {
    fs.readdirSync('./ram/').forEach( file => { 
      svePozicijeIkada.push(file); 
    });
  }
}

fs.readFileSync();
fs.writeFileSync();
*/

/*
// ova funkcija se izvršava dvaput svaki put kad nastane nova pozicija (nova pozicija se stvara, a pozicija majka se overwritea)
function zapisiPoziciju(poz) {
  let imeFajla = './ram/poz' + poz.idPozicije;  // imenujemo fajlove pozicija "./ram/poz1, ./ram/poz2, ..., ./ram/poz2451, ./ram/poz2452, itd."
  fs.writeFileSync(imeFajla, poz);
}


// funkcija za periodični backup
function spasiSnapshot(idSnapshota) {
  let direktorij ='./arhiv/' + idSnapshota;
  fs.mkdirSync(direktorij);
  for (let i = 0; i < svePozicijeIkada.length; i++) {
    let poz = svePozicijeIkada[i].idPozicije;
    let imeFajla = direktorij + '/' + poz;
    fs.writeFileSync(imeFajla, poz);
  }
}
*/


  // Array koji sadrži sve pozicije ikada. 
  // Dopunjavamo pri stvaranju nove pozicije (metoda .izlazak)
let svePozicijeIkada = []; 

  // Popisi svih aktivnih trigera (buy/sell limiti, stop triggeri, trailing stopovi).
  // Na svakom candleu, pregledavamo u ovom popisu je li nešto triggerano.
// BITNO
// Limit triggeri nisu fiksni ali nisu ni trailing, nego čine range (veličine donchian ili bollinger kanala) s najbližim stop triggerom.
// Stop triggeri su fiksni u odnosu na poziciju (hoćemo profit!).
// Trailing stopovi po definiciji trailaju.
let sviLimitTriggeri = {};	
/*
LIMIT TRIGGERI DOLAZE U SLIJEDEĆEM FORMATU:
sviLimitTriggeri: {
  buy: {idParentPozicije: ...,
        cijenaLimit: ...}, 
  sell:{idParentPozicije: ...,
        cijenaLimit: ...}
}
*/
let sviStopTriggeri = [];	
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
var sviTrailingStopovi = {};	
/*
TRAILING STOPOVI IMAJU SVOJU KLASU.
Njih samo treba svaki krug izvrtiti svima metodu .korekcija, da se prilagode kretanju cijene.
*/

/*--------------BAZE PODATAKA---------------------*/



/*------------------------------------------------*/


/*--------------POZICIJA: KONSTRUKTOR---------------------*/

  /* Konstruktor za osnovnu klasu Pozicija */
var Pozicija = function (id, parent, vrijeme, baseTiker, baseIznos, quoteTiker, quoteIznos) {

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
const TrailingStop = function (id, ulaz, odmak) {
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

/*--------------FUNKCIJE-----------------*/

function priPokretanju() {
  if (svePozicijeIkada === []) {
    // ako su prazne sve pozicije ikada (jer je program bio prekinut)
    // loadaj sve JSON pozicije u svePozicijeIkada
    // pri stvaranju nove pozicije, treba ju spasiti kao JSON
    // možda cijelo ovo pohranjivanje izvesti preko nekakve SQL baze ili nešto
  }
}

function meneVrtiSvakiKrug() {
  

} 	// glavna funkcija, tu ćemo upakirati sve kad završimo osnovni kostur

function trenutnoEuroStanje(popisSvihCijena) { 	
  // popisSvihCijena je popis svih različitih valuti u kojima imamo pozicije i trenutne cijene tih valuti u EUR.
  // U formatu { EUR:1.00, ETH:750.00, BTC:8500.00, XYZ:0.123 }
  let ukupnoEura = 0;
  for (poz in svePozicijeIkada) {
  	if (poz.otvorena) {
	  valutaOvePozicije = poz.ulazniBaseTiker;
	  cijenaOveValute = popisSvihCijena[valutaOvePozicije];
	  euriOvePozicije = poz.ulazniBaseIznos * cijenaOveValute;
	  ukupnoEura += euriOvePozicije;
  	}
  }
  return ukupnoEura;
}





/*---------------------STRATEGIJE--------------------*/

// Strategije se vrte svaki krug. Vrtimo ih koliko hoćemo paralelno. Ova jaše cijenu. 
// Određene pozicije vode se određenom strategijom (varijabla this.strat u konstruktoru pozicije)

  /*
Jahanje može biti u 2 različite faze:
	A) Nema stop triggera, odnosno range je ograničen s buy i sell limit orderima.
		Ovo također znači da nema otvorenih pozicija.
		- Ako je cijena bliža sell limitu, primaknuti buy limit.
		- Ako je cijena bliža buy limitu, primaknuti sell limit.
	B) Range je ograničen s jednim stop triggerom i jednim limitom.
		U ovom slučaju, treba podešavati limit tako da čini range sa stop triggerom.
		- Ako je cijena bliže stop triggeru, pomaknuti limit prema cijeni.
		- Ako je cijena bliže limitu, ne učiniti ništa. 
  */

const indi = require('./zoki-indi.js');
const devijacija = indi.zDev;

const stratJahanjeCijene = function (cijenaSad, odmakPhi, odmakLambda) {  // strategija za jahanje cijene 
  // cijenaSad je trenutna cijena
  // odmakPhi je odmak stop triggera (željeni profit)
  // odmakLambda je odmak slijedećeg limita (standardna devijacija ili slično)
  
  // odmakTrailing je odmak trailing stopa, recimo 1/3 odmakPhi
  let odmakTrailing = odmakPhi / 3;

  // funkcija vraća odnos 3 broja kao postotak (na koliko posto je srednji)
  function odnosTriBroja(gornja, srednja, donja) {
  	let cijeliKanal = gornja - donja;
  	let donjiKanal = srednja - donja;
  	let postotak = (100 * donjiKanal) / cijeliKanal;
  	return postotak;
  }

  function korekcijaLimita(cijenaSad, cijenaLimit, trecaCijena) { // searchaj korekcijaLimita

    // exchange komunikacija
  }

  // ako nema niti buy niti sell limita, znači da smo na baš prvom loopu strategije.
  // trebamo inicijalizirati strategiju, na način da postavimo oba limita.
  if (!sviLimitTriggeri.sell && !sviLimitTriggeri.buy) {
    sviLimitTriggeri.sell = cijenaSad + odmakLambda;
    // exchange komunikacija
    sviLimitTriggeri.buy = cijenaSad - odmakLambda;
    // exchange komunikacija
  }

  let imamoStopTriggerIznadCijene = (!sviLimitTriggeri.sell); // ako nema limita iznad, znači da imamo stop trigger iznad
  let imamoStopTriggerIspodCijene = (!sviLimitTriggeri.buy);  // ako nema limita ispod, znači da imamo stop trigger ispod
  let imaStopTriggera = (imamoStopTriggerIznadCijene || imamoStopTriggerIspodCijene);

  // POSTOJI STOP TRIGGER?
  // DA.
  if (imaStopTriggera) { // ako postoji stop trigger
    
    /*
    STOP TRIGGERI DOLAZE U SLIJEDEĆEM FORMATU:
    sviStopTriggeri: [
      0: {idParentPozicije: ...,
          triggerCijena: ...},
      1: {idParentPozicije: ...,
          triggerCijena: ...},
      (...)
    ]
    Dodajemo ih na kraj arraya kako nastaju novi, a otfikarujemo ih s kraja kad bivaju triggerani
    */
    
    // čupamo zadnji stop trigger (otfikarili smo ga s arraya - vratiti ćemo ga ako nije triggeran)
    let stopTrig = sviStopTriggeri.pop();
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
    let stopTriggerIznadJeTriggeran = imamoStopTriggerIznadCijene && (cijenaSad > stopTrig.triggerCijena);
    // inače ako je obratna situacija (triger treba biti ispod, a ispada da je cijena sad ispod triggera!)
    let stopTriggerIspodJeTriggeran = imamoStopTriggerIspodCijene && (cijenaSad < stopTrig.triggerCijena);


    // STOP TRIGGER JE IZNAD I TRIGGERAN JE?
    if (stopTriggerIznadJeTriggeran) {
      // stvaramo novi trailing take profit odozdo
      let trailingTakeProfit = new TrailingStop(idOvePozicije, cijenaOvePozicije, odmakTrailing * (-1));
      // korekcijaLimita()
    
    // STOP TRIGGER JE ISPOD I TRIGGERAN JE?
    } else if (stopTriggerIspodJeTriggeran) {
      // stvaramo novi trailing take profit odozgo
      let trailingTakeProfit = new TrailingStop(idOvePozicije, cijenaOvePozicije, odmakTrailing);
      // korekcijaLimita()
    
    // NIJE TRIGGERAN STOP TRIGGER.
    } else {
      // inače ako nije triggeran nikakav stop trigger, vraćamo otfikareni stop trigger nazad u array sviStopTriggeri...
      sviStopTriggeri.push(stopTrig);
      // provjeravamo gdje je cijena u kanalu i podešavamo limit ako bi ga to približilo
      // korekcijaLimita();

      /*
      format limit triggera:
      sviLimitTriggeri: {
        buy: {
          idParentPozicije: ...,
          cijenaLimit: ...
          }, 
        sell: {
          idParentPozicije: ...,
          cijenaLimit: ...
          }
      }
      */
      let buyLimitJeTriggeran = imamoStopTriggerIznadCijene && (cijenaSad < sviLimitTriggeri.buy.cijenaLimit);
      let sellLimitJeTriggeran = imamoStopTriggerIspodCijene && (cijenaSad > sviLimitTriggeri.sell.cijenaLimit);

      // JE LI TRIGGERAN BUY LIMIT?
      if (buyLimitJeTriggeran) {
        // pozicioniranje
        // (novi stop trigger)
        sviLimitTriggeri.buy.cijenaLimit = cijenaSad - odmakLambda;
        // exchange komunikacija

      // JE LI TRIGGERAN SELL LIMIT?
      } else if (sellLimitJeTriggeran) {
        // pozicioniranje
        // (novi stop trigger)
        sviLimitTriggeri.sell.cijenaLimit = cijenaSad + odmakLambda;
        // exchange komunikacija
      
      // AKO NIŠTA NIJE TRIGERANO, PRONAĐI GDJE JE CIJENA U KANALU I KORIGIRAJ UDALJENIJI LIMIT.
      } else {
        // korekcijaLimita();
      }

    }

  // POSTOJI STOP TRIGGER?
  // NE.
  } else if (!imaStopTriggera) {  // ako ne postoji stop trigger - znači i gore i dole imamo limit

    // prvo provjera je li triggeran neki limit.
    // ako nije, provjera gdje je cijena u kanalu
    // onda podešavanje udaljenijeg limita
    let buyLimitJeTriggeran = cijenaSad < sviLimitTriggeri.buy.cijenaLimit;
    let sellLimitJeTriggeran = cijenaSad > sviLimitTriggeri.sell.cijenaLimit;

    // JE LI TRIGGERAN BUY LIMIT?
    if (buyLimitJeTriggeran) {
      // pozicioniranje
      // (novi stop trigger)
      sviLimitTriggeri.buy.cijenaLimit = cijenaSad - odmakLambda;
      // exchange komunikacija

    // JE LI TRIGGERAN SELL LIMIT?
    } else if (sellLimitJeTriggeran) {
      // pozicioniranje
      // (novi stop trigger)
      sviLimitTriggeri.sell.cijenaLimit = cijenaSad + odmakLambda;
      // exchange komunikacija

    // NIŠTA NIJE TRIGGERANO, KORIGIRAJ UDALJENIJI LIMIT!
    } else {
      // korekcijaLimita();
    }
  }
}


















    let stopTriggerCijena = null;
    for (let stID in sviStopTriggeri) {
      if (stopTriggerCijena === null) { 
      	stopTriggerCijena = sviStopTriggeri[stID]
      }
      if (Math.abs(stopTriggerCijena - cijena) > Math.abs(sviStopTriggeri[stID] - cijena)) {
      	stopTriggerCijena = sviStopTriggeri[stID]
      }
    }
    
    // stavljamo da je odmak negativan ako je stop trigger iznad, a pozitivan ako je stop trigger ispod cijene.
    if (imamoStopTriggerIznadCijene) {
      let bliskiPoluKanal = stopTrigger - odmak;
      let daljnjiPoluKanal = stopTrigger - (2 * odmak);
      if (cijena > bliskiPoluKanal) { 	// cijena je u bližem kanalu
        // pomakni limit prema cijeni
      } else if (cijena > daljnjiPoluKanal) {	// cijena je u daljnjem kanalu
        // pomakni limit prema cijeni
      }
    } else if (imamoStopTriggerIspodCijene) {
      
    }

}

  // strategija za arbitražu
var stratArbitrazniTrokut = function (ab, ac, cb) {
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
ideja

postoji li način da se kompujter nauči prepoznavati krivulje na čartu?

nekako da primjenjuje krivulje na candleove, pa da može raspoznati formacije na čartu.

neka vrsta funkcije koja primjenjuje funkcije na normalizirani array od zadjnih štajaznam 20 perioda.

onda uspoređuje odstupanje krivulje na pojedinim točkama arraya. nalazi najbliži matematički opis kretanja.
jer jebo me pas, ovo nije rendom:
https://drive.google.com/open?id=1JeuWwgMTaby1rqIZYafjum0mVENIKzC-


treba malo istražiti valne funkcije.
*/


/*
stop loss - di ga stavit?
traba razraditi koncept. teorija rizika i to sve.
*/


/*brojacPozicijauIstomSmjeru = 0;
// koliko smo daleko od faze A (di nema stop triggera)
// ovo je redundantno jer možemo jednostavno prebrojati stop triggere?














metabektester:

kadZavršiBektesting
  promjeniParametre()
  */
  
  


  /*
    
  // neovisna funkcija koja ublažuje lossove svih loših pozicija
  function grobarPozicija(trenutnaCijena, vrijeme) {
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
          let 
          poz.izlazak()
        }
        
        if (stopTrigger > trenutnaCijena) {
          let postotak = odnosTriBroja(stopTrigger, ulaznaCijena, trenutnaCijena)
        } else if (stopTrigger < trenutnaCijena) {
          let postotak = odnosTriBroja(trenutnaCijena, ulaznaCijena, stopTrigger)
        } 
        if (postotak > 50) {
          // cijena pobjegla u lošem smjeru
        } 
      }
    }   
  } */