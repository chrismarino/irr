// Desc: This hook will calculate the IRR of a given set of cash flows.
import { convertRate, xirr } from 'node-irr';
import axios, { all } from 'axios';
import _ from "lodash";


export function calcMinipoolAPRs(minipools, nodeDepositsAndWithdrawals, ethPriceToday) {
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
  var minipools = minipools;

  //combine the despots and withdrawls into a single array for the IRR calculation
  totalArray = formatArray(nodeDepositsAndWithdrawals);
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

    //minipoolIndexArray.forEach(minipool => {
    const filteredArray = totalArray.filter(item => item.validatorIndex === minipool);
    //const filteredArray = totalArray.filter(item => item.validatorIndex === minipool.validatorIndex);
    //console.log("Unique Validator Indexes:", uniqueValidatorIndexes, "minipoolIndexArray:", minipoolIndexArray, "filteredArray:", filteredArray);
    //let dailyRate = xirr(filteredArray).rate;
    //let days = xirr(filteredArray).days;
    let minDay = _.minBy(filteredArray, 'days').days;
    let maxDay = _.maxBy(filteredArray, 'days').days;
    let days = (maxDay - minDay);
    // I actually want the APR, need to refactor...
    //let irr = convertRate(dailyRate, "year");
    const totalEthDeposited = 32; //need to update to use actual bond amount from LEB8s
    const totalNOEthDeposited = 16;
    const totalProtocolEthDeposited = 16;
    let totalEthEarned = _.sumBy(filteredArray, 'eth_amount'); //total eth earned by the minipool
    let totalFiatDeposited = _.sumBy(filteredArray, 'fiat_amount'); // total fiat deposited by the minipool
    let totalNOFiatDeposited = totalFiatDeposited / 2;
    let totalProtocolFiatDeposited = totalFiatDeposited / 2;
    if (totalEthEarned > 0) { totalEthEarned = totalEthEarned - 32000000000 } //back out the 32 eth deposit
    totalEthEarned = (totalEthEarned / 1000000000)
    const commission = totalEthEarned * .14;
    const protocolEthEarned = (totalEthEarned / 2) - commission; //need to update to use actual bond amount from LEB8s
    const nodeOperatorEthEarned = (totalEthEarned / 2) + commission;
    const totalFiatGain = ((totalEthEarned + totalEthDeposited) * ethPriceToday.eth_price_usd) - totalFiatDeposited;
    // Fiat gains are the eth earned - eth deposited, times the current price of eth
    const protocolFiatGain = ((protocolEthEarned + totalProtocolEthDeposited) * ethPriceToday.eth_price_usd) - totalProtocolFiatDeposited;
    const nodeOperatorFiatGain = ((nodeOperatorEthEarned + totalNOEthDeposited) * ethPriceToday.eth_price_usd) - totalNOFiatDeposited;

    //if (totalFiatDeposited > 0) { totalFiatDeposited = totalFiatDeposited - 32000000000 * 2350 } //back out the 32 eth deposit
    let minipoolIndex = minipools.find(pool => pool.validatorIndex === minipool);
    let status = minipoolIndex.status;
    const eth_apr = ((((-100) * (365 / days) * totalEthEarned)) / totalEthDeposited).toFixed(3);
    const fiat_apr = (((100) * (365 / days) * totalFiatGain) / (totalFiatDeposited)).toFixed(2);
    const no_eth_apr = ((((100) * (365 / days) * nodeOperatorEthEarned)) / totalNOEthDeposited).toFixed(3);
    const p_eth_apr = (((100) * (365 / days) * protocolEthEarned) / (totalProtocolEthDeposited)).toFixed(2);
    const no_fiat_apr = (((100) * (365 / days) * nodeOperatorFiatGain) / (totalFiatDeposited)).toFixed(2);
    const p_fiat_apr = (((100) * (365 / days) * protocolFiatGain) / (totalFiatDeposited)).toFixed(2);
    minipoolAPRs.push({
      minipool: minipool,
      status: status,
      age: days,
      // Overall node results
      eth_earned: (-totalEthEarned.toFixed(5)), //total eth earned by the minipool
      eth_apr: eth_apr,
      fiat_gain: totalFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //Total node's gain
      fiat_apr: fiat_apr,
      //Node Operator results
      no_eth_earned: (-nodeOperatorEthEarned.toFixed(5)), //node operators eth earned
      no_eth_apr: no_eth_apr, //node operator apr
      no_fiat_gain: nodeOperatorFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators gain
      no_fiat_apr: no_fiat_apr, //node operator apr

      // Protocol results
      p_eth_earned: (-protocolEthEarned.toFixed(5)), //protocol eth earned
      p_eth_apr: p_eth_apr, //protocol apr
      p_fiat_gain: protocolFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //protocol gain
      p_fiat_apr: p_fiat_apr //protocol apr in SD

    });
  });

  return { minipoolAPRs };
}
export async function fetchRocketpoolValidatorStats(validatorArray) {
  // Fetch the minipool stats from Beaconcha.in from an arry of validator indexes. Return an array of objects with the
  // Rocketpool values. This should be updated whenever the Node address feild is changed on the page. 
  let appUrl = process.env.REACT_APP_BEACONCHAIN_URL
  let apiEndpoint = appUrl + "api/v1"
  let apikey = process.env.REACT_APP_BEACONCHAIN_KEY
  let node_action = "/rocketpool/validator/";
  // URL https://beaconcha.in/api/v1/rocketpool/validator/983397%2C1101573%2C810338
  let validatorIndexString = validatorArray.map(validator => validator.validatorIndex).join(',');
  // "http://beaconcha.in/api/v1/rocketpool/validator/[object%20Object]%2C[object%20Object]%2C[object%20Object]?apikey=a0ZFaGMxc0FwNTdTZXJaQXdJV3lUd3pHdjNtag"
  let nodeUrl = (apiEndpoint + node_action + validatorIndexString + "?apikey=" + apikey)
  try {
    let rocketpoolValidators = [];

    rocketpoolValidators = await axios(nodeUrl);
    // map the deposits to the same format as the withdrawls (beasoncha.in API returns a different format)
    const validators = rocketpoolValidators.data.data;
    return validators;
  } catch (error) {
    console.log("Axios Error on Rocketpool Validator Stats Fetch:", error);
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
  function isValidEthAddress(ethAddress) {
    const regex = /^0x[a-fA-F0-9]{40}$/;
    return regex.test(ethAddress);
  }
  if (!isValidEthAddress(ethAddress)) {
    return [];
  }
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
export async function fetchValidatorStats(validatorIndex) {
  // A utility function used to fetch the deposits and withdrawl history from an API. Take a url as an argument.
  let status = true;
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
        const priceData = await fetchPriceData(lookupDate);
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
//Get  the price of ETH from CoinGecko for the days of the deposit
export async function fetchPriceData(date) {
  // A utility function used to fetch price from an API. Take a url as an argument.
  // if 'date' = '' then use the current time price API

  let appUrl = process.env.REACT_APP_COINGECKO_URL
  let apiEndpoint = appUrl + "/api/v3"
  let apikey = process.env.REACT_APP_COINGECKO_KEY
  let node_action = "/coins/ethereum/history";
  // fix the date format to be DD-MM-YYYY for coingecko API.
  date = date.split('-').reverse().join('-'); // Reformatting the date to DD-MM-YYYY
  let priceUrl = (apiEndpoint + node_action + "?date=" + date + "?x_cg_demo_api_key=" + apikey)

  if (date === "") {
    // url shuld be 
    //https://api.coingecko.com/api/v3simple/price?ids=ethereum&vs_currencies=usd&precision=full?x_cg_demo_api_key=CG-YufuxVfD5JK12tvvrXh7sF3f
    // adding rpl to the ids returns the price of rpl as well
    let node_action = "/simple/price?ids=ethereum,rocket-pool&vs_currencies=usd&precision=full";
    let priceUrl = (apiEndpoint + node_action + "?x_cg_demo_api_key=" + apikey)
    try {
      let price = [];
      let payouts = await axios(priceUrl);
      price.date = "now"
      price.eth_price_usd = payouts.data.ethereum.usd;
      price.rpl_price_usd = payouts.data['rocket-pool'].usd;
      return price;
    } catch (error) {
      console.log("Error setting the current price:", error);
    }
  } else {
    try {
      let price = [];
      let payouts = await axios(priceUrl);
      price.date = date
      price.price_usd = payouts.data.market_data.current_price.usd;
      return price;
    } catch (error) {
      console.log("Error setting the historical price:", error);
    }
  }
};

function formatArray(array) {
  return (array || []).map(function (element) {

    // currently accepted formats for strings:
    // YYYYMMDD, YYYY-MM-DD, YYYY/MM/DD
    ///const originalDate = element.day;
    //const reformattedDate = originalDate.split('T')[0];
    const dateObject = new Date(element.date);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const day = String(dateObject.getDate()).padStart(2, '0');

    const reformattedDate = `${year}-${month}-${day}`;
    const dailyEthFlow = element.deposits_amount - element.withdrawals_amount;
    return { validatorIndex: element.validatorIndex, eth_amount: dailyEthFlow, fiat_amount: element.fiat_amount, days: element.day, date: reformattedDate };
  });
}

