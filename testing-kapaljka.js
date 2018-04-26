const agro = require('./agroPotok.js');
const fs = require('fs');
const http = require('http');
const url = require('url');

const inputter = fs.createReadStream('exchdata/testdata.csv');
const potok = agro(inputter, 15, 2, 1);

let br = 2;

let tekst = '<p>';

function kapanje(br) {
    for (let i = 0; i < br; i++) {
        let jedan = potok.read();
        if (jedan) {tekst += jedan.datum + ' ' + jedan.sat + ':' + jedan.minuta + ' ' + jedan.C + '<br/>'}
        else {tekst += 'Nema ništa smisleno <br/>'}
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
    parsaj(req.url) ? kapanje(parsaj(req.url)) : null;
    response.write(tekst);
    response.write('</p></body></html>');
    response.end();
}).listen(1337, '127.0.0.1');

console.log('Testiranje kapaljke http://127.0.0.1:1337/ ');


// USPJEŠNA KAPALJKA!!!
// implementirati u main.js