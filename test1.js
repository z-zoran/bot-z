let util = require('./util.js');
let odnos = util.odnosTriBroja;

let a = {
    b: {
        c: 3
    },
    d: 2,
    e: 1
}

let test1 = (odnos(a.e, a.d, a.b.c) < 5);
console.log(test1);