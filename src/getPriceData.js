import axios from 'axios';
//Get  the price of ETH from CoinGecko for the days of the deposit
const Bottleneck = require('bottleneck');
// Create a new limiter that allows 1 request per second
const limiter = new Bottleneck({
  minTime: 50, // 1 request per 1000ms
})
export default async function getPriceData(dateArray) {
  // A utility function used to fetch price from an API. Take a url as an argument.
  // takes an array of dates in the format of YYYY-MM-DD and returns an array of price objects
  if (dateArray.length === 0) return [];
  let priceHistory = [];
  let appUrl = process.env.REACT_APP_COINGECKO_URL
  let apiEndpoint = appUrl + "/api/v3"
  let apikey = process.env.REACT_APP_COINGECKO_KEY
  let node_action = "/coins/ethereum/history";
  // fix the date format to be DD-MM-YYYY for coingecko API.
  priceHistory = dateArray.map(async item => {
    let lookupDate = item.split('-').reverse().join('-'); // Reformatting the date to DD-MM-YYYY
    let priceUrl = (apiEndpoint + node_action + "?date=" + lookupDate + "?x_cg_demo_api_key=" + apikey)
    try {
      let payouts = [];
      payouts = await limiter.schedule(() => axios(priceUrl));
      //payouts = await axios(priceUrl);
      let date = item
      let price_usd = payouts.data.market_data.current_price.usd;
      return { date, price_usd };

    } catch (error) {
      console.log("Error setting the historical price:", error);
    }
  }); // end of map
  try {
    priceHistory = await Promise.all(priceHistory);
    return priceHistory;
  } catch (error) {
    console.error("Error resolving ethPriceHistory:", error);
  }
};