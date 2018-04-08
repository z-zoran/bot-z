"use strict";

const readline = require('readline');
const stream = require('stream');
const fs = require('fs');
const inPutanja = './exchdata/testdata.csv';
const outPutanja = './test-stream.txt';



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
        this.tempArr = [];  // ovo je privremeni array koji pamti kendlove i nakon pushanja
        if (param.rezolucija) {this.rezolucija = param.rezolucija} // ovo je rezolucija (veličina kendlova - 5, 15, 60 itd.)
    }
}

const objektifikator = new zTransform({
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

const kendlizator = new zTransform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        let zadnjiTrejd = this.tempArr[this.tempArr.length - 1];
        console.log(zadnjiTrejd);
        if ((zadnjiTrejd == undefined) || (zadnjiTrejd.minuta == chunk.minuta)) {
            this.tempArr.push(chunk);
        } else if (((chunk.minuta == 0) && (zadnjiTrejd.minuta == 59)) || (chunk.minuta == (zadnjiTrejd.minuta + 1))) { 
            // chunk na čekanju dok ne složimo novi kendl
            let kendl = new kendl1Template(this.tempArr[0])
            for (let i = 0; i < this.tempArr.length; i++) {
                let trejd = this.tempArr[i];
                if (trejd.cijena > kendl.H) {kendl.H = trejd.cijena}
                if (trejd.cijena < kendl.L) {kendl.L = trejd.cijena}
                if (trejd.volumen > 0) {kendl.volBuyeva += trejd.volumen}
                if (trejd.volumen < 0) {kendl.volSellova += trejd.volumen}
            }
            this.tempArr = []; // flushamo temp array
            this.tempArr.push(chunk); // guramo chunk koji je bio na čekanju
            this.push(kendl); // šaljemo gotov 1min kendl dalje
        } else {
            console.log('GREŠKA. PRESKOČENA JE JEDNA MINUTA: ' + chunk.datum + ' ' + chunk.sat + ':' + (chunk.minuta - 1));
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
                this.push(JSON.stringify(agroKendl)); // šaljemo gotov kendl dalje
            } else {
                this.tempArr.push(chunk);
            }
            callback();
        }
    });
    return agregator;
}

function agro(input, output, rezolucija) {
    let inputter = fs.createReadStream(input);
    let outputter = fs.createWriteStream(output);

    let agregator = new Agregator(rezolucija);
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
        .pipe(outputter);
}

agro(inPutanja, outPutanja, 5);

module.exports = agro;