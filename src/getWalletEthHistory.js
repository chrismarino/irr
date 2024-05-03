import axios from 'axios';
export default async function getWalletEthHistory(address, ethPriceHistory) {
  if(ethPriceHistory.length < 2 ) {return []};  //Don't fetch the history if the price history is empty
  // A utility function used to fetch deposits and withdrawals from a wallet address. Take a url as an argument.
  // takes an array of dates in the format of YYYY-MM-DD and returns an array of price objects

  // https://api.etherscan.io/api?module=account&action=txlist&address=0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=YourApiKeyToken
  // https://api.etherscan.io/api?module=account&action=txlist&address=0xfc49f773756eabb2680fd505916c2a93b65b465b&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=SXQC9UWX4J4CHGDX3V4HJ7YXHSCI7QTY2U
  // Need to throttle the requests to coingecko
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
  if (!isValidAddress) {
    console.log("Invalid address in getWalletEthHistory");
    return [];
  }
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  if (address === undefined) return [];
  let coinID = "ethereum";
  let deposits = [];
  let withdrawals = [];
  let appUrl = process.env.REACT_APP_ETHERSCAN_URL
  let actionTxList = "/api?module=account&action=txlist" // Get the transactions
  let actionTxListInternal = "/api?module=account&action=txlistinternal" // Need internal trasactions for as well
  let apikey = process.env.REACT_APP_ETHERSCAN_KEY
  let historyListTxURL = (appUrl + actionTxList + "&address=" + address + "&startblock=0&endblock=99999999&sort=asc&apikey=" + apikey)
  let historyListInternalURL = (appUrl + actionTxListInternal + "&address=" + address + "&startblock=0&endblock=99999999&sort=asc&apikey=" + apikey)
  try {
    let history = [];
    let responseTx;
    try {
      responseTx = await axios(historyListTxURL);
      // Handle the response or do something with the response here...
    } catch (error) {
      console.error(`Failed to fetch Eth history from Etherscan: ${error}`);
      // Handle the error or do something with the error here...
    }
    let responseInternalTx = await axios(historyListInternalURL);
    const result1 = await responseTx.data.result
    const result2 = await responseInternalTx.data.result;
    history = await Promise.all(result1.concat(result2));
    //console.log("Wallet Eth Tx History Response:", historyListTxURL, responseTx.data.result);
    //find the deposits to the wallet address

    deposits = await Promise.all(history
      .filter(transaction => transaction.to.toLowerCase() === address.toLowerCase() && Number(transaction.value) > 0)
      .map(async transaction => {
        let date = new Date(transaction.timeStamp * 1000);
        let formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        // Need YYYY-MM-DD format for getPriceOnDate
        //let price_usd = await limiter.schedule(() => getPriceOnDate(formattedDate, coinID));
        let price_usd = ethPriceHistory.find(price => price.date === formattedDate)?.price_usd;
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
        //let price_usd = await limiter.schedule(() => getPriceOnDate(formattedDate, coinID));
        let price_usd = ethPriceHistory.find(price => price.date === formattedDate)?.price_usd;
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
    console.log("Error setting the wallet Eth history:", deposits, withdrawals, "Error Message:", error);
    return error;
  }


};