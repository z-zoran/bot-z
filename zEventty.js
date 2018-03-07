"use strict";

// Event mašina
// Tu definiramo glavni EventEmitter koji sluša eventove i aktivira potrebne funkcije.
// Moduli koji trebaju event komunikaciju, uključuju ovaj modul da mogu emitirati

// Trebati će poubacivati metode/funkcije za komunikaciju s exchangeovima.
// Nađi u fajlu di god piše 'exchange komunikacija'

// treba složiti funkciju "pozicioniranje" koja traži najpovoljniju poziciju iz koje bi se izašlo u novu poziciju
/* nešto tipa 
    1 nađi poziciju s najpovoljnijom base valutom
    2 provjeri je li dovoljno velika za nov izlazak
*/

// eventovi
const EventEmitter = require('events');

class OrderEmitter extends EventEmitter {}

const emitterko = new OrderEmitter();
emitterko.on('triggeranBuyLimit', triggeraloBuyLimit);
emitterko.on('triggeranSellLimit', triggeraloSellLimit);

emitterko.on('triggeranStopPremaGore', console.log('Triggeran STOP PREMA GORE. Postavljen TRAILER!'));
emitterko.on('triggeranStopPremaDole', console.log('Triggeran STOP PREMA DOLE. Postavljen TRAILER!'));

emitterko.on('triggeranPenjuciTrailer', console.log('Triggeran TRAILER KOJI PRATI ODOZDO. Profit!'));
emitterko.on('triggeranSpustajuciTrailer', console.log('Triggeran TRAILER KOJI PRATI ODOZGO. Profit!'));

emitterko.on('postaviBuyLimit', console.log('Korigiram BUY LIMIT'));
emitterko.on('postaviSellLimit', console.log('Korigiram SELL LIMIT'));

emitterko.on('procurioSam', console.log('POZOR!!! Procurio sam kroz if-ove!!! OVO SE NE SMIJE DEŠAVATI!'));

let triggeraloBuyLimit = function () {
    console.log('Triggeran BUY LIMIT');
}

let triggeraloSellLimit = function () {
    console.log('Triggeran SELL LIMIT');
}

let triggeraloBuyLimit = function () {
    console.log('Triggeran BUY LIMIT');
}

let triggeraloBuyLimit = function () {
    console.log('Triggeran BUY LIMIT');
}

let triggeraloBuyLimit = function () {
    console.log('Triggeran BUY LIMIT');
}

let triggeraloBuyLimit = function () {
    console.log('Triggeran BUY LIMIT');
}



//emitterko.emit('event');
