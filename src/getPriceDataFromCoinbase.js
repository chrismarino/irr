import axios from 'axios';
//Get  the price of ETH from CoinGecko for the days of the deposit
const Bottleneck = require('bottleneck');
// Create a new limiter that allows 1 request per second
const limiter = new Bottleneck({
  minTime: 100, // 1 request per 1000ms
})
// URL form for the API
//https://api.coinbase.com/v2/prices/ETH-USD/spot?date=2023-08-31
export default async function getPriceDataFromCoinbase(dateArray) {
  // A utility function used to fetch price from an API. Take a url as an argument.
  // takes an array of dates in the format of YYYY-MM-DD and returns an array of price objects
  if (dateArray.length === 0) return [];
  let priceHistory = [];
  let appUrl = process.env.REACT_APP_COINBASE_URL
  let apiEndpoint = appUrl + "/v2"
  let apikey = process.env.REACT_APP_COINBASE_KEY
  let node_action = "/prices/ETH-USD/spot?date=";
  // fix the date format to be DD-MM-YYYY for coingecko API.
  priceHistory = dateArray.map(async item => { 
    //let lookupDate = item.split('-').reverse().join('-'); // Reformatting the date to DD-MM-YYYY (coingecko format)
    let priceUrl = (apiEndpoint + node_action + item)
    try {
      let payouts = [];
      payouts = await limiter.schedule(() => axios(priceUrl));
      //payouts = await axios(priceUrl);
      let date = item
      let price_usd = payouts.data.data.amount;
      const price = { date, price_usd };
      priceHistory.push(price);
    } catch (error) {
      console.log("Error setting the historical price:", error);
    }
  }); return priceHistory;
};