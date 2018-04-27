"use strict";

const ccxt = require('ccxt');

let gdaxTest = new ccxt.gdax();
gdaxTest.urls = {
    api: 'https://api-public.sandbox.gdax.com'
}
gdaxTest.apiKey = '7993d522db71c00daf48bbabe2296523';
gdaxTest.secret = 'zwI0ILHWxS02fQOOrdltmuDjuASgW7354kC7oNLT0j/4GERB9tt0785P2ptszU8B4tYCYjrtD20oG7wsFYwimQ==';
gdaxTest.password = 'frazablablatrebamizbogapija';
//gdaxTest.verbose = true;


(async () => {
    let markets = await gdaxTest.loadMarkets();
    // console.log(await gdaxTest.createMarketBuyOrder ('ETH/EUR', 5));
    //console.log(await gdaxTest.createLimitBuyOrder ('ETH/EUR', 5, 180));
    //console.log(await gdaxTest.fetchMyTrades());
    let trejdovi = await gdaxTest.fetchTrades('ETH/EUR');
    console.log(trejdovi);
}) ();

