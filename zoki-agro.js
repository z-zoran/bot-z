"use strict";
// (zasad) BACKTEST ALAT:
// AGREGATOR TREJDOVA. PARSA CSV SVIH TREJDOVA I PRETVARA IH U ARRAY OBJEKATA.
// VRAĆA NAM ARRAYEVE S 1min, 5min, 15min, 1h, 6h kendlovima
// 
// Nije DRY ali funkcionira. Funkcionalnost prije optimizacije!
// (tri funkcije za agregaciju bi se dale pretvorit u jednu koja prima veličine kendlova kao argumente... al nije bitno.)

// OBJEKTIFIKATOR - učitava csv listu svih trejdova i objektifira trejdove
// format csv-a: {vrijeme (datum h:m:s), volumen (+/- ovisno je li buy/sell), cijena}

const fs = require('fs');

function objektifikator(putanja) {
    // ovo je array svih trejdova 
    var arrayTrejdova = [];
    /* format trejd objekta:
    {
    datum: '2017-08-24',
    sat: '10',
    minuta: '14',
    sekunda: '43',
    volumen: -0.12,
    cijena: 123.12
    }
    */
    var sirovi = String(fs.readFileSync(putanja));    // ovo je fajl za testiranje
    var rezani = sirovi.split('\n');    // narežemo retke (sad imamo array stringova, svaki je jedan trejd)
    for (let i = 1; i < rezani.length-1; i++) {     // iz nekog razloga brejka 'i < rezani.length;', ali hoće rezani.length-1. nemam pojma.
        let sjeckani = rezani[i].split(',');        // režemo redak sa ','
        let vrijeme = sjeckani[0].split(' ');       // režemo vrijeme sa ' '
        let hms = vrijeme[1].split(':');            // drugi u 'vrijeme' režemo sa ':'
        // sad ćemo definirat objekt sa svim ovim narezanim propertijima
        let trejd = {};
        trejd.datum = vrijeme[0];
        trejd.sat = Number(hms[0]); 
        trejd.minuta = Number(hms[1]);
        trejd.sekunda = Number(hms[2]);
        trejd.volumen = Number(sjeckani[1]);     
        trejd.cijena = Number(sjeckani[2]);
        // na kraju pushamo taj objekt u globalni array
        arrayTrejdova.push(trejd);
    }
    return arrayTrejdova;
}
// console.log(arrayTrejdova);

// KENDLIZATOR - agregira trejdove u minutne kendlove i popunjava array.
// ovaj array je baza za dalje se zajebavati.

function kendlizator(arr) {     // proslijeđujemo mu array trejdova.
    let arrKendlovi = [];
    let novi = true;
    let kendl = {};
    for (let i = 0; i < arr.length; i++) {  // kružimo kroz cjeli array trejdova
        
        if (i === 0) {      // ako je prvi trejd, kažemo logici da je novi kendl
            novi = true;
        } else if (arr[i].minuta === arr[i-1].minuta) {
            novi = false;   // ako je trenutna minuta ista kao prošla minuta, nije novi candle
            if (kendl.H < arr[i].cijena) kendl.H = arr[i].cijena;
            if (kendl.L > arr[i].cijena) kendl.L = arr[i].cijena;
        } else if (arr[i].minuta !== arr[i-1].minuta) {
            novi = true;
            kendl.C = arr[i-1].cijena;
            arrKendlovi.push(kendl);    // ako je fakat nova minuta (nije prvi trejd), 
            kendl = {};                 // dodajemo kendl u array i onda ga čistimo
            kendl.volBuyeva = 0;
            kendl.volSellova = 0;
        }
       
        if (novi) {  // ako je novi (ili prvi) kendl, definiramo mu sve propertyje koristeći trenutni trejd
            kendl.O = arr[i].cijena;
            kendl.H = arr[i].cijena;
            kendl.L = arr[i].cijena;
            kendl.C = arr[i].cijena;
            kendl.datum = arr[i].datum;
            kendl.sat = arr[i].sat;
            kendl.minuta = arr[i].minuta;
        }
        
        // bez obzira je li novi kendl ili ne, dodajemo mu volumen trejda
        if (arr[i].volumen > 0) {
            kendl.volBuyeva += arr[i].volumen;  // zasebno brojimo volumen prodanog i kupljenog
        } else if (arr[i].volumen < 0) {
            kendl.volSellova += arr[i].volumen;
        }
        // ova ružna konstrukcija je zato da prisilimo 2 decimale u svakoj cijeni.
        // trenutno mi ne treba ali kasnije kod displejanja će možda trebati pa neka ostane tu za copy/paste
        //kendl.cijenaArr.push(parseFloat(Math.round(arr[i].cijena * 100) / 100).toFixed(2));
    }
    /*  
    napomena: kad gornji for završi, zadnji kendl nije gurnut u arrKendlovi.
    to je zato što čekamo da se pojavi nova minuta da bismo izračunali kendl od prethodne.    
    to je za sad ok jer je ovo za bektestanje.
    */
    // console.log(arrKendlovi);
    return arrKendlovi;
}  


// AGREGATOR 5min. Uzimamo listu 1-min kendlova i stvaramo 5min.
// vidi primjenu na dnu.
function agregator5min(arr1min) {
    let arr5min = [];
    let kendl = {};
    for (let i = 0; i < arr1min.length; i++) {
        // check jel prvi 1min unutar 5min
        if ((arr1min[i].minuta % 5) === 0) {    
            // console.log('prvi kendl ' + arr1min[i].minuta);
            if (kendl.datum) {  // check je li već postoji. ako ovo ne prođe, znači da je prvi 5min kendl
                arr5min.push(kendl);    // ako prođe, završili smo s prošlim kendlom i pushamo ga u array
            }
            kendl = {};
            kendl.datum = arr1min[i].datum;
            kendl.sat = arr1min[i].sat;
            kendl.minuta = arr1min[i].minuta;
            kendl.volBuyeva = arr1min[i].volBuyeva;
            kendl.volSellova = arr1min[i].volSellova;
            kendl.O = arr1min[i].O;
            kendl.H = arr1min[i].H;
            kendl.L = arr1min[i].L;
            kendl.C = arr1min[i].C;
        } 
        // check jel zadnji 1min unutar 5min i mora već bit definiran 5min kendl
        else if (((arr1min[i].minuta % 5) === 4) && kendl.datum) {     
            // console.log('zadnji kendl ' + arr1min[i].minuta);
            kendl.volBuyeva += arr1min[i].volBuyeva;
            kendl.volSellova += arr1min[i].volSellova;
            if (kendl.H < arr1min[i].H) kendl.H = arr1min[i].H;
            if (kendl.L > arr1min[i].L) kendl.L = arr1min[i].L;
            kendl.C = arr1min[i].C;
        } 
        // samo check jel već definiran 5min kendl (znači bilo koji 1min kendl između prvog i zadnjeg)
        else if (kendl.datum) {
            kendl.volBuyeva += arr1min[i].volBuyeva;
            kendl.volSellova += arr1min[i].volSellova;
        }
    }
    //console.log(arr5min);
    return arr5min;
}

// AGREGATOR 15min. Uzimamo listu 5-min kendlova i stvaramo 15min.
// vidi primjenu na dnu.
function agregator15min(arr5min) {
    let arr15min = [];
    let kendl = {};
    for (let i = 0; i < arr5min.length; i++) {
        if ((arr5min[i].minuta % 15) === 0) {    
            if (kendl.datum) {  // check je li već postoji. ako ovo ne prođe, znači da je prvi 5min kendl unutar 15min kendla
                arr15min.push(kendl);    // ako prođe, završili smo s prošlim kendlom i pushamo ga u array
            }
            kendl = {};
            kendl.datum = arr5min[i].datum;
            kendl.sat = arr5min[i].sat;
            kendl.minuta = arr5min[i].minuta;
            kendl.volBuyeva = arr5min[i].volBuyeva;
            kendl.volSellova = arr5min[i].volSellova;
            kendl.O = arr5min[i].O;
            kendl.H = arr5min[i].H;
            kendl.L = arr5min[i].L;
            kendl.C = arr5min[i].C;
        } 
        // check jel zadnji 5min unutar 15min i mora već bit definiran 15min kendl
        else if (((arr5min[i].minuta % 15) === 10) && kendl.datum) {     
            // console.log('zadnji kendl ' + arr5min[i].minuta);
            kendl.volBuyeva += arr5min[i].volBuyeva;
            kendl.volSellova += arr5min[i].volSellova;
            if (kendl.H < arr5min[i].H) kendl.H = arr5min[i].H;
            if (kendl.L > arr5min[i].L) kendl.L = arr5min[i].L;
            kendl.C = arr5min[i].C;
        } 
        // samo check jel već definiran 15min kendl (znači srednji 5min kendl)
        else if (kendl.datum) {
            kendl.volBuyeva += arr5min[i].volBuyeva;
            kendl.volSellova += arr5min[i].volSellova;
        }
    }
    //console.log(arr15min);
    return arr15min;
}


// AGREGATOR 1h. Uzimamo listu 15-min kendlova i stvaramo 1h.
// vidi primjenu na dnu.
function agregator1h(arr15min) {
    let arr1h = [];
    let kendl = {};
    for (let i = 0; i < arr15min.length; i++) {
        // check jel prvi 15min unutar 60min
        if ((arr15min[i].minuta % 60) === 0) {    
            // console.log('prvi kendl ' + arr15min[i].minuta);
            if (kendl.datum) {  // check je li već postoji. ako ovo ne prođe, znači da je prvi 15min kendl
                arr1h.push(kendl);    // ako prođe, završili smo s prošlim kendlom i pushamo ga u array
            }
            kendl = {};
            kendl.datum = arr15min[i].datum;
            kendl.sat = arr15min[i].sat;
            kendl.volBuyeva = arr15min[i].volBuyeva;
            kendl.volSellova = arr15min[i].volSellova;
            kendl.O = arr15min[i].O;
            kendl.H = arr15min[i].H;
            kendl.L = arr15min[i].L;
            kendl.C = arr15min[i].C;
        } 
        // check jel zadnji 15min unutar 60min i mora već bit definiran 60min kendl
        else if (((arr15min[i].minuta % 60) === 45) && kendl.datum) {     
            // console.log('zadnji kendl ' + arr1min[i].minuta);
            kendl.volBuyeva += arr15min[i].volBuyeva;
            kendl.volSellova += arr15min[i].volSellova;
            if (kendl.H < arr15min[i].H) kendl.H = arr15min[i].H;
            if (kendl.L > arr15min[i].L) kendl.L = arr15min[i].L;
            kendl.C = arr15min[i].C;
        } 
        // samo check jel već definiran 5min kendl (znači bilo koji 1min kendl između prvog i zadnjeg)
        else if (kendl.datum) {
            kendl.volBuyeva += arr15min[i].volBuyeva;
            kendl.volSellova += arr15min[i].volSellova;
        }
    }
    //console.log(arr1h);
    return arr1h;    
}



function paketKendlova(putanjaTrejdova) {
    // ovo je putanja za testiranje
    let putanja = './exchdata/testdata.txt';
    // objektifikator pretvara trejdove u objekte
    let arrayTrejdova = objektifikator(putanja); // ako se izvana daje putanja onda ovdje proslijeđujemo putanjaTrejdova
    // s kendlizatorom, dobivamo array 1-min kendlova.
    let array1minKendlova = kendlizator(arrayTrejdova);
    // agregatori rade ostale kendlove iz 1-min kendlova.
    let array5minKendlova = agregator5min(array1minKendlova);
    let array15minKendlova = agregator15min(array5minKendlova);
    let array1hKendlova = agregator1h(array15minKendlova);
    // vraćamo objekt s kendl arrayevima kao propertyjima
    return {
        arrTrejdovi: arrayTrejdova,
        arr1min: array1minKendlova, 
        arr5min: array5minKendlova, 
        arr15min: array15minKendlova, 
        arr1h: array1hKendlova
    }
}

let paket = paketKendlova();

module.exports = paket;
