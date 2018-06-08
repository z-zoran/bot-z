/** Standardizirani Kendl objekat.
 * 
 * Dodati metode na kendl (indikatore i sl.)
 */

class Kendl {
    constructor(kendl) {
        this.openTime = kendl[0];
        this.O = kendl[1];
        this.H = kendl[2];
        this.L = kendl[3];
        this.C = kendl[4];
        this.volume = kendl[5];
        this.buyVolume = kendl[9];
        this.trades = kendl[8];
    }
}

let kendl = [
    123,
    65,
    125555,
    13,
    987,
    123,
    65,
    125555,
    13,
    987,
];

let a = new Kendl(kendl);

console.log(a);
console.log();
console.log(JSON.stringify(a));