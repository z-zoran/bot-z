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