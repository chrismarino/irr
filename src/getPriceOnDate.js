import axios from 'axios';
//Get  the price of ETH from CoinGecko for a specific date

export default async function getPriceOnDate(date, coinID) {
    // A utility function used to fetch price from an API. Take a url as an argument.
    // takes an array of dates in the format of YYYY-MM-DD and returns an array of price objects

    if (!date) return [];
    //let appUrl = process.env.REACT_APP_COINBASE_URL
    let appUrl ="https://api.coinbase.com"
    let apiEndpoint = appUrl + "/v2"
    let node_action = "/prices/ETH-USD/spot?date="
    //let apikey = process.env.REACT_APP_COINBASE_KEY
    if (coinID !== "ethereum") {
        node_action = "/prices/RPL-USD/spot?date=";
    }
// Don't need to reformat the date to DD-MM-YYYY for CoinBase API
    //let lookupDate = date.split('-').reverse().join('-'); // Reformatting the date to DD-MM-YYYY
    let priceUrl = (apiEndpoint + node_action + date)
    const maxRetries = 5;
    const delay = 250; // Delay in milliseconds
    for (let i = 0; i < maxRetries; i++) {
        try {
            let price = await axios(priceUrl);
            let price_usd = price.data.data.amount;
            return price_usd;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('Hit rate limit, retrying in', delay, 'ms. Date:', date, "CoinID:", coinID);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error; // If the error is not a 429, re-throw it
            }
        }
    }

    throw new Error('Failed to fetch price after retries');
};