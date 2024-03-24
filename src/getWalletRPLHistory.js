import axios from 'axios';
import getPriceOnDate from './getPriceOnDate';
export default async function getWalletRPLHistory(address) {
    // A utility function used to fetch deposits and withdrawals from a wallet address. Take a url as an argument.
    // takes an array of dates in the format of YYYY-MM-DD and returns an array of price objects

    // https://api.etherscan.io/api?module=account&action=txlist&address=0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=YourApiKeyToken
    // https://api.etherscan.io/api?module=account&action=txlist&address=0xfc49f773756eabb2680fd505916c2a93b65b465b&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=SXQC9UWX4J4CHGDX3V4HJ7YXHSCI7QTY2U
    if( address === undefined) return "Address or CoinID is undefined";
    let coinID = "rocket-pool";
    let deposits = [];
    let appUrl = process.env.REACT_APP_ETHERSCAN_URL
    let action = "/api?module=account&action=tokentx"
    let apiEndpoint = appUrl + action
    let apikey = process.env.REACT_APP_ETHERSCAN_KEY
    let historyURL = (apiEndpoint + "&address=" + address + "&startblock=0&endblock=99999999&sort=asc&apikey=" + apikey)
    try {
        let history = [];
        let response = await axios(historyURL);
        //console.log("Wallet RPL History Response:", historyURL, response.data.result);
        history = response.data.result;
        //find the deposits to the wallet address
        deposits = await Promise.all(history
            .filter(transaction => transaction.to.toLowerCase() === address.toLowerCase() && Number(transaction.value) > 0 && (transaction.tokenSymbol === "RPL"))
            .map(async transaction => {
                let date = new Date(transaction.timeStamp * 1000);
                let formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                // Need YYYY-MM-DD format for getPriceOnDate
                let price_usd = await getPriceOnDate(formattedDate, coinID);
                return {
                    coin: coinID,
                    date: formattedDate,
                    amount: Number(transaction.value),
                    price_usd: price_usd,
                    from: transaction.from,
                    to: transaction.to
                };
            }));
        let withdrawals = await Promise.all(history
            .filter(transaction => transaction.from.toLowerCase() === address.toLowerCase() && Number(transaction.value) > 0)
            .map(async transaction => {
                let date = new Date(transaction.timeStamp * 1000);
                let formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                // Need YYYY-MM-DD format for getPriceOnDate
                let price_usd = await getPriceOnDate(formattedDate, coinID);
                return {
                    coin: coinID,
                    date: formattedDate,
                    amount: Number(transaction.value),
                    price_usd: price_usd,
                    from: transaction.from,
                    to: transaction.to
                };
            }));

        // console.log("Wallet Deposits:", deposits, "withdrawals", withdrawals );
        return { deposits, withdrawals }
    } catch (error) {
        console.log("Error setting the wallet history:", error);
        return error;
    }


};