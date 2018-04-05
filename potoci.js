"use strict";

const stream = require('stream');
const fs = require('fs');

let vodotoci = {};


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

vodotoci.csvRezalo = fs.createReadStream()

vodotoci.commaSplitter = new stream.Transform({
    readableObjectMode: true,
    transform(chunk, encoding, callback) {
        this.push(chunk.toString().trim().split(','));
        callback();
    }
});

vodotoci.arrayToObject = new Transform({
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

vodotoci.objectToString = new Transform({
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

module.exports = vodotoci;