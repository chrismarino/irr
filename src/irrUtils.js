// Desc: This hook will calculate the IRR of a given set of cash flows.
import { convertRate, xirr } from 'node-irr';
import axios, { all } from 'axios';
import { formatArray } from './irrUtils'; // Import the formatArray function
import _ from "lodash";

export function calcMinipoolIrr(depositsAndWithdrawals) {
  // A utility function used to calculate the irr of a given set of in and out cash flows from a 
  // set of minipools. It takes 
  // a depositArray for deposits into the minipool, including both the node operators and the protocol's. 
  // The withdrawlArray requires the same feils and  includes only periodic execution layer rewards.
  // and the repayment of the deposit. Input arrays are objects 
  // with 'ValidatorIndex' field, an 'amount' feild as well as a 'timestamp' field. It returns an object with the irr and days.
  // It returns an object with the irr and days.
  // paymentArray is not actually an Array, but an Object that incldues a 'amount' feild as well as a
  // 'timestamp' field. It returns 
  // an annay of day counts and irr per minpool. paymentArray is typically the result of a query to the etherscan API.
  var totalArray = [];

  function formatArray(array) {
    return (array || []).map(function (element) {
      const originalDate = element.day;
      const reformattedDate = originalDate.split('T')[0];
      const dailyFlow = element.deposits_amount - element.withdrawals_amount;
      return { validatorIndex: element.validatorIndex, amount: dailyFlow, date: reformattedDate };
    });
  }
  //combine the despots and withdrawls into a single array for the IRR calculation
  totalArray = formatArray(depositsAndWithdrawals);
  //totalArray.sort() //make sure they are sorted by date
  totalArray = _.sortBy(totalArray, function(item) {
    return new Date(item.date);
  });
  //finc the minipool indices...
  // write the code that creates an array containg unique ValidatorIndex values in totalArray
  const uniqueValidatorIndexes = [...new Set(totalArray.map(item => item.validatorIndex))];
 // don't think I need this since I saved the list of validators in the from the node API
  //filter the array for each minipool and calculate the IRR
  const minipoolIrrs = []
  //Failed attempt to use lodash to filter the array for each minipool and calculate the IRR
  //let uniq = _.uniqBy(totalArray, 'validatorIndex');
  //uniq.forEach(minipool => {
  uniqueValidatorIndexes.forEach(minipool => {
    const filteredArray = totalArray.filter(item => item.validatorIndex === minipool);
    let dailyRate = xirr(filteredArray).rate;
    let days = xirr(filteredArray).days;
    // I actually want the APR, need to refactor...
    //let irr = convertRate(dailyRate, "year");
    let sum = _.sumBy(filteredArray, 'amount');
    if (sum > 0) { sum = sum - 32000000000} //back out the 32 eth deposit
    let apr = ((-1)*(365/days)* sum / 320000000).toFixed(3);
    let irr = apr // will need to refactor this to use the xirr function

    minipoolIrrs.push({ minipool: minipool, days: days, irr: irr });
  });

  return { minipoolIrrs };
}

export async function fetchWithdrawls(address) {
  // A utility function used to fetch the withdrawls from the ethscan API. Take a url as an argument.
  // Note: Probably should this to take minipool address as an argument.
  let appUrl = process.env.REACT_APP_ETHERSCAN_URL
  let apikey = process.env.REACT_APP_ETHERSCAN_KEY
  let apiEndpoint = appUrl + "api?"
  let module = "module=account&";
  let action = "action=txsBeaconWithdrawal&";
  let startblock = "startblock=0&";
  let endblock = "endblock=99999999&";
  let page = "page=1&";
  let offset = "offset=100&";
  let sort = "sort=asc&";
  let withdrawalUrl = (apiEndpoint + module + action + address + startblock + endblock + page + offset + sort + "apikey=" + apikey)

  try {
    let payouts = [];
    payouts = await axios(withdrawalUrl);
    return payouts.data.result;
  } catch (error) {
    console.log("Axios Error on Withdrawls Fetch:", error);
  }
};

export async function oldFetchDeposits(index) {
  // A utility function used to fetch the deposits and withdrawls from an API. Take a url as an argument.

  // the deposit url using the beaconcha.in API
  let appUrl = process.env.REACT_APP_BEACONCHAIN_URL
  let apiEndpoint = appUrl + "api/v1/validator/"
  let apikey = process.env.REACT_APP_BEACONCHAIN_KEY
  let deposit_action = "/deposits?";

  let depositlUrl = (apiEndpoint + index + deposit_action + "apikey=" + apikey)
  try {
    let payouts = [];
    payouts = await axios(depositlUrl);
    // map the deposits to the same format as the withdrawls (beasoncha.in API returns a different format)
    const renamedPayouts = payouts.data.data.map(item => ({
      timestamp: item.block_ts, //change the timestamp field
      amount: item.amount, //leave the other fields the same
      validatorIndex: index //add the validatorIndex field

    }));
    return renamedPayouts;
    //return payouts.data;
  } catch (error) {
    console.log("Axios Error on Deposit Fetch:", error);
  }
};
export async function fetchValidators(ethAddress) {
  // Fetch validator list from Beaconcha.in using eth1 address. 
  // Response includes a record for each validator. 
  // This should be updated whenever the Node address feild is changed on the page. Save this array as `nodeValidators`
  let appUrl = process.env.REACT_APP_BEACONCHAIN_URL
  let apiEndpoint = appUrl + "api/v1"
  let apikey = process.env.REACT_APP_BEACONCHAIN_KEY
  let node_action = "/validator/eth1/";

  let nodeUrl = (apiEndpoint + node_action + ethAddress + "?apikey=" + apikey)
  try {
    let nodeValidators = [];

    nodeValidators = await axios(nodeUrl);
    // map the deposits to the same format as the withdrawls (beasoncha.in API returns a different format)
    const validators = nodeValidators.data.data;
    return validators;
  } catch (error) {
    console.log("Axios Error on Node Detail Fetch:", error);
  }
};

// New fetchDeposit function that uses the validator stats API endpoint
export async function fetchMinipoolData(validatorIndex) {
  // A utility function used to fetch the deposits and withdrawls from an API. Take a url as an argument.

  let appUrl = process.env.REACT_APP_BEACONCHAIN_URL
  let apiEndpoint = appUrl + "api/v1"
  let apikey = process.env.REACT_APP_BEACONCHAIN_KEY
  let node_action = "/validator/stats/";

  let statsUrl = (apiEndpoint + node_action + validatorIndex + "?apikey=" + apikey)
  try {
    let payouts = [];
    payouts = await axios(statsUrl);
    // map the deposits to the same format as the withdrawls (beasoncha.in API returns a different format)
    const depositsAndWithdrawals = payouts.data.data.map(item => ({
      day: item.day_start, 
      deposits: item.deposits,
      withdrawals: item.withdrawals,
      deposits_amount: item.deposits_amount,
      withdrawals_amount: item.withdrawals_amount,
      validatorIndex: validatorIndex
    })).filter(item => item.deposits_amount > 0 || item.withdrawals_amount > 0); 
    let price = await fetchPriceData("01-06-2023"); // Fetch the price asynchronously
    // Add the price field to each item in the depositsAndWithdrawals array
    depositsAndWithdrawals.forEach(item => {
      item.price = price;
    });
    return depositsAndWithdrawals;
  } catch (error) {
    console.log("Axios Error on Deposit Fetch:", error);
  }
};
//Get  the price of ETH from CoinGecko for the days of the deposit
export async function fetchPriceData(date) {
  // A utility function used to fetch the deposits and withdrawls from an API. Take a url as an argument.

  let appUrl = process.env.REACT_APP_COINGECKO_URL
  let apiEndpoint = appUrl + "/api/v3"
  let apikey = process.env.REACT_APP_COINGECKO_KEY
  let node_action = "/coins/ethereum/history";
  let priceUrl = (apiEndpoint + node_action + "?date=" + date + "?x_cg_demo_api_key=" + apikey)
  try {
    let price = [];
    let payouts = await axios(priceUrl);
    price.date = date
    price.price_usd = payouts.data.market_data.current_price.usd;
    return price;
  } catch (error) {
    console.log("Error setting the price:", error);
  }
};

