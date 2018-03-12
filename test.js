
let memorija = {};
console.log(memorija);
memorija.limiti = {};
console.log(memorija.limiti);
memorija.limiti.buy = {};
console.log(memorija.limiti.buy);
memorija.limiti.sell = {};
memorija.limiti.buy.iznos = 13;
console.log(memorija.limiti.buy.iznos);



let koja = 'buy';
let a = memorija.limiti[koja].iznos;

console.log(a);



/*
let fs = require('fs');
let pisalo = fs.createWriteStream('./testwritestream.txt');

let testniPodatak = {};

function miksanje() {
    for (let i = 0; i < 50; i++) {
        let broj = Math.random() * 100;
        testniPodatak[i] = broj;
    }
}

for (let i = 0; i < 200; i++) {
    miksanje();
    console.log(testniPodatak);
    pisalo.write(JSON.stringify(testniPodatak) + '\n');
}

pisalo.end();
*/