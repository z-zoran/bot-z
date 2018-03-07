/*
SKRIPTICA ZA IZDVOJENO TESTIRANJE KONCEPTIĆA
*/

// test eventemittera - dal može bit u izdvojenom modulu a zvan odnekud drugdje?

const EventEmitter = require('events').EventEmitter;

const emitterko = new EventEmitter();



let blaBla = function (nekiInput) {
	console.log('testis 123! ' + nekiInput);
}

emitterko.on('event', console.log('tester'));


module.exports = emitterko;

