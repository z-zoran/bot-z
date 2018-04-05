"use strict";

const stream = require('stream');
const fs = require('fs');
const putanja = './exchdata/testdata.csv';
const readline = require('readline');

let vodotoci = {};

let brojalo = 0;

const inputter = fs.createReadStream(putanja);
const outputter = fs.createWriteStream('./test-stream.txt');

const objektifikator = new stream.Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        let sjeckani = chunk.split(',');
        if (sjeckani[0] !== 'timestamp') {
            let vrijeme = sjeckani[0].split(' ');
            let hms = vrijeme[1].split(':');
            let trejd = {};
            trejd.datum = vrijeme[0];
            trejd.sat = Number(hms[0]); 
            trejd.minuta = Number(hms[1]);
            trejd.sekunda = Number(hms[2]);
            trejd.volumen = Number(sjeckani[1]);     
            trejd.cijena = Number(sjeckani[2]);
            this.push(trejd);
        }
        callback();
    }
});

let trejdoviArr = [];
const kendlizator1min = new stream.Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        let zadnjiTrejd = trejdoviArr[trejdoviArr.length - 1];
        if (!zadnjiTrejd || (zadnjiTrejd.minuta === chunk.minuta)) {
            trejdoviArr.push(chunk);
        } else {
            let kendl = {
                O: trejdoviArr[0].cijena,
                H: trejdoviArr[0].cijena,
                L: trejdoviArr[0].cijena,
                C: trejdoviArr[0].cijena,
                datum: trejdoviArr[0].datum,
                sat: trejdoviArr[0].sat,
                minuta: trejdoviArr[0].minuta,
                volBuyeva: 0,
                volSellova: 0
            }
            for (let i = 0; i < trejdoviArr.length; i++) {
                let trejd = trejdoviArr[i];
                if (trejd.cijena > kendl.H) {kendl.H = trejd.cijena};
                if (trejd.cijena < kendl.L) {kendl.L = trejd.cijena};
                if (trejd.volumen > 0) {kendl.volBuyeva += trejd.volumen}
                else if (trejd.volumen < 0) {kendl.volSellova += trejd.volumen}
            
            
            }

            for (let i = 0; i < trejdoviArr.length; i++) {
                if (i === 0) {
                    kendl.O = trejdoviArr[i].cijena;
                    kendl.H = trejdoviArr[i].cijena;
                    kendl.L = trejdoviArr[i].cijena;
                    kendl.C = trejdoviArr[i].cijena;
                    kendl.datum = trejdoviArr[i].datum;
                    kendl.sat = trejdoviArr[i].sat;
                    kendl.minuta = trejdoviArr[i].minuta;
                } else if (i === (trejdoviArr.length - 1)) {
                    kendl.C = trejdoviArr[i].cijena;
                }
            }
            kendl.O = arr[i].cijena;
            kendl.H = arr[i].cijena;
            kendl.L = arr[i].cijena;
            kendl.C = arr[i].cijena;
            kendl.datum = arr[i].datum;
            kendl.sat = arr[i].sat;
            kendl.minuta = arr[i].minuta;


        }
        callback();
    }
});

/*
function kendlizator(arr) {     // proslijeđujemo mu array trejdova.
    let arrKendlovi = [];
    let novi = true;
    let kendl = {};
    for (let i = 1; i < arr.length; i++) {  // kružimo kroz cjeli array trejdova
        
        if (i === 1) {      // ako je prvi trejd, kažemo logici da je novi kendl
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
    
    // console.log(arrKendlovi);
    return arrKendlovi;
}  
*/

const lajne = readline.createInterface({
    input: inputter,
    terminal: false,
    crlfDelay: Infinity
});

lajne.on('line', (lajna) => {
    objektifikator.write(lajna);
});

objektifikator.pipe(kendlizator1min).pipe(outputter);




/*
rezalo = new stream.Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
        this.push(chunk.toString().trim().split(','));
        callback();
    }
});

vodotoci.arrayToObject = new stream.Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
        const obj = {};
        for(let i=0; i < chunk.length; i+=2) {
            obj[chunk[i]] = chunk[i+1];
        }
        this.push(obj);
        callback();
    }
});

vodotoci.objectToString = new stream.Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
        this.push(JSON.stringify(chunk) + '\n');
        callback();
    }
});


process.stdin
  .pipe(commaSplitter)
  .pipe(arrayToObject)
  .pipe(objectToString)
  .pipe(process.stdout)
*/

module.exports = vodotoci;