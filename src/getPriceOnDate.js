import axios from 'axios';
//Get  the price of ETH from CoinGecko for a specific date

export default async function getPriceOnDate(date, coinID) {
    // A utility function used to fetch price from an API. Take a url as an argument.
    // takes an array of dates in the format of YYYY-MM-DD and returns an array of price objects

    if (!date) return [];
    let priceHistory = [];
    let appUrl = process.env.REACT_APP_COINGECKO_URL
    let apiEndpoint = appUrl + "/api/v3"
    let apikey = process.env.REACT_APP_COINGECKO_KEY
    let node_action = "/coins/" + coinID + "/history";
    // fix the date format to be DD-MM-YYYY for coingecko API.

    let lookupDate = date.split('-').reverse().join('-'); // Reformatting the date to DD-MM-YYYY
    let priceUrl = (apiEndpoint + node_action + "?date=" + lookupDate + "?x_cg_demo_api_key=" + apikey)
    const maxRetries = 5;
    const delay = 1500; // Delay in milliseconds
    for (let i = 0; i < maxRetries; i++) {
        try {
            let price = await axios(priceUrl);
            let price_usd = price.data.market_data.current_price.usd;
            return price_usd;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('Rate limit hit, retrying...');
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error; // If the error is not a 429, re-throw it
            }
        }
    }

    throw new Error('Failed to fetch price after retries');
};