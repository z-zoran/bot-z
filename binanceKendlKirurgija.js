"use strict";

// instanciranje klijenta prema binanceu
const binance = require('node-binance-api');
const memorija = require('./memorija.js');
const symbol = 'ETHBTC';
// memorija kendlovi
if (!memorija.kendlovi[symbol]) memorija.kendlovi[symbol] = [];

/* PROVJERITI I EVENTUALNO POPRAVITI ASYNC-AWAIT U CIJELOM MODULU */

// ubaciti mogućnost skidanja preko 500 kendlova
async function krpanjeRupaKendlArraya(stariArr, noviKendl, rez) {
    let rezStr = rez === 1 ? '1m' : rez === 5 ? '5m' : rez === 15 ? '15m' : rez === 60 ? '1h' : null;
    if (!rezStr) throw new Error('Rezolucija: ' + rez);
    let korak = rez * 60000; // rezolucija je u min, korak je u milisek
    let startTime = stariArr[stariArr.length - 1].openTime + korak; // prvi slijedeći kendl
    let razlika = noviKendl.openTime - startTime;
    let koliko = 0;
    if (razlika % korak === 0) {
        koliko = (razlika / korak) - 1;
        if (koliko > 500) {
            await dohvatiObradiSpremi(stariArr, symbol, 500, rezStr, startTime);
            koliko -= 500;
            return await krpanjeRupaKendlArraya(stariArr, symbol, koliko, rezStr, startTime);
        } else if (koliko <= 500) {
            return await dohvatiObradiSpremi(stariArr, symbol, koliko, rezStr, startTime);
        }
    } else throw new Error('Čudna razlika između timestampova. ' + noviKendl.openTime);
}

/** Funkcija za dohvatiti, kendlizirati i spremiti in-place u memoriju kendlove s Binancea.
 * 
 * @param {array} stariArr - array s kendlovima iz memorije
 * @param {string} symbol - par koji dohvaćamo
 * @param {number} koliko - koliko kendlova trebamo
 * @param {string} rezStr - rezolucija (string) npr. '1m', '5m' itd.
 * @param {number} startTime - timestamp opentTime prvog kendla
 */
function dohvatiObradiSpremi(stariArr, symbol, koliko, rezStr, startTime) {
    return dohvatiKendlove(symbol, koliko, rezStr, startTime)
        .then(kendlizirajResponse(error, kendlovi, symbol))
        .then(noviArr => umetniKendlove(stariArr, noviArr))
}

/** Promise za dohvatiti arbitrarni broj kendlova s Binancea.
 * 
 * @param {string} symbol - par koji dohvaćamo
 * @param {number} koliko - koliko kendlova trebamo
 * @param {string} rezStr - rezolucija (string) npr. '1m', '5m' itd.
 * @param {number} startTime - timestamp opentTime prvog kendla
 * @returns {Promise} - vraća Promise dok nas Binance ne resolva
 */
function dohvatiKendlove(symbol, koliko, rezStr, startTime) {
    return new Promise(function(resolve, reject) {
        binance.candlesticks(symbol, rezStr, resolve, {limit: koliko, startTime: startTime});
    });
}

/** Funkcija za dohvatiti zadnji kendl za sve parove s whiteliste.
 * 
 * @param {array} whitelista - popis symbola za trejdanje
 * @param {string} rezStr - rezolucija (string) npr. '1m', '5m' itd.
 * @param {number} startTime - timestamp opentTime prvog kendla
 */
function dohvatiHorizontalnoSveSymbole(whitelista, rezStr, startTime) {
    whitelista.forEach(symbol => {
        let arr = memorija.kendlovi[symbol][rezStr];
        dohvatiObradiSpremi(arr, symbol, 1, rezStr, startTime);
    });
}

/** Funkcija za pretvoriti payload s Binancea u standardizirane Kendl objekte.
 * 
 * @param {*} error - potencijalni error proslijeđen iz dohvatiKendlove
 * @param {array} kendlovi - payload array kendlova u sirovom formatu
 * @param {string} symbol - par koji dohvaćamo
 * @returns {array} - vraća array standardnih Kendl objekata
 */
function kendlizirajResponse(error, kendlovi, symbol) {
    if (error) throw new Error('Problem u kendlizaciji payloada. ' + error)
    else return kendlovi.map(kendl => new Kendl(kendl));
}

/** Funkcija za umetnuti Kendl objekte in-place u array (vjerojatno u memorija.kendl[symbol][rezStr]).
 * 
 * @param {array} stariArr - postojeći array iz memorije
 * @param {array} noviArr - novi kendlizirani array kojeg treba umetnuti u stari
 * @returns {array} - nakon in-place umetanja, vraćamo popunjeni array (redundantno jer je in-place)
 */
function umetniKendlove(stariArr, noviArr) {
    while (noviArr) {
        // rez treba u minutama, pa dijelimo razliku milisekundi s 60k
        let rez = (stariArr[stariArr.length - 1].openTime - stariArr[stariArr.length - 2].openTime) / 60000;
        let zadnji = stariArr[stariArr.length - 1]; // zadnji iz postojećeg arraya kendlova
        let novi = noviArr[0];  // prvi u payloadu kendlova
        if (dobarRedoslijedKendla(novi, zadnji, rez)) stariArr.push(noviArr.shift())
        else throw new Error('Nije dobar redoslijed kendlova pri samom umetanju.');
    }
    return stariArr;
}

/** Predikatna funkcija koja provjerava da li se poklapaju timestampovi dva Kendl objekta.
 * 
 * @param {Kendl} kendlNovi - dolazni Kendl
 * @param {Kendl} kendlStari - stari Kendl
 * @param {number} rez - rezolucija (kao broj minuta)
 * @return {boolean} - vraća true/false da li timestampovi odgovaraju
 */
function dobarRedoslijedKendla(kendlNovi, kendlStari, rez) {
    let razlika = kendlNovi.openTime - kendlStari.openTime;
    let korak = rez * 60000; // rezolucija je u min, korak je u milisek
    if (razlika === korak) return true
    else return false;
}

/** Standardizirani Kendl objekat.
 * 
 * Dodati metode na kendl (indikatore i sl.)
 */
class Kendl {
    constructor(kendl) {
        this.openTime = kendl[0];
        this.O = kendl[1];
        this.H = kendl[2];
        this.L = kendl[3];
        this.C = kendl[4];
        this.volume = kendl[5];
        this.buyVolume = kendl[9];
        this.trades = kendl[8];
    }
}

module.exports = {
    krpanjeRupaKendlArraya: krpanjeRupaKendlArraya,
    dohvatiHorizontalnoSveSymbole: dohvatiHorizontalnoSveSymbole,
}