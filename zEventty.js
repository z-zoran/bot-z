"use strict";

// Event mašina
// Tu definiramo glavni EventEmitter koji sluša eventove i aktivira potrebne funkcije.
// Također definiramo i dotične funkcije.
// Moduli koji trebaju event komunikaciju, uključuju ovaj modul da mogu emitirati

// Trebati će poubacivati metode/funkcije za komunikaciju s exchangeovima za skoro svaki event.
// Ctrl+F i nađi "exchange" za komunikaciju s burzom, "internal" za unutarnju logiku programa.

// eventovi
const EventEmitter = require('events').EventEmitter;

const emitterko = new EventEmitter();

/************************BUY I SELL LIMIT TRIGGER***************************** */
// BUY LIMIT TRIGGER event
let triggeraloBuyLimit = function () {
    console.log('Triggeran BUY LIMIT');
}
emitterko.on('triggeranBuyLimit', triggeraloBuyLimit);

// SELL LIMIT TRIGGER event
let triggeraloSellLimit = function () {
    console.log('Triggeran SELL LIMIT');
}
emitterko.on('triggeranSellLimit', triggeraloSellLimit);

/******************************STOP TRIGGERI******************************* */
// GORNJI STOP TRIGGER event
let triggeraloGornjiStop = function (cijena) {
    console.log('Triggeran STOP PREMA GORE. Postavljen TRAILER!');
    // internal: aktiviraj trailer na "cijena"
}
emitterko.on('triggeranStopPremaGore', triggeraloGornjiStop);

// DONJI STOP TRIGGER event
let triggeraloDonjiStop = function (cijena) {
    console.log('Triggeran STOP PREMA DOLE. Postavljen TRAILER!');
    // internal: aktiviraj trailer na "cijena"
}
emitterko.on('triggeranStopPremaDole', triggeraloDonjiStop);

/***********TRAILER TRIGGERI - dal ovo uopće treba biti tu????************ */
// PENJUĆI TRAILER TRIGGER event
let triggeraloPenjuciTrailer = function (idPozicije) {
    console.log('Triggeran TRAILER KOJI PRATI ODOZDO. Profit!');
    // internal: ugasi taj trailer
    // exchange: market sell (izlaz) pozicije čiji je trailer
}
emitterko.on('triggeranPenjuciTrailer', triggeraloPenjuciTrailer);

// SPUŠTAJUĆI TRAILER TRIGGER event
let triggeraloSpustajuciTrailer = function (idPozicije) {
    console.log('Triggeran TRAILER KOJI PRATI ODOZGO. Profit!');
    // internal: ugasi taj trailer
    // exchange: market buy (izlaz) pozicije čiji je trailer
}
emitterko.on('triggeranSpustajuciTrailer', triggeraloSpustajuciTrailer);

/***********************BUY I SELL LIMIT KOREKCIJA************************** */
// BUY LIMIT KOREKCIJA event
let popraviBuyLimit = function (cijena) {
    console.log('Korigiram BUY LIMIT');
    // exchange: otkazati postojeći buy limit
    // exchange: zakačiti novi buy limit na "cijena"
}
emitterko.on('postaviBuyLimit', popraviBuyLimit);

// SELL LIMIT KOREKCIJA event
let popraviSellLimit = function (cijena) {
    console.log('Korigiram SELL LIMIT');
    // exchange: otkazati postojeći sell limit
    // exchange: zakačiti novi sell limit na "cijena"
}
emitterko.on('postaviSellLimit', popraviSellLimit);

/**************************PIZDARIJA*************************************** */
// ako na neku foru algoritam procuri kroz neki od if-ova 1-4 u zStratty, onda je ovo hvatač tog errora
// (jer je jedini način da je procurilo = nekakav error u programu, odnosno ne daje željene rezultate)
let procuriloJe = function () {
    console.log('ERROR!!! Procurio sam kroz if-ove!!! OVO SE NE SMIJE DEŠAVATI!');
}
emitterko.on('procurioSam', procuriloJe);

module.exports = emitterko;