import axios from 'axios';
//Get  the price of ETH from CoinGecko for the days of the deposit
export default async function getPriceData(dateArray) {
  // A utility function used to fetch price from an API. Take a url as an argument.
  // takes an array of date in the format of YYYY-MM-DD and returns an array of price objects
  let priceHistory = [];
  let appUrl = process.env.REACT_APP_COINGECKO_URL
  let apiEndpoint = appUrl + "/api/v3"
  let apikey = process.env.REACT_APP_COINGECKO_KEY
  let node_action = "/coins/ethereum/history";
  // fix the date format to be DD-MM-YYYY for coingecko API.
  priceHistory = dateArray.map(async item => { 
    let lookupDate = item.date.split('-').reverse().join('-'); // Reformatting the date to DD-MM-YYYY
    let priceUrl = (apiEndpoint + node_action + "?date=" + lookupDate + "?x_cg_demo_api_key=" + apikey)
    try {

      let payouts = await axios(priceUrl);
      item.date = item
      item.price_usd = payouts.data.market_data.current_price.usd;
      priceHistory.push(item);
    } catch (error) {
      console.log("Error setting the historical price:", error);
    }
  }); return priceHistory;
};