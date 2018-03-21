"use strict";
/*
let Chart = require('./node_modules/chart.js/dist/Chart.bundle.js');
/*
let ctx1min = document.getElementById("chart1min");

var ctx5min = document.getElementById("chart5min");
var ctx15min = document.getElementById("chart15min");
var ctx1h = document.getElementById("chart1h");
*/

const http = require('http');
const fs = require('fs');

/* pathovi za gornje i donje pecivo sendviča */
let gornjiPath = './HTMLburgerGornji.html';
let donjiPath = './HTMLburgerDonji.html';


function playPauza(koraka) {
    // cijeli ovaj fajl implementirati u main
    // konkretno ovu funkciju koristiti kao for s brojem ponavljanja koliko ima koraka.
    // feedati podatke za chart u mali subset objekat kojeg onda na kraju playPauze feedamo u chart da se iscrta
}

http.createServer(function (req, response) {
    response.writeHead(200, { 'Content-Type': 'text/html' });

    response.write(fs.readFileSync(gornjiPath));

    if (req.url === '/?kolikoMinuta=5') {
        playPauza(5);
    } else if (req.url === '/?kolikoMinuta=15') {
        playPauza(15);
    } else if (req.url === '/?kolikoMinuta=60') {
        playPauza(60);
    }

    response.write(fs.readFileSync(donjiPath));
    response.end();
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
