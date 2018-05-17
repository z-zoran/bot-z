const Binance = require('binance-api-node').default;

const client = new Binance();
const clientETHBTC = new Binance();
const clientBTCUSD = new Binance();
const clientETHUSD = new Binance();

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
(async () => {
  console.log(await client.candles({ symbol: 'ETHBTC', startTime: 1526569860000 }));
})();

if (a)
