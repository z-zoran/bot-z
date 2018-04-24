const agro = require('./agroPotok.js');
const fs = require('fs');

const inputter = fs.createReadStream('exchdata/testdata.csv');
const potok = agro(inputter, 1, 2, 1);

let br = 2;

potok.on('data', () => {
    potok.pause();
})


potok.on('readable', () => {
    if (br) {
        console.log(br + ' read: ' + JSON.stringify(potok.read()));
        br--;
    } else {
        potok.pause();
    }
})


console.log('Ovo je prvo jer potok još nije readable');

console.log(potok.read());

setTimeout(() => {
    console.log('Ovo je poslje svega');
    br = 3;
}, 1000);