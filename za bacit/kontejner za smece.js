/*
POMALO GLUP NAZIV ZA FAJL OBZIROM DA ĆU SE VRAĆATI PO NEKE GLUPOSTI
I "KOPATI PO KONTEJNERU ZA SMEĆE." FALE MI EMODŽIJI U OVOM ASCII-JU.
SAD BI BIO PRIKLADAN ONAJ KOJI SLIJEŽE RAMENIMA.
*/



/* POLAKO SE ODMIČEM OD CIJELE SHEME S POZICIJAMA. UPRAVO
    ZBOG OVE PIZDARIJE KOJU NISAM DOBRO PROMISLIO.
    DAKLE, KAKO OKRUPNJIVATI POZICIJE? NEZNAM. RAZMISLI MALO.

    ZA POTREBE BEKTESTIRANJA IMPLEMENTIRATI ĆU NEKAKVU hrpu 
    U KOJU SE VRAĆAJU SVE SLOBODNE POZICIJE. NA TAJ NAČIN MOGU
    OSTATI PRI KONCEPCIJI POZICIJA I KASNIJE SE VRATITI I DORADITI
    AKO ĆE MI SE ČINITI DA TO IMA SMISLA.
*/

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



/*
OVO JE MALO OZBILJNIJA (BITNIJA) FUNKCIJA ALI JU TREBA PRVO RAZRADITI.
KONCEPTUALNO. NA PAPIRU. ILI TAKO NEŠTO. A ONDA ĆEMO JU VRATITI.
TRENUTNO RAŠČIŠĆAVAM MODULE PA JU MIČEM IZ zStratty DA NE PRAVI GUŽVU BEZVEZE.
*/
// neovisna funkcija koja ublažuje lossove svih loših pozicija
stratty.grobarPozicija = function grobarPozicija(trenutnaCijena, vrijeme) {
    for (let poz in memorija.pozicije) {   // pregledavamo sve pozicije
    
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





/*
OVO JE ISTO BITNA FUNKCIJA / STRATEGIJA ALI JU TREBA TEMELJITIJE OSMISLITI
PA ONDA POKUŠATI IMPLEMENTIRATI. POKUŠAVAM POJEDNOSTAVNITI zStratty DA NE BUDE
KRCAT POLUDOVRŠENOM BUKOM OD KOJE NE VIDIM BITNE STVARI.
*/
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