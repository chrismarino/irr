// New fetchDeposit function that uses the validator stats API endpoint
import axios from 'axios';
import getPriceData from "./getPriceData";
export default async function getValidatorStats(validatorIndex) {

  // A utility function used to fetch the deposits and withdrawl history from an API. Take a url as an argument.
  let status = true;
  let appUrl = process.env.REACT_APP_BEACONCHAIN_URL
  let apiEndpoint = appUrl + "/api/v1"
  let apikey = process.env.REACT_APP_BEACONCHAIN_KEY
  let node_action = "/validator/stats/";

  let statsUrl = (apiEndpoint + node_action + validatorIndex + "?apikey=" + apikey)
  try {
    let payouts = [];
    payouts = await axios(statsUrl);
    var nodeDepositsAndWithdrawals = payouts.data.data.map(item => ({
      day: item.day, // The day in the life of the chain
      date: item.day_start, // day of the deposit or withdrawl. Don't reformat this date needed as Date later
      deposits: item.deposits,
      withdrawals: item.withdrawals,
      deposits_amount: item.deposits_amount,
      withdrawals_amount: item.withdrawals_amount,
      validatorIndex: validatorIndex,
      eth_price: "",
      fiat_amount: 0,
      status: true
    })).filter(item => item.deposits_amount > 0 || item.withdrawals_amount > 0);
    // Set the minipool status to false if the minipool has exited. Do this before another async call.
     nodeDepositsAndWithdrawals = nodeDepositsAndWithdrawals.map(item => {
       if (item.withdrawals_amount === 32000000000) {
        status = false; // set the status for this minipool to false
         return { ...item, status: false }; //set it in the data array as well.
       } else {
         return item;
       }
    });
    // Add the price field to each item in the nodeDepositsAndWithdrawals array
    nodeDepositsAndWithdrawals = await Promise.all(nodeDepositsAndWithdrawals.map(async item => {
      if (item.deposits_amount > 0) {
        const lookupDate = item.date.split('T')[0]; //need to format the date for the API
        const priceData = await getPriceData(lookupDate); //include the historical price of ETH at time of deposit
        item.eth_price = priceData.price_usd;
        item.fiat_amount = (item.deposits_amount * item.eth_price)/1000000000; //scale the amount to gwei
      }
      return item; //return the item unchanged if no deposit
    }));
    console.log("Node Deposits and Withdrawals:", nodeDepositsAndWithdrawals, "Status:", status);
    return { nodeDepositsAndWithdrawals, status };
  } catch (error) {
    console.log("Axios Error on Deposit Fetch:", error);
  }
};