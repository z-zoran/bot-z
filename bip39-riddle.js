let bip39 = require('bip39');
let bip32 = require('bip32');
let assert = require('assert');

var bitcoin = require('bitcoinjs-lib')

let sveRijeci = [
    'problem',
    'proof',
    'attack',
    'since',
    'ability',
    'end',
    'entire',
    'know',
    'sign',
    'post',
    'fee',
    'find',
];

let br = 0;
let rjesenje = '';
let svaRjesenja = [];
const cilj = '37XTVuaWt1zyUPRgDDpsnoo5ioHk2Da6Fs';

function test(rjesenje) {
    let seed = bip39.mnemonicToSeed(rjesenje);
    let root = bip32.fromSeed(seed);
/*
    // receive addresses
    assert.strictEqual(getAddress(root.derivePath("m/0'/0/0")), cilj);
    assert.strictEqual(getAddress(root.derivePath("m/0'/0/1")), cilj);
*/
    // change addresses
    /*
    assert.strictEqual(getAddress(root.derivePath("m/0'/1/0")), cilj);
    assert.strictEqual(getAddress(root.derivePath("m/0'/1/1")), cilj);
    */
}


kombinator(sveRijeci, rjesenje);

function kombinator(lista, rj) {
    if (lista.length === 0) {
        if (bip39.validateMnemonic(rj)) {
            test(rjesenje);
        }
    } else {
        for (let i = 0; i < lista.length; i++) {
            let kopija = lista.slice(0, lista.length);
            let rijec = lista[i];
            kopija.splice(i, 1);
            let rjesenje = '';
            if (rj) { rjesenje = rj + ' ' + rijec }
            else { rjesenje = rijec };
            kombinator(kopija, rjesenje);
        }
    }
}