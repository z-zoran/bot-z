/*
SKRIPTICA ZA IZDVOJENO TESTIRANJE KONCEPTIĆA
*/

// test eventemittera - dal može bit u izdvojenom modulu a zvan odnekud drugdje?

// eventovi
const EventEmitter = require('events').EventEmitter;

const emitterko = new EventEmitter();



let blaBla = function () {
	console.log('testis 123!');
}

emitterko.on('event', blaBla);


module.exports = emitterko;












/*
// PITANJE: da li mogu unutar for-a reći let ovo ono? Izgleda da mogu.
// FOR petlja zaboravlja sve šta je let deklarirano u njoj, sa svakim loop-om. 
// Kad završi zadnji loop, ne sjeća se više ničeg.

for (let i = 0; i < 20; i++) {
	let a = 'bla ' + i;
	console.log(a);
}
console.log(a); // baca error
console.log(i); // baca error
*/
/*
function mirko(b) {
	return b * 10;
}

module.exports = {
	tester: mirko
}
*/
/*
let a = 12;
let b = {}
b.q = {};
b.q.e = 15;

let buyLimitJeTriggeran = a < b.q.e;

console.log(a);
console.log(b);
console.log(b.q);
console.log(buyLimitJeTriggeran);
*/