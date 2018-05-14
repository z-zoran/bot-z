// EMA
/**
 Initial SMA: 10-period sum / 10 

Multiplier: (2 / (Time periods + 1) ) = (2 / (10 + 1) ) = 0.1818 (18.18%)

EMA: {Close - EMA(previous day)} x multiplier + EMA(previous day). 
 * 
 */
function emaKalk(close, multi, emaProsla) {
    return ((close * multi) + (emaProsla * (1 - multi)));
}

function emaProblema(perioda, set) {
    // prvo tražimo multiplikatora
    let multi = ( 2 / (perioda + 1) )
    let emaSet = [];
    for (let i = 0; i < set.length; i++) {
        i === 0 ? emaSet[0] = set[0].C : emaSet[i] = emaKalk(set[i].C, multi, emaSet[i - 1])
    }
    return emaSet;
}

function napraviSet(koliki) {
    let set = [];
    let br = 0;
    for (let i = 0; i < 10; i++) {
        set.push({C: i + 15});
        br++;
    }
    for (let i = 0; i < 10; i++) {
        set.push({C: i + 15});
        br++;
    }
    return set;
}

/*
let set = napraviSet(60);
console.log(set);
console.log(emaProblema(35, set));
*/

// ema strat


function emaStrat(portfolio, emaPresjekDva) {

}