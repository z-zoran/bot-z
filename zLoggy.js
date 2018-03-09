"use strict";

// lib za logiranje eventova u fajlove

const fs = require('fs');

const loggy = function loggy() {
    this.postLimitCounter = 0;
    this.trigLimitCounter = 0;
    this.trigStopCounter = 0;
    this.trigTrailCounter = 0;
    this.logiraj = function logiraj(tip, podatak) {
        switch (tip) {
            case 'postLimit':
                this.postLimitCounter += 1;
                let counterString = (this.postLimitCounter.toString()).padStart(6, "0");
                let imeFajla = './rom/pL' + counterString + '.txt';
                let JSONiziraniPodatak = JSON.stringify(podatak);
                //fs.writeFile
                break;
            case 'trigLimit':
                this.trigLimitCounter += 1;
                break;
            case 'trigStop':
                this.trigStopCounter += 1;
                break;
            case 'trigTrailer':
                this.trigTrailCounter += 1;
                break;
            default: 
        }
    }
}

/*
JSON FORMAT PODATAKA KOJE ZAPISUJEMO:
postlimit:
{
    
}




LOGIRATI:
    - SVAKO POSTAVLJANJE LIMITA
    - SVAKO TRIGGERANJE LIMITA
    - SVAKO TRIGGERANJE STOPA
    - SVAKO TRIGGERANJE TRAILERA
*/

module.exports = loggy;