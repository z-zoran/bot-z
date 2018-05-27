"use strict";



let b = {
    '123': 1.2,
    '234': 2.3,
    '345': 3.4,
}

let a = Object.keys(b);

console.log(Math.max(...a));