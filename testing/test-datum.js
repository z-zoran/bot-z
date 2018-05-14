"use strict";

let sirov = '2017-10-19 14:17:08';


let d = new Date(sirov);
let e = new Date(d.getTime());
if (d.getTime() === e.getTime()) console.log('isti su');
console.log(d);
console.log(e);


/*
console.log(d.getFullYear());
console.log(d.getMonth());
console.log(d.getDate());
console.log(d.getHours());
console.log(d.getMinutes());
console.log(d.getSeconds());
console.log(d.getTime());
console.log(d);
d.setTime(d.getTime() + 60000);
console.log(d.getTime());
console.log(d);
console.log(d.toString());
*/

function plusMinuta(vrijeme, koliko) {
    return new Date(vrijeme.getTime() + (koliko * 60000));
}
