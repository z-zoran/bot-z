"use strict";

// lib za logiranje eventova u fajlove

const fs = require('fs');

let loggy = fs.createWriteStream('./pisalo-test.txt');

loggy.pisi = function pisi(data) {
    let zaPisanje = Date.now() + ' ' + JSON.stringify(data) + '\n';
    this.write(zaPisanje);
}

module.exports = loggy;