"use strict";

const readline = require('readline');
const stream = require('stream');
const fs = require('fs');
const alatke = require('./alatke.js');
const ratio = alatke.odnosTriBroja;
const plusMinuta = alatke.plusMinuta;


function kendl1Template(trejd) {
    return {
        O: trejd.cijena,
        H: trejd.cijena,
        L: trejd.cijena,
        C: trejd.cijena,
        vrijeme: trejd.vrijeme,
        volBuyeva: 0,
        volSellova: 0
    }
}

function kendlAgroTemplate(prvi) {
    return {
        O: prvi.O,
        H: prvi.H,
        L: prvi.L,
        C: prvi.C,
        vrijeme: prvi.vrijeme,
        volBuyeva: 0,
        volSellova: 0
    }
}

class zTransform extends stream.Transform {
    constructor(param) {
        super(param);
        // dodajemo par stvari u konstruktor transform streama
        this.tempArr = [];  // ovo je privremeni array koji pamti kendlove i nakon pushanja (sve do flushanja)
        this.zadnjiPushan = {}; // ovo je džepić za zadnji kendl (korisno za internu referencu kod kendliziranja i agroanja)
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
            let zaokruzenoVrijeme = new Date(sjeckani[0]);
            zaokruzenoVrijeme.setSeconds(0, 0);
            let trejd = {
                vrijeme: zaokruzenoVrijeme,
                volumen: Number(sjeckani[1]),     
                cijena: Number(sjeckani[2])
            }
            this.push(trejd);
        }
        callback();
    }
});

// provjera je li minutu udaljen sljedeći kendl.
// teško debugiranje u tijeku
function smijesGurati(prosliKendl, ovajKendl) {
    if (!(ovajKendl.vrijeme instanceof Date)) throw new Error('ovajKendl.vrijeme nije Date');

    if (prosliKendl.vrijeme) {
        if (!(prosliKendl.vrijeme instanceof Date)) throw new Error('prosliKendl.vrijeme nije Date');
        let razlika = ovajKendl.vrijeme.getTime() - prosliKendl.vrijeme.getTime();
        if (razlika === 60000) {
            return true;
        } else {
            console.log('udaljenost nije dobra');
            console.log('stari ' + prosliKendl.vrijeme);
            console.log('novi  ' + ovajKendl.vrijeme);
            return false;   
        } 
    } else return false;
}

const kendlizator = new zTransform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        // informativno: chunkovi su objektificirani trejdovi koji dolaze iz objetifikatora
        let zadnjiTrejd = this.tempArr[this.tempArr.length - 1];
        let prazanJeTempArr = !zadnjiTrejd;
        let josNijeGotovKendl = !prazanJeTempArr && (zadnjiTrejd.vrijeme.getTime() === chunk.vrijeme.getTime());
        let brojilo = 0;
        if (prazanJeTempArr || josNijeGotovKendl) {
            this.tempArr.push(chunk);
        } else {
            let milisek = chunk.vrijeme.getTime() - zadnjiTrejd.vrijeme.getTime();
            if (milisek % 60000 !== 0) throw new Error('Ne poklapaju se milisekunde.');
            brojilo = milisek / 60000; // dobijemo broj minuta između novog i zadnjeg trejda
        }
        if (brojilo > 0) { // ako ovo, znači da chunk ne pripada više ovom kendlu. držimo ga sa strane dok ne složimo kendl.
            let kendl = kendl1Template(this.tempArr[0]);
            // iteriramo po trejdovima
            for (let i = 0; i < this.tempArr.length; i++) {
                let trejd = this.tempArr[i];
                if (trejd.cijena > kendl.H) kendl.H = trejd.cijena;
                if (trejd.cijena < kendl.L) kendl.L = trejd.cijena;
                if (i === this.tempArr.length - 1) kendl.C = trejd.cijena;
                if (trejd.volumen > 0) kendl.volBuyeva += trejd.volumen;
                if (trejd.volumen < 0) kendl.volSellova += trejd.volumen;
                if (trejd.vrijeme.getTime() !== kendl.vrijeme.getTime()) throw new Error('Trejdovi nisu u istoj minuti.');
            }
            // prvo provjera jel su minute ok
            if (smijesGurati(this.zadnjiPushan, kendl)) {
                this.zadnjiPushan = kendl;
                this.push(kendl); // šaljemo gotov 1min kendl dalje
            }
            // ako je slučajno prošlo više minuta, popunjavamo s praznim kendlovima
            if (brojilo > 1) {
                let fillKendl = JSON.parse(JSON.stringify(kendl));
                fillKendl.vrijeme = kendl.vrijeme;
                fillKendl.volBuyeva = 0;
                fillKendl.volSellova = 0;
                fillKendl.O = fillKendl.H = fillKendl.L = fillKendl.C;
                //console.log('ovo je zadnji pravi ' + kendl.vrijeme);
                
                for (let i = 1; i < brojilo; i++) {

                    // debug, obrisati
                    if (!(fillKendl.vrijeme instanceof Date)) {
                        console.log(brojilo);
                        console.log(fillKendl);
                        console.log(chunk);
                        throw new Error('Vrijeme nije Date u fillKendlu');
                    }
                    
                    fillKendl.vrijeme = plusMinuta(fillKendl.vrijeme, 1);
                    
                    // provjera prije pušanja dalje
                    if (smijesGurati(this.zadnjiPushan, fillKendl)) {
                        this.zadnjiPushan = fillKendl;
                        this.push(fillKendl);
                    }
                    //console.log('pušan fill ' + fillKendl.vrijeme);

                }
                this.tempArr = []; // flushamo temp array
                this.tempArr.push(chunk); // guramo chunk koji je bio na čekanju
                //console.log('ovo je čank ' + chunk.vrijeme);
            }
        }
        callback();
    }
});

function Agregator(rezolucija) {
    const agregator = new zTransform({
        objectMode: true,
        rezolucija: rezolucija,
        transform(chunk, encoding, callback) {
            if ((chunk.vrijeme.getMinutes() % this.rezolucija === 0) && (this.tempArr.length > 0)) {
                // instanciramo kendl objekt
                let agroKendl = kendlAgroTemplate(this.tempArr[0]);
                // meljemo kroz cijeli tempArr i sastavljamo agroKendl
                agroKendl.vrijeme = plusMinuta(chunk.vrijeme, 0);
                for (let i = 0; i < this.tempArr.length; i++) {
                    let tempKendl = this.tempArr[i];
                    if (tempKendl.H > agroKendl.H) agroKendl.H = tempKendl.H;
                    if (tempKendl.L < agroKendl.L) agroKendl.L = tempKendl.L;
                    if (i === this.tempArr.length - 1) agroKendl.C = tempKendl.C;
                    agroKendl.volBuyeva += tempKendl.volBuyeva;
                    agroKendl.volSellova += tempKendl.volSellova;
                }
                // obavljamo završno čišćenje
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

// konstruktor stream pisača/pisca
function PisacPotok(duljinaCharta) {
    const pisacPotok = new zTransform({
        objectMode: true,
        transform(chunk, encoding, callback) {
            if (this.tempArr.length < duljinaCharta) {
                this.tempArr.push(chunk);
            } else if (this.tempArr.length === duljinaCharta) {
                this.tempArr.shift();
                this.tempArr.push(chunk);
            } else if (this.tempArr.length > duljinaCharta) {
                this.tempArr.shift();
            }
            callback();
        }
    });
    return pisacPotok;
}

// zadnji transform u lancu tako da možemo slati u write stream (mora biti string)
const stringifikator = new zTransform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        this.push(JSON.stringify(chunk) + '\n');
        callback();
    }
});

function agro(mod, inputter, rezolucija, inSize, outSize, prosirenje) {

    let agregator = new Agregator(rezolucija);
    let ioizator = new IOizator(inSize, outSize);
    let lajne = readline.createInterface({
        input: inputter,
        terminal: false,
        crlfDelay: Infinity
    });
    lajne.on('line', (lajna) => {
        objektifikator.write(lajna);
    });
    if (mod === 'simulacija') {
        return objektifikator
        .pipe(kendlizator)
        .pipe(agregator)
    } else if (mod === 'trening-aps') {
        let normalizatorAps = new NormalizatorAps(prosirenje);
        return objektifikator
        .pipe(kendlizator)
        .pipe(agregator)
        .pipe(ioizator)
        .pipe(adaptor)
        .pipe(normalizatorAps)
        //.pipe(stringifikator);
    } else if (mod === 'trening-log') {
        // normalizator log ubaciti
        return objektifikator
        .pipe(kendlizator)
        .pipe(agregator)
        .pipe(ioizator)
        .pipe(adaptor)
        .pipe(normalizatorLog)
        //.pipe(stringifikator);
    }
}

module.exports = {
    agro: agro,
    Agregator: Agregator,
    PisacPotok: PisacPotok,
    zTransform: zTransform
}    