"use strict";

let koliko = 0;

function obecanje() {
    return new Promise((resolve) => {
        setTimeout(() => {
            koliko++;
            resolve('tajmer ' + koliko);
        }, 2000);
    })
}

async function test(br) {
    for (let i = 0; i < br; i++) {
        console.log('iteracija: ' + (i + 1));
        console.log('tester: ' + await obecanje());
    }
}

test(3);