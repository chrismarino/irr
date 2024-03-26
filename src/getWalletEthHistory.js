import axios from 'axios';
import getPriceOnDate from './getPriceOnDate';
export default async function getWalletEthHistory(address) {
  // A utility function used to fetch deposits and withdrawals from a wallet address. Take a url as an argument.
  // takes an array of dates in the format of YYYY-MM-DD and returns an array of price objects

  // https://api.etherscan.io/api?module=account&action=txlist&address=0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=YourApiKeyToken
  // https://api.etherscan.io/api?module=account&action=txlist&address=0xfc49f773756eabb2680fd505916c2a93b65b465b&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=SXQC9UWX4J4CHGDX3V4HJ7YXHSCI7QTY2U
  // Need to throttle the requests to coingecko
  const Bottleneck = require('bottleneck');
  // Create a new limiter that allows x request per second
  const limiter = new Bottleneck({
    minTime: 100, // 20 request per 1000ms
  })
  if (address === undefined) return "Address or CoinID is undefined";
  let coinID = "ethereum";
  let deposits = [];
  let appUrl = process.env.REACT_APP_ETHERSCAN_URL
  let actionTxList = "/api?module=account&action=txlist" // Get the transactions
  let actionTxListInternal = "/api?module=account&action=txlistinternal" // Need internal trasactions for as well
  let apikey = process.env.REACT_APP_ETHERSCAN_KEY
  let historyListTxURL = (appUrl + actionTxList + "&address=" + address + "&startblock=0&endblock=99999999&sort=asc&apikey=" + apikey)
  let historyListInternalURL = (appUrl + actionTxListInternal + "&address=" + address + "&startblock=0&endblock=99999999&sort=asc&apikey=" + apikey)
  try {
    let history = [];
    let responseTx = await axios(historyListTxURL);
    let responseInternalTx = await axios(historyListInternalURL);
    //console.log("Wallet Eth Tx History Response:", historyListTxURL, responseTx.data.result);
    //console.log("Wallet Eth Int Tx History Response:", historyListInternalURL, responseInternalTx.data.result);
    history = responseTx.data.result.concat(responseInternalTx.data.result);
    //find the deposits to the wallet address
    if (coinID === "ethereum") {
      deposits = await Promise.all(history
        .filter(transaction => transaction.to.toLowerCase() === address.toLowerCase() && Number(transaction.value) > 0)
        .map(async transaction => {
          let date = new Date(transaction.timeStamp * 1000);
          let formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
          // Need YYYY-MM-DD format for getPriceOnDate
          let price_usd = await limiter.schedule(() => getPriceOnDate(formattedDate, coinID));
          return {
            coin: coinID,
            date: formattedDate,
            amount: Number(transaction.value),
            price_usd: price_usd,
            from: transaction.from,
            to: transaction.to
          };
        }));
    };

    let withdrawals = await Promise.all(history
      .filter(transaction => transaction.from.toLowerCase() === address.toLowerCase() && Number(transaction.value) > 0)
      .map(async transaction => {
        let date = new Date(transaction.timeStamp * 1000);
        let formattedDate = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
        // Need YYYY-MM-DD format for getPriceOnDate
        let price_usd = await limiter.schedule(() => getPriceOnDate(formattedDate, coinID));
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
    console.log("Error setting the wallet Eth history:", error);
    return error;
  }


};