"use strict";

// lib za logiranje eventova u fajlove

const fs = require('fs');

let pisalo = fs.createWriteStream('./pisalo-test.txt');

pisalo.pisi = function pisi(data) {
    let zaPisanje = Date.now() + ' ' + JSON.stringify(data) + '\n';
    this.write(zaPisanje + '\n');
}

module.exports = pisalo;