
let bip39 = require('bip39');
let bitcoin = require('bitcoinjs-lib');


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
const cilj = '37XTVuaWt1zyUPRgDDpsnoo5ioHk2Da6Fs';

kombinator(sveRijeci, rjesenje);

function kombinator(lista, rj) {
    if (lista.length === 0) {
        if (bip39.validateMnemonic(rj)) {
            tester(rj);
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

function tester(mnemonic) {
    var seed = bip39.mnemonicToSeed(mnemonic)
    var bitcoinNetwork = bitcoin.networks.bitcoin
    let wif = bitcoin.HDNode
        .fromSeedBuffer(seed, bitcoinNetwork)
        .derivePath('m/0')
        .keyPair.toWIF();
    var keyPair = bitcoin.ECPair.fromWIF(wif);
    var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(keyPair.getPublicKeyBuffer()))
    var scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript))
    var address = bitcoin.address.fromOutputScript(scriptPubKey)
    if (address === cilj) console.log('Nađena mnemonika!!! ' + mnemonic);
    br++;
    if (br % 1000 === 0) console.log(Date.now() + ' Isprobano ' + br + ' kombinacija.');
}
