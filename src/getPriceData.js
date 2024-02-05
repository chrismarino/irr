import axios  from 'axios';
//Get  the price of ETH from CoinGecko for the days of the deposit
export default async function getPriceData(date) {
  // A utility function used to fetch price from an API. Take a url as an argument.
  // if 'date' = '' then use the current time price API

  let appUrl = process.env.REACT_APP_COINGECKO_URL
  let apiEndpoint = appUrl + "/api/v3"
  let apikey = process.env.REACT_APP_COINGECKO_KEY
  let node_action = "/coins/ethereum/history";
  // fix the date format to be DD-MM-YYYY for coingecko API.
  date = date.split('-').reverse().join('-'); // Reformatting the date to DD-MM-YYYY
  let priceUrl = (apiEndpoint + node_action + "?date=" + date + "?x_cg_demo_api_key=" + apikey)

  if (date === "") {
    // url shuld be 
    //https://api.coingecko.com/api/v3simple/price?ids=ethereum&vs_currencies=usd&precision=full?x_cg_demo_api_key=CG-YufuxVfD5JK12tvvrXh7sF3f
    // adding rpl to the ids returns the price of rpl as well
    let node_action = "/simple/price?ids=ethereum,rocket-pool&vs_currencies=usd&precision=full";
    let priceUrl = (apiEndpoint + node_action + "?x_cg_demo_api_key=" + apikey)
    try {
      let price = [];
      let payouts = await axios(priceUrl);
      price.date = "now"
      price.eth_price_usd = payouts.data.ethereum.usd;
      price.rpl_price_usd = payouts.data['rocket-pool'].usd;
      return price;
    } catch (error) {
      console.log("Error setting the current price:", error);
    }
  } else {
    try {
      let price = [];
      let payouts = await axios(priceUrl);
      price.date = date
      price.price_usd = payouts.data.market_data.current_price.usd;
      return price;
    } catch (error) {
      console.log("Error setting the historical price:", error);
    }
  }
};