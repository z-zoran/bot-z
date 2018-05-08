"use strict";

let sirov = '2017-10-19 14:17:08';

let d = new Date(sirov);
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


function plusMinuta(vrijeme, koliko) {
    return new Date(vrijeme.getTime() + (koliko * 60000));
}



/*
// vratiti u agropotok
const objektifikator = new zTransform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        // format jednog trejda: 
        // 2017-08-24 11:57:42,-18.7448,324.64
        let sjeckani = chunk.split(',');
        if (sjeckani[0] !== 'timestamp') {
            let trejd = {
                vrijeme: new Date(sjeckani[0]),
                volumen: Number(sjeckani[1]),     
                cijena: Number(sjeckani[2])
            }
            this.push(trejd);
        }
        callback();
    }
});
*/