"use strict";

/** Standardizirani Kendl objekat.
 * Dodati metode na kendl (indikatore i sl.)
 */
class Kendl {
    constructor(kendl) {
        this.openTime = Number(kendl[0]);
        this.O = Number(kendl[1]);
        this.H = Number(kendl[2]);
        this.L = Number(kendl[3]);
        this.C = Number(kendl[4]);
        this.sellVolume = Number(kendl[5] - kendl[9]);
        this.buyVolume = Number(kendl[9]);
        this.trades = Number(kendl[8]);
    }
}

module.exports = Kendl;
