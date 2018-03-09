let limitData = {};
limitData.market = 'eth-btc';

let base = limitData.market.split('-')[0];
let quote = limitData.market.split('-')[1];

console.log(limitData);
console.log(limitData.market);
console.log(base);
console.log(quote);