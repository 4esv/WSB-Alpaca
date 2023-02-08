// Imports
const Alpaca = require("@alpacahq/alpaca-trade-api");
const https = require('https');

// API Options
const options = {
    keyId: "secrets.ALPACA_KEY",
    secretKey: "secrets.ALPACA_SECRET",
    paper: true,
  };

const alpaca = new Alpaca(options);

// Acquire, format, display and act on data

let orders = []

https.get('https://tradestie.com/api/v1/apps/reddit', res => {
  let data = [];
  const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
  console.log('Status Code:', res.statusCode);
  console.log('Date in Response header:', headerDate);

  res.on('data', chunk => {
    data.push(chunk);
  });

  res.on('end', () => {
    console.log('Response ended: ');
    const stocks = JSON.parse(Buffer.concat(data).toString());

    for(stock of stocks) {

        if (stock.sentiment == "Bullish" && stock.no_of_comments > 10) {
            console.log(`$${stock.ticker} is Bullish with a score of ${stock.sentiment_score}`)
            orders.push({ symbol: `${stock.ticker}`, qty: Math.ceil(10 * stock.sentiment_score), side: "buy", type: "market", time_in_force: "gtc", })
        }
        
    };
    console.table(orders);
    for(item of orders){
        alpaca.createOrder(item).then((order) => { console.log("Order details: ", order); });
    };

  });
}).on('error', err => {
  console.log('Error: ', err.message);
});
