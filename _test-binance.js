const Binance = require('binance-api-node').default;

const client = new Binance();
/*
(async () => {
  let info = await client.exchangeInfo();
  info.symbols.map(symbol => {
    if (symbol.quoteAsset === 'EUR') console.log(symbol);
  })
})();
*/

/*
client.ws.candles(['ETHBTC', 'BTCUSDT', 'ETHUSDT'], '1m', candle => {
  if (candle.isFinal) console.log(candle.symbol + ' ' + new Date(candle.closeTime + 1) + ' ' + candle.close + ' ' + candle.volume);
});
*/
const trio = {
  'ETHBTC': null,
  'BTCUSDT': null,
  'ETHUSDT': null,
  
}
client.ws.ticker(['ETHBTC', 'BTCUSDT', 'ETHUSDT'], ticker => {
  trio[ticker.symbol] = ticker;
  console.clear();

  for (let i in trio) {
    if (trio[i]) console.log(trio[i].symbol.padEnd(10) + ' ' + trio[i].bestBidQnt.padEnd(10) + ' ' + String(Number(trio[i].bestBid).toFixed(4)).padStart(10) + ' ' + String(Number(trio[i].bestAsk).toFixed(4)).padEnd(10) + ' ' + trio[i].bestAskQnt.padEnd(10));
  }

});

