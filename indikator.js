"use strict";

/*
var agro = require('./zAggry.js');

var tulind = require('tulind');
console.log("Tulip Indicators version is:");
console.log(tulind.version);
*/

// EMA
/**
 Initial SMA: 10-period sum / 10 

Multiplier: (2 / (Time periods + 1) ) = (2 / (10 + 1) ) = 0.1818 (18.18%)

EMA: {Close - EMA(previous day)} x multiplier + EMA(previous day). 
 * 
 */
function emaProblema(period, set) {
    let suma = 0;
    for (let i = 1; i <= period; i++) {
        suma += set[set.length - i].C
    }
    suma /= period;
    // vratiti iz test3.js
}




// STANDARDNA to jest Z. DEVIJACIJA
// input su kendlovi
// 1 treba izračunati mean perioda
// 2 onda udaljenost svakog od kendla od meana
// 3 onda svaku udaljenost kvadriramo
// 4 zbrojimo ih sve za period
// 5 podjelimo s periodom
// 6 tražimo korjen od rezultata

// inače ekipa računa korak 2 na način da oduzmu closing cijenu kendla od meana.
// ja mislim da je to suludo. zanima nas varijacija cijene, boli me k jel close ili high ili low.
// stoga, moja dodana čarolija je da tražim NAJUDALJENIJU cijenu od meana za svaki kendl.

// druga stvar, ekipa na koraku 1 inače traži mean (average) cijene kroz neki period. međutim, kendlovi nisu samo jedna cijena
// i mislim da je krivo uzet samo close kao da je više relevantan nego H ili L ili O.
// umjesto toga ja bi napravio za svaki kendl nekakav kendl mean tipa {[(H*volBuyeva)+(L*volSellova)]/(ukupni volumen)}
// Čini mi se da takva formula bolje opisuje average jednog kendla. Onda za svaki kendl računamo tako nešto.

function zDevijacija(data, period) {  // inputi su lista kendlova (zadnji najnoviji) i željeni period (recimo 20)
    let p = 0;
    let subSet = {};
    subSet.kendl = [];
    subSet.sumaMeanova = 0;
    for (let i = 0; i < period; i++) {
        p = data.length - i - 1;  // brojimo data unazad od najnovijeg kendla prema starijima
        subSet.kendl[i] = {};   // za razliku od data, subSetov prvi kendl element je najnoviji, pa prema starijima
        
        // debug:
        // console.log(data[p].volBuyeva);

        // prvo treba izračunati mean za svaki kendl
        subSet.kendl[i].kendlMean = ((data[p].H * data[p].volBuyeva) + (data[p].L * Math.abs(data[p].volSellova))) / (data[p].volBuyeva + Math.abs(data[p].volSellova));
        // onda, jer će nam kasnije trebat, bilježimo u subSet za svaki kendl H i L
        subSet.kendl[i].H = data[p].H;
        subSet.kendl[i].L = data[p].L;
        // zbrajamo sve meanove
        subSet.sumaMeanova += subSet.kendl[i].kendlMean;  
    }
    // dijelimo s periodom da dobijemo mean cijelog perioda
    subSet.periodMean = subSet.sumaMeanova / period;
    subSet.sumaKvadrata = 0;
    for (let j = 0; j < period; j++) {
        // računamo udaljenost najudaljenije cijene svakog kendla od meana cijelog perioda
        let meanDoHigh = Math.abs(subSet.kendl[j].H - subSet.periodMean);
        let meanDoLow = Math.abs(subSet.kendl[j].L - subSet.periodMean);
        // tražimo najveću udaljenost i onda ju kvadriramo
        if (meanDoHigh > meanDoLow) {
        subSet.kendl[j].kvadratUdaljenostiMeana = meanDoHigh * meanDoHigh;
        } else {
        subSet.kendl[j].kvadratUdaljenostiMeana = meanDoLow * meanDoLow;
        }
        // zbrajamo sve kvadrate
        subSet.sumaKvadrata += subSet.kendl[j].kvadratUdaljenostiMeana;
    }
    // djelimo sumu kvadrata s periodom
    let prijeKorjena = subSet.sumaKvadrata / period;
    // tražimo korjen
    let stDevijacija = Math.sqrt(prijeKorjena);
    // vraćamo vrijednost. To je st. devijacija samo za zadnji kendl. Za svaki kendl za koji želimo dobiti stdev,
    // treba kalkulirati kao da je taj kendl zadnji u periodu.
    
    // debug:
    // console.log(subSet.kendl[3]);
    
    return stDevijacija;

}

module.exports = zDevijacija;