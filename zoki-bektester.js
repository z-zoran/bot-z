"use strict"

// BEKTESTER.
// LAYER ISPOD JE KENDL-FIDER.

const kendlFider = require('./bektest-kendlfider.js');

let Chart = require('./node_modules/chart.js/dist/Chart.bundle.js');
let ctx1min = document.getElementById("chart1min");
/*
var ctx5min = document.getElementById("chart5min");
var ctx15min = document.getElementById("chart15min");
var ctx1h = document.getElementById("chart1h");
*/

const http = require('http');
const fs = require('fs');

http.createServer(function (req, response) {
    fs.readFile('index.html', 'utf-8', function (err, data) {
        response.writeHead(200, { 'Content-Type': 'text/html' });

        var result = data.replace('{{ubaciMe}}', JSON.stringify(config));
        response.write(result);
        response.end();
    });
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
console.log(config);


//rendomajzer();

var chart1min = new Chart(ctx1min, config);
/*
var chart5min = new Chart(ctx5min, {
    type: 'line',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: 'Lejbel',
            data: podaci,
            backgroundColor: fillBoje,
            borderColor: lineBoje,
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});

var chart15min = new Chart(ctx15min, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: 'Lejbel',
            data: podaci,
            backgroundColor: fillBoje,
            borderColor: lineBoje,
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});

var chart1h = new Chart(ctx1h, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: 'Lejbel',
            data: podaci,
            backgroundColor: fillBoje,
            borderColor: lineBoje,
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});

//addData(myChart, 'labela123', brojilo);

*/