"use strict";

const readline = require('readline');
const stream = require('stream');
const fs = require('fs');
const util = require('./util.js');
const ratio = util.odnosTriBroja;

function kendl1Template(trejd) {
    this.O = trejd.cijena;
    this.H = trejd.cijena;
    this.L = trejd.cijena;
    this.C = trejd.cijena;
    this.datum = trejd.datum;
    this.sat = trejd.sat;
    this.minuta = trejd.minuta;
    this.volBuyeva = 0;
    this.volSellova = 0;
}

function kendlAgroTemplate(prvi) {
    this.O = prvi.O;
    this.H = prvi.H;
    this.L = prvi.L;
    this.C = prvi.C;
    this.datum = prvi.datum;
    this.sat = prvi.sat;
    this.minuta = prvi.minuta;
    this.volBuyeva = 0;
    this.volSellova = 0;
}

class zTransform extends stream.Transform {
    constructor(param) {
        super(param);
        // dodajemo par stvari u konstruktor transform streama
        this.tempArr = [];  // ovo je privremeni array koji pamti kendlove i nakon pushanja (sve do flushanja)
        if (param.rezolucija) {this.rezolucija = param.rezolucija} // ovo je rezolucija (veličina kendlova - 5, 15, 60 itd.)
    }
}

const objektifikator = new zTransform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        // format jednog trejda: 
        // 2017-08-24 11:57:42,-18.7448,324.64
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

const kendlizator = new zTransform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        /* logičke konstrukcije za čitkiji algoritam */
        let zadnjiTrejd = this.tempArr[this.tempArr.length - 1];
        let prazanJeTempArr = (zadnjiTrejd == undefined);
        let josNijeGotovKendl = ((!prazanJeTempArr) && (zadnjiTrejd.minuta == chunk.minuta));
        let brojilo = 0;
        if (prazanJeTempArr || josNijeGotovKendl) {
            this.tempArr.push(chunk);
        } else if (chunk.minuta > zadnjiTrejd.minuta) {
            brojilo = chunk.minuta - zadnjiTrejd.minuta;
        } else if (chunk.minuta < zadnjiTrejd.minuta) {
            brojilo = chunk.minuta + (60 - zadnjiTrejd.minuta);
        }
        if (brojilo > 0) {
            // chunk na čekanju dok ne složimo kendl
            let kendl = new kendl1Template(this.tempArr[0])
            for (let i = 0; i < this.tempArr.length; i++) {
                let trejd = this.tempArr[i];
                if (trejd.cijena > kendl.H) {kendl.H = trejd.cijena}
                if (trejd.cijena < kendl.L) {kendl.L = trejd.cijena}
                if (trejd.volumen > 0) {kendl.volBuyeva += trejd.volumen}
                if (trejd.volumen < 0) {kendl.volSellova += trejd.volumen}
            }
            this.push(kendl); // šaljemo gotov 1min kendl dalje
            // ako je slučajno prošlo više minuta, popunjavamo s praznim kendlovima
            for (let i = 0; i < (brojilo - 1); i++) {
                let fillKendl = JSON.parse(JSON.stringify(kendl));
                fillKendl.volBuyeva = 0;
                fillKendl.volSellova = 0;
                fillKendl.O = fillKendl.H = fillKendl.L = fillKendl.C;
                if (fillKendl.minuta == 59) {
                    fillKendl.minuta = 0;
                } else {
                    fillKendl.minuta += 1;
                }
                this.push(fillKendl);
            }
            this.tempArr = []; // flushamo temp array
            this.tempArr.push(chunk); // guramo chunk koji je bio na čekanju
        }
        callback();
    }
});

function Agregator(rezolucija) {
    const agregator = new zTransform({
        objectMode: true,
        rezolucija: rezolucija,
        transform(chunk, encoding, callback) {
            if ((chunk.minuta % this.rezolucija === 0) && (this.tempArr.length > 0)) {
                let agroKendl = new kendlAgroTemplate(this.tempArr[0]);
                for (let i = 0; i < this.tempArr.length; i++) {
                    let tempKendl = this.tempArr[i];
                    if (tempKendl.H > agroKendl.H) {agroKendl.H = tempKendl.H}
                    if (tempKendl.L < agroKendl.L) {agroKendl.L = tempKendl.L}
                    agroKendl.volBuyeva += tempKendl.volBuyeva;
                    agroKendl.volSellova += tempKendl.volSellova;
                }
                let zadnjiTempKendl = this.tempArr[this.tempArr.length - 1];
                agroKendl.C = zadnjiTempKendl.C;
                agroKendl.minuta = chunk.minuta;
                this.tempArr = []; // flushamo temp array
                this.tempArr.push(chunk); // guramo chunk koji je bio na čekanju
                this.push(agroKendl); // šaljemo gotov kendl dalje
            } else {
                this.tempArr.push(chunk);
            }
            callback();
        }
    });
    return agregator;
}

// pretvarač niza kendlova u pakete za trening NN-a
function IOizator(inSize, outSize) {
    const ioizator = new zTransform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            // dok tempArr ne dosegne potrebnu dužinu, samo guramo chunkove
            if (this.tempArr.length < (inSize + outSize)) {
                this.tempArr.push(chunk);
            // jednom kad je tempArr potrebne dužine, sa svakim novim chunkom
            // radimo: konverzija u io, shift tempArr, push chunk
            // tako da će se ioSetovi preklapati, odnosno sa svakim chunkom (kendlom)
            // ćemo stvarati cijeli novi ioSet (tako da bude ioSetova skoro koliko i kendlova)
            } else {
                let ioSet = {
                    input: [],
                    output: []
                }
                let ioArr = JSON.parse(JSON.stringify(this.tempArr)); // kloniranje
                for (let i = 0; i < inSize; i++) {
                    ioSet.input.push(ioArr.shift());
                }
                for (let o = 0; o < outSize; o++) {
                    ioSet.output.push(ioArr.shift());
                }
                this.tempArr.shift(); // režemo najstariji chunk
                this.tempArr.push(chunk); // dodajemo najnoviji chunk
                this.push(ioSet);  // pushamo složeni set
            }
            callback();
        }
    })
    return ioizator;
}

// uzima pakete za NN i ogoljuje ih (ostavlja samo cijenu i volumen)
const adaptor = new zTransform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        let ioSet = {
            input: [],
            output: []
        }
        for (let i = 0; i < chunk.input.length; i++) {
            let kendl = {
                cijena: chunk.input[i].C,
                sellovi: chunk.input[i].volSellova,
                buyevi: chunk.input[i].volBuyeva
            }
            ioSet.input.push(kendl);
        }
        for (let o = 0; o < chunk.output.length; o++) {
            let kendl = {
                cijena: chunk.output[o].C
            }
            ioSet.output.push(kendl);
        }
        this.push(ioSet);
        callback();
    }
});

// poslje adaptora, normalizira cijene i volumene
// testirati i usporediti apsolutnu i logističku normalizaciju
function NormalizatorAps(prosirenje) {
    const normalizatorAps = new zTransform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            // prvo nađemo high i low input seta i zbroj svih volumena
            let lowC = 1000000;
            let highC = 0;
            let ukupniVol = 0;
            for (let i = 0; i < chunk.input.length; i++) {
                if (chunk.input[i].cijena < lowC) {lowC = chunk.input[i].cijena}
                if (chunk.input[i].cijena > highC) {highC = chunk.input[i].cijena}
                ukupniVol += Math.abs(chunk.input[i].sellovi);
                ukupniVol += chunk.input[i].buyevi;
            }
            lowC -= prosirenje;
            highC += prosirenje;
            // onda modificiramo sve cijene i volumene kompletnog seta
            for (let i = 0; i < chunk.input.length; i++) {
                chunk.input[i].cijena = ratio(highC, chunk.input[i].cijena, lowC) / 100;
                chunk.input[i].sellovi = Math.abs(chunk.input[i].sellovi / ukupniVol);
                chunk.input[i].buyevi = chunk.input[i].buyevi / ukupniVol;
            }
            for (let o = 0; o < chunk.output.length; o++) {
                if (chunk.output[o].cijena > highC) {
                    chunk.output[o].cijena = 1;
                } else if (chunk.output[o].cijena < lowC) {
                    chunk.output[o].cijena = 0;
                } else {
                    chunk.output[o].cijena = ratio(highC, chunk.output[o].cijena, lowC) / 100;
                }
            }
            this.push(chunk);
            callback();
        }
    })
    return normalizatorAps;
}

// zadnji transform u lancu tako da možemo slati u write stream (mora biti string)
const stringifikator = new zTransform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        this.push(JSON.stringify(chunk) + '\n');
        callback();
    }
});

function agro(inputter, outputter, rezolucija, inSize, outSize, prosirenje) {

    let agregator = new Agregator(rezolucija);
    let ioizator = new IOizator(inSize, outSize);
    let normalizatorAps = new NormalizatorAps(prosirenje);
    let lajne = readline.createInterface({
        input: inputter,
        terminal: false,
        crlfDelay: Infinity
    });
    lajne.on('line', (lajna) => {
        objektifikator.write(lajna);
    });
    objektifikator
        .pipe(kendlizator)
        .pipe(agregator)
        .pipe(ioizator)
        .pipe(adaptor)
        .pipe(normalizatorAps)
        .pipe(stringifikator)
        .pipe(outputter);
}

let izvor = fs.createReadStream('./exchdata/testdata.csv');
let cilj = fs.createWriteStream('./test-agr.txt');
let rezolucija = 5;
let inSize = 5;
let outSize = 2;
let prosirenje = 1;

agro(izvor, cilj, rezolucija, inSize, outSize, prosirenje);

module.exports = agro;