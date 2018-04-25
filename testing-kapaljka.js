const agro = require('./agroPotok.js');
const fs = require('fs');
const http = require('http');

const inputter = fs.createReadStream('exchdata/testdata.csv');
const potok = agro(inputter, 1, 2, 1);

let br = 2;

potok.on('data', () => {
    potok.pause();
})

let povrat;

function kapanje() {
    let jedan = potok.read();
    povrat += JSON.stringify(jedan.minuta + ' ' + jedan.C + ' ' + jedan.minuta + '<br/>');
}

// madrfakin server
http.createServer(function (req, response) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    if (req.url === '/?i=5') {
        for (let i = 0; i < 5; i++) {
            kapanje();
        }
    }
    response.write(fs.readFileSync('testing-kapaljka-sajt.html'));
    response.write(povrat);
    response.write('</p></body></html>');
    response.end();
}).listen(1337, '127.0.0.1');

console.log('Testiranje kapaljke http://127.0.0.1:1337/ ');


// USPJEŠNA KAPALJKA!!!