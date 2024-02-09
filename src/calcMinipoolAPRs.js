// Pulling out the caliculation of the APRs from the main app.js file to make it easier to read and maintain.
import _ from "lodash";

export default function calcMinipoolAPRs(minipools, nodeDepositsAndWithdrawals, ethPriceToday, ethPriceHistory) {
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
  //var minipools = minipools;

  //combine the despots and withdrawls into a single array for the IRR calculation
  totalArray = formatArray(nodeDepositsAndWithdrawals);
  //totalArray.sort() //make sure they are sorted by date
  totalArray = _.sortBy(totalArray, function (item) {
    return new Date(item.date);
  });
  //find the minipool indices...
  // write the code that creates an array containg unique ValidatorIndex values in totalArray
  const uniqueValidatorIndexes = [...new Set(totalArray.map(item => item.validatorIndex))];
  // don't think I need this since I saved the list of validators in the from the node API
  //filter the array for each minipool and calculate the IRR
  var nodeAPR = [];
  var nodeOperatorAPR = [];
  var protocolAPR = [];
  const ethPriceNow = ethPriceToday[0].price_usd; // ethPriceToday is an array of objects with a single object.
  uniqueValidatorIndexes.forEach(minipool => {
    const filteredArray = totalArray.filter(item => item.validatorIndex === minipool);
    // console.log("Filtered Array:", filteredArray);
    // need to know what minipool we're working with to fetch the details. 
    let minipoolData = minipools.find(pool => pool.validatorIndex === minipool);
    if (minipoolData.minipoolStats === undefined) {
      throw new Error("Minipool data is undefined. Minipool: " + minipool);
    }

    // Calculate the age of active and exited minipools
    let minDay = _.minBy(filteredArray, 'days').days;
    let maxDay = _.maxBy(filteredArray, 'days').days; //day of most recent deposit or withdrawal. Not the current day.
    let today = new Date();
    let startDateString = _.minBy(filteredArray, 'date').date;  // actual dates
    let endDateString = _.maxBy(filteredArray, 'date').date;
    let startDate = new Date(startDateString);  // actual dates
    let endDate = new Date(endDateString);
    let days = (maxDay - minDay);
    let age = (today - startDate) / (1000 * 60 * 60 * 24); // age from dates
    age = Math.floor(age); // Just use the whole days...

    if (minipoolData.status === false) { days = days } //if the minipool has exited, use the age from the dates
    else { days = age } //if the minipool is active, use the days from the deposits until today.

    var totalNOEthDeposited = minipoolData.minipoolStats.node_deposit_balance || 0;
    var totalProtocolEthDeposited = minipoolData.minipoolStats.user_deposit_balance || 0;
    var totalEthDeposited = totalNOEthDeposited + totalProtocolEthDeposited;
    totalNOEthDeposited = (totalNOEthDeposited / 1E18) //convert to gwei
    totalProtocolEthDeposited = (totalProtocolEthDeposited / 1E18)
    totalEthDeposited = (totalEthDeposited / 1E18)

    // Get the historical price of eth on the days of deposits and withdrawals.
    //console.log("ethPriceHistory:", ethPriceHistory);
    try {
      var ethDepositPrice = ethPriceHistory.find(item => item.date === startDateString);
      var ethWithdrawalPrice = ethPriceHistory.find(item => item.date === endDateString);
    }
    catch (error) {
      console.log("Error in getPriceData gettimg ethPriceHistor:", error);
    }
    let totalEthEarned = -(_.sumBy(filteredArray, 'eth_amount')); //total eth earned by the minipool. Negative because it is a withdrawal

    // Total fiat deposited is amount deposited * price of eth at the time of deposit
    let totalNOFiatDeposited = totalNOEthDeposited * ethDepositPrice.price_usd; //total fiat deposited bu the node operator
    let totalProtocolFiatDeposited = totalProtocolEthDeposited * ethDepositPrice.price_usd; //total fiat deposited bu the protocol
    let totalFiatDeposited = totalProtocolFiatDeposited + totalNOFiatDeposited; //total fiat deposited
    if (totalEthEarned < 0) { totalEthEarned = totalEthEarned + 32000000000 } //back out the 32 eth deposit
    totalEthEarned = (totalEthEarned / 1000000000)

    var protocolEthEarned = totalEthEarned * (totalProtocolEthDeposited / totalEthDeposited); //Negative because it is a withdrawal
    var nodeOperatorEthEarned = totalEthEarned * (totalNOEthDeposited / totalEthDeposited); //Negative because it is a withdrawal
    const commission = protocolEthEarned * minipoolData.minipoolStats.minipool_node_fee; //Calculate the commission
    protocolEthEarned = protocolEthEarned - commission; //paid by the protocol
    nodeOperatorEthEarned = nodeOperatorEthEarned + commission; //to the Node Operator

    // Fiat gains are the eth earned - eth deposited, times the current price of eth
    const totalFiatGain = ((totalEthEarned + totalEthDeposited) * ethPriceNow) - totalFiatDeposited;
    const protocolFiatGain = ((protocolEthEarned + totalProtocolEthDeposited) * ethPriceNow) - totalProtocolFiatDeposited;
    const nodeOperatorFiatGain = ((nodeOperatorEthEarned + totalNOEthDeposited) * ethPriceNow) - totalNOFiatDeposited;

    //if (totalFiatDeposited > 0) { totalFiatDeposited = totalFiatDeposited - 32000000000 * 2350 } //back out the 32 eth deposit
    let minipoolIndex = minipools.find(pool => pool.validatorIndex === minipool);
    let status = minipoolIndex.status;
    //console.log("Minipool:", minipool, "Minipool Status:", status);
    const eth_apr = ((((100) * (365 / days) * totalEthEarned)) / totalEthDeposited).toFixed(2);
    const fiat_apr = (((100) * (365 / days) * totalFiatGain) / (totalFiatDeposited)).toFixed(2);
    const no_eth_apr = ((((100) * (365 / days) * nodeOperatorEthEarned)) / totalNOEthDeposited).toFixed(2);
    const p_eth_apr = (((100) * (365 / days) * protocolEthEarned) / (totalProtocolEthDeposited)).toFixed(2);
    const no_fiat_apr = (((100) * (365 / days) * nodeOperatorFiatGain) / (totalNOFiatDeposited)).toFixed(2);
    const p_fiat_apr = (((100) * (365 / days) * protocolFiatGain) / (totalProtocolFiatDeposited)).toFixed(2);
    const newNodeAPR = {
      minipool: minipool,
      status: status,
      age: days,
      eth_deposited: totalEthDeposited.toFixed(1), //total eth deposited by the minipool
      eth_earned: (totalEthEarned.toFixed(4)), //total eth earned by the minipool
      eth_apr: eth_apr,
      fiat_gain: totalFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //Total node's gain
      fiat_apr: fiat_apr
    }; //Total node's apr
    const newNodeOperatorAPR = {
      minipool: minipool,
      status: status,
      age: days,
      eth_deposited: totalNOEthDeposited.toFixed(1), //node operators eth deposited
      eth_earned: nodeOperatorEthEarned.toFixed(4), //node operators eth earned
      eth_apr: no_eth_apr, //node operator apr
      fiat_gain: nodeOperatorFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators gain
      fiat_apr: no_fiat_apr
    }; //Total node operator's apr
    const newprotocolAPR = {
      minipool: minipool,
      status: status,
      age: days,
      eth_deposited: totalProtocolEthDeposited.toFixed(1), //protocol eth deposited
      eth_earned: protocolEthEarned.toFixed(4), //protocol eth earned
      eth_apr: p_eth_apr, //protocol apr
      fiat_gain: protocolFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //protocol gain
      fiat_apr: p_fiat_apr
    }; ////protocol apr in SD
    //console.log("Added minipool to node APRs:", nodeAPR, nodeOperatorAPR, protocolAPR);
    nodeAPR.push(newNodeAPR);
    nodeOperatorAPR.push(newNodeOperatorAPR);
    protocolAPR.push(newprotocolAPR);
  });

  return { nodeAPR, nodeOperatorAPR, protocolAPR };
}

function formatArray(array) {
  return (array || []).map(function (element) {
    //date must be in the format of YYYY-MM-DD for getPriceData
    const dateObject = new Date(element.date);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const day = String(dateObject.getDate()).padStart(2, '0');

    const reformattedDate = `${year}-${month}-${day}`;
    const dailyEthFlow = element.deposits_amount - element.withdrawals_amount;
    return { validatorIndex: element.validatorIndex, eth_amount: dailyEthFlow, days: element.day, date: reformattedDate };
  });
}