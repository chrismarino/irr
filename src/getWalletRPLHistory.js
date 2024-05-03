import axios from 'axios';
export default async function getWalletRPLHistory(address, rplPriceHistory) {
    // A utility function used to fetch deposits and withdrawals from a wallet address. Take a url as an argument.
    // takes an array of dates in the format of YYYY-MM-DD and returns an array of price objects

    // https://api.etherscan.io/api?module=account&action=txlist&address=0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=YourApiKeyToken
    // https://api.etherscan.io/api?module=account&action=txlist&address=0xfc49f773756eabb2680fd505916c2a93b65b465b&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=SXQC9UWX4J4CHGDX3V4HJ7YXHSCI7QTY2U
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
    if (!isValidAddress) {
        console.log("Invalid address in getWalletRPLHistory");
        return [];
    }
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    if (address === undefined) return [];
    let coinID = "rocket-pool";
    let deposits = [];
    let withdrawals = [];
    let appUrl = process.env.REACT_APP_ETHERSCAN_URL
    let action = "/api?module=account&action=tokentx"
    let apiEndpoint = appUrl + action
    let apikey = process.env.REACT_APP_ETHERSCAN_KEY
    let historyURL = (apiEndpoint + "&address=" + address + "&startblock=0&endblock=99999999&sort=asc&apikey=" + apikey)
    const maxAttempts = 3;
    let attempts = 0;
    let success = false;
    let history = [];
    let response;
    while (!success && attempts < maxAttempts) {
    try {
        response = await axios(historyURL);
        // Handle the response or do something with the response here...
    } catch (error) {
        console.error(`Failed to fetch RPL history from Etherscan: ${error}`);
        // Handle the error or do something with the error here...
    }
    const result = await response.data.result;
    history = await Promise.all(result);
    success = true;
    //console.log("Wallet RPL History Response:", historyURL, history);
    //find the deposits to the wallet address
    //console.log("RPL History from Etherscan:", history);
    //console.log("RPL History from Etherscan URL:", historyURL);
    if (history[0] === 'M' && history[1] === 'a' && history[2] === 'x') {
        console.log('Etherscan throttled. Attempt:', attempts +1, 'Retrying....');
        history = []; // try to recover....
        success = false;
        await delay(500);
      }
    }
    attempts = 0;
    success = false;
    while (!success && attempts < maxAttempts) {
        try {
            deposits = await Promise.all(history
                .filter(transaction => transaction.to.toLowerCase() === address.toLowerCase() && Number(transaction.value) > 0 && (transaction.tokenSymbol === "RPL"))
                .map(async transaction => {
                    let date = new Date(transaction.timeStamp * 1000);
                    let formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                    // Need YYYY-MM-DD format for getPriceOnDate

                    let price_usd = rplPriceHistory.find(price => price.date === formattedDate)?.price_usd;
                    return {
                        coin: coinID,
                        date: formattedDate,
                        amount: Number(transaction.value),
                        price_usd: price_usd,
                        from: transaction.from,
                        to: transaction.to
                    };
                }));
            withdrawals = await Promise.all(history
                .filter(transaction => transaction.from.toLowerCase() === address.toLowerCase() && Number(transaction.value) > 0)
                .map(async transaction => {
                    let date = new Date(transaction.timeStamp * 1000);
                    let formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                    // Need YYYY-MM-DD format for getPriceOnDate

                    let price_usd = rplPriceHistory.find(price => price.date === formattedDate)?.price_usd;
                    return {
                        coin: coinID,
                        date: formattedDate,
                        amount: Number(transaction.value),
                        price_usd: price_usd,
                        from: transaction.from,
                        to: transaction.to
                    };
                }));
            success = true;
            // console.log("Wallet Deposits:", deposits, "withdrawals", withdrawals );
            return { deposits, withdrawals }
        } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed with error: ${error.message}`);
            if (attempts < maxAttempts) {
                console.log("Error setting the wallet RPL history:", deposits, withdrawals, "Error Message:", error);
                console.log(`Retrying (${attempts}/${maxAttempts})...`);
            } else {
                console.error('Max attempts reached. Operation failed.');
                throw error;
            }
        }

    }
};