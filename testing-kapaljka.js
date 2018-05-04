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


const potok = agro.agro(mod, inputter, rezolucija, inSize, outSize, prosirenje);

console.log(potok.read());


async function mozeSe(potok) {
    return new Promise(resolve => potok.on('readable', resolve));
}

async function kapaljka(potok) {
    let kap = potok.read();
    if (kap) {
        return new Promise(resolve => resolve(kap));
    } else {
        return new Promise(resolve => {
            mozeSe(potok).then(() => {
                kapaljka(potok).then(kap => resolve(kap));
            });
        });
    }
}

async function kapanje(br, potok) {
    for (let i = 0; i < br; i++) {
        let jedan = await kapaljka(potok);
        if (jedan) {
            tekst += jedan.datum + ' ' + jedan.sat + ':' + jedan.minuta + ' ' + jedan.C + '<br/>';
            return tekst;
        } else {
            tekst += 'Nema ništa smisleno <br/>';
            i--;
        }
    }
}

function parsaj(url) {
    if (url.slice(0, 4) === '/?i=') {
        return url.slice(4, url.length);
    }
}

// madrfakin server
http.createServer(function (req, response) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(fs.readFileSync('testing-kapaljka-sajt.html'));
    let brojilo;
    if (parsaj(req.url) === null) {
        brojilo = parsaj(req.url);
    } else {
        brojilo = 10;
    }
    kapanje(brojilo, potok).then(() => {
        response.write(tekst);
        response.write('</p></body></html>');
        response.end();
    })
}).listen(1337, '127.0.0.1');

console.log('Testiranje na http://127.0.0.1:1337/ ');


// USPJEŠNA KAPALJKA!!!
// implementirati u main.js