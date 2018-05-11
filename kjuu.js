"use strict";

const naredbe = [];
setInterval(queFunkcija, 1000, naredbe);

function queFunkcija(naredbe) {
    
    console.log(Date.now());
}




// ovaj sistem nije dobar jer moguće da dok jedna naredba čeka, druga proba uletit u malom vremenskom
// prozoru nakon završetka 1000 ms a prije izvršavanja ove naredbe. ipak treba implementirati queue.
function provjeraRateLimit(naredba, log) {
    // vrijeme od zadnje izvršene naredbe (prema exchangeu)
    let odZadnjeNaredbe = Date.now() - log[log.length - 1].timestamp;
    if (odZadnjeNaredbe < 1000) {
        let cekajMalo = 1000 - odZadnjeNaredbe;
    }
    setTimeout(naredba, cekajMalo);
}

