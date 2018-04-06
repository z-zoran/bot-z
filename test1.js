
/*
let test = [];
if (!test[test.length - 1]) {
    console.log('nije');
} else {
    console.log('je');
}
*/
let stream = require('stream');
class myTransform extends stream.Transform {
    constructor(param) {
        super();
        this.tempArr = [];
        this.rezolucija = param.rezolucija;
    }
}

const agregator = new myTransform({
    objectMode: true,
    rezolucija: 12,
    transform(chunk, encoding, callback) {
        if ((chunk.minuta % 5 === 0) && (this.tempArr.length > 0)) {
            let agroKendl = new kendlAgroTemplate(this.tempArr[0]);
            for (let i = 0; i < this.tempArr.length; i++) {
                let tempKendl = this.tempArr[i];
                if (tempKendl.H > agroKendl.H) {agroKendl.H = tempKendl.H}
                if (tempKendl.L < agroKendl.L) {agroKendl.L = tempKendl.L}
                agroKendl.volBuyeva += tempKendl.volBuyeva;
                agroKendl.volSellova += tempKendl.volSellova;
            }
            let zadnjiTempKendl = this.tempArr[this.tempArr.length - 1];
            agroKendl.C = zadnjiTempKendl.C;
            agroKendl.minuta = chunk.minuta;
            this.tempArr = []; // flushamo temp array
            this.tempArr.push(chunk); // guramo chunk koji je bio na čekanju
            this.push(kendl); // šaljemo gotov kendl dalje
        } else {
            this.tempArr.push(chunk);
        }
        callback();
    }
});

console.log(JSON.stringify(Object.keys(agregator)));
console.log(agregator.rezolucija);
console.log(agregator.tempArr);
