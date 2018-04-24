const agro = require('./agroPotok.js');
const fs = require('fs');

const inputter = fs.createReadStream('exchdata/testdata.csv');
const potok = agro(inputter, 1, 2, 1);

let br = 3;
let koliko = 5;

function kapaljka(br) {
    if (br) {
        console.log(br + ' read: ' + JSON.stringify(potok.read()));
        br--;
    } else {
        potok.pause();
    }
}

function kapanje(br) {
    potok.on('readable', () => {
        if (br) {
            console.log(br + ' read: ' + JSON.stringify(potok.read()));
            br--;
        } else {
            potok.pause();
        }
    })
}
kapanje(br);
console.log('Ovo je prvo jer potok još nije readable');

setTimeout(() => {
    console.log('Ovo je poslje svega');

    br = 0;
}, 1000);

// uspješna logika za kapaljku
// jebem ti mater potocima i svemu