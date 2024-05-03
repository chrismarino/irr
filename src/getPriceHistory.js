import axios from 'axios'; 
//Get the historical prices from Coinbase public API
// https://api.coinbase.com/v2/prices/ETH-USD/historic?start=1641024000&end=1643659200
// https://api.pro.coinbase.com/products/BTC-USD/candles?start=2018-07-10T12:00:00&end=2018-07-15T12:00:00&granularity=86400

export default async function getPriceHistory(startDate, coinID) {
    // A utility function used to fetch price from an API. Take a url as an argument.
    // takes an array of dates in the format of YYYY-MM-DD and returns an array of price objects

    if (!startDate) return [];
    let oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    let currentDateTimestamp = new Date();
    let startDateTimestamp = new Date(startDate); // assuming startDate is a string
    let days = Math.round(Math.abs((currentDateTimestamp - startDateTimestamp) / oneDay));
    //let appUrl = process.env.REACT_APP_COINBASE_URL
    let appUrl = "https://api.pro.coinbase.com"
    let apiEndpoint = appUrl + "/products"
    let node_action = "/ETH-USD/candles?start=";
    let granularity = "&granularity=" + 86400; // 1 day
    //let apikey = process.env.REACT_APP_COINBASE_KEY
    if (coinID !== "ethereum") {
        node_action = "/RPL-USD/candles?start=";
    }

    let priceUrlArray = [];
    let daysPerFetch = 250;
    let fetches = Math.ceil(days / daysPerFetch);
    startDateTimestamp = currentDateTimestamp;
    let endDateTimestamp = startDateTimestamp - (daysPerFetch * oneDay);

    for (let i = 0; i < fetches; i++) {
        startDateTimestamp = startDateTimestamp - (daysPerFetch * oneDay * i);
        endDateTimestamp = endDateTimestamp - (daysPerFetch * oneDay * i);

        let newStartDate = new Date(startDateTimestamp).toISOString().slice(0, 10);
        let newEnddDate = new Date(endDateTimestamp).toISOString().slice(0, 10);
// Get the price at 12:00:00
        let newPriceUrl = apiEndpoint + node_action + newEnddDate + "T12:00:00&end=" + newStartDate + "T12:00:00" + granularity;
        priceUrlArray.push(newPriceUrl);
    }
    //{
    //     "candles": {
    //       "start": "1639508050",
    //       "low": "140.21",
    //       "high": "140.21",
    //       "open": "140.21",
    //       "close": "140.21",
    //       "volume": "56437345"
    //     }
    //   }
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
        try {
            let allPriceHistories = [];

            allPriceHistories = await Promise.all(priceUrlArray.map(async (priceUrl) => {
                let price = await axios(priceUrl);
                //console.log("Getting Another Price History chuck out of:" , priceUrlArray.length);
                let priceHistory = price.data.map((price) => {
                    let date = new Date(price[0] * 1000).toISOString().slice(0, 10);
                    let price_usd = (price[2] + price[3]) / 2  // average of high and low price;
                    return { date, price_usd };
                });
                return priceHistory;
            }));
            allPriceHistories = [].concat(...allPriceHistories); // flatten the array

            return allPriceHistories;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('Hit rate limit, retrying. Date:', startDate, "CoinID:", coinID);
            } else {
                throw error; // If the error is not a 429, re-throw it
            }
        }
    }

    throw new Error('Failed to fetch price after retries');
};

// let ethPrices = await getPriceHistory("2023-01-01", "ethereum");
// let rplPrices = await getPriceHistory("2023-01-01", "rpl");
// console.log("Eth prices from 2024-01-01:" , ethPrices);
// let lastChristmas = ethPrices.find(price => price.date === "2023-12-25");
// let lastNewYear = rplPrices.find(price => price.date === "2023-01-01");
// console.log("ETH price on Christmas 2024:", lastChristmas.price);
// console.log("Rpl prices from 2024-01-01:" , lastNewYear.price);