// Desc: This hook will calculate the IRR of a given set of cash flows.
import { convertRate, xirr } from 'node-irr';
import axios, { all } from 'axios';
import _ from "lodash";

export function calcMinipoolAPRs(depositsAndWithdrawals) {
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


  //combine the despots and withdrawls into a single array for the IRR calculation
  totalArray = formatArray(depositsAndWithdrawals);
  //totalArray.sort() //make sure they are sorted by date
  totalArray = _.sortBy(totalArray, function (item) {
    return new Date(item.date);
  });
  //finc the minipool indices...
  // write the code that creates an array containg unique ValidatorIndex values in totalArray
  const uniqueValidatorIndexes = [...new Set(totalArray.map(item => item.validatorIndex))];
  // don't think I need this since I saved the list of validators in the from the node API
  //filter the array for each minipool and calculate the IRR
  const minipoolAPRs = []
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
    if (sum > 0) { sum = sum - 32000000000 } //back out the 32 eth deposit
    let apr = ((-1) * (365 / days) * sum / 320000000).toFixed(3);
    minipoolAPRs.push({ minipool: minipool, days: days, apr: apr });
  });

  return { minipoolAPRs };
}

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
    //       "day": 1155,
    //        "day_end": "2024-01-31T12:00:23Z",
    //        "day_start": "2024-01-30T12:00:23Z",
    var depositsAndWithdrawals = payouts.data.data.map(item => ({
      day: item.day, // The day in the life of the chain
      date: item.day_start, // day of the deposit or withdrawl. Don't reformat this date needed as Date later
      deposits: item.deposits,
      withdrawals: item.withdrawals,
      deposits_amount: item.deposits_amount,
      withdrawals_amount: item.withdrawals_amount,
      validatorIndex: validatorIndex,
      price: ""
    })).filter(item => item.deposits_amount > 0 || item.withdrawals_amount > 0);
    // Add the price field to each item in the depositsAndWithdrawals array
    depositsAndWithdrawals = await Promise.all(depositsAndWithdrawals.map(async item => {
      if (item.deposits_amount > 0) {
        const lookupDate = item.date.split('T')[0]; //need to format the date for the API
        const priceData = await fetchPriceData(lookupDate);
        item.eth_price = priceData.price;
      }
      return item;
    }));
    return depositsAndWithdrawals;
  } catch (error) {
    console.log("Axios Error on Deposit Fetch:", error);
  }
};
//Get  the price of ETH from CoinGecko for the days of the deposit
export async function fetchPriceData(date) {
  // A utility function used to fetch price from an API. Take a url as an argument.

  let appUrl = process.env.REACT_APP_COINGECKO_URL
  let apiEndpoint = appUrl + "/api/v3"
  let apikey = process.env.REACT_APP_COINGECKO_KEY
  let node_action = "/coins/ethereum/history";
  // fix the date format to be DD-MM-YYYY for coingecko API.
  date = date.split('-').reverse().join('-'); // Reformatting the date to DD-MM-YYYY
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

function formatArray(array) {
  return (array || []).map(function (element) {

    // currently accepted formats for strings:
    // YYYYMMDD, YYYY-MM-DD, YYYY/MM/DD
    ///const originalDate = element.day;
    //const reformattedDate = originalDate.split('T')[0];
    const dateObject = new Date(element.day);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const day = String(dateObject.getDate()).padStart(2, '0');

    const reformattedDate = `${year}-${month}-${day}`;
    const dailyFlow = element.deposits_amount - element.withdrawals_amount;
    return { validatorIndex: element.validatorIndex, amount: dailyFlow, date: reformattedDate };
  });
}
