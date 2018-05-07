/***** REQUIREi *****/
const agro = require('./agroPotok.js');
const fs = require('fs');
const http = require('http');

/***** CONFIG *****/
const inputter = fs.createReadStream('exchdata/testdata.csv');
const rezolucija = 1;
const inSize = 15;
const outSize = 2;
const prosirenje = 1;
const mod = 'simulacija' // ili 'trening-aps' ili 'trening-log'

/***** POTOK *****/

let br = 2;

let tekst = '<p>';

const set = {
    ss1: [],
    ss5: [],
    ss15: []
}

const potok = agro.agro(mod, inputter, rezolucija, inSize, outSize, prosirenje);

async function spremanPotok(potok) {
    return new Promise(resolve => potok.on('readable', resolve));
}

async function kapaljka(potok) {
    let kap = potok.read();
    if (kap) {
        return new Promise(resolve => resolve(kap));
    } else {
        return new Promise(resolve => {
            spremanPotok(potok).then(() => {
                kapaljka(potok).then(kap => resolve(kap));
            });
        });
    }
}

async function izKanalaKapamo(kanal) {
    let kap = {
        k1:null,
        k5:null,
        k15:null 
    }
    kap.k1 = await kapaljka(kanal.k1);
    if (kap.k1.minuta % 5 === 0) kap.k5 = await kapaljka(kanal.k5);
    if (kap.k1.minuta % 15 === 0) kap.k15 = await kapaljka(kanal.k15);
    return kap;
}

async function kapPoKap(br, kanal, set) {
    for (let i = 0; i < br; i++) {
        let kap = await izKanalaKapamo(kanal);
        if (kap.k1) set.ss1.push(kap.k1);
        if (kap.k5) set.ss5.push(kap.k5);
        if (kap.k15) set.ss15.push(kap.k15);            
    }
}



function parsaj(url) {
    if (url.slice(0, 4) === '/?i=') {
        return url.slice(4, url.length);
    } else {
        return null;
    }
}

let iteracija = 0;

// madrfakin server
http.createServer(function (req, response) {
    iteracija++;
    console.log('Server callback: ' + String(iteracija).padStart(3, "0"));
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(fs.readFileSync('testing-kapaljka-sajt.html'));
    let brojilo = parsaj(req.url);
    if (!brojilo) brojilo = 0;

    izKanalauSet(potok).then(kap => {
        tekst += 'K1 ' + kap.k1.sat + kap.k1.minuta + '| K5' + kap.k5.sat + kap.k5.minuta + '| K15' + kap.k15.sat + kap.k15.minuta + '<br/>';
        response.write(tekst);
        response.write('</p></body></html>');
        response.end();
    })
}).listen(1337, '127.0.0.1');

console.log('Testiranje na http://127.0.0.1:1337/ ');


// USPJEŠNA KAPALJKA!!!
// implementirati u main.js