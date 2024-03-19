// Pulling out the caliculation of the APRs from the main app.js file to make it easier to read and maintain.
import _ from "lodash";

export default function calcMinipoolAPRs(walletEthHistory, walletRPLHistory, minipools, minipoolDetails, mpDepositsAndWithdrawals, ethPriceToday) {
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

  var walletEthDeposited = _.sumBy(walletEthHistory.deposits, "amount")/1E18;
  var walletRPLDeposited = _.sumBy(walletRPLHistory.deposits, "amount")/1E18;
  var walletEthWithdrawn = _.sumBy(walletEthHistory.withdrawals, "amount")/1E18;
  var walletRPLWithdrawn = _.sumBy(walletRPLHistory.withdrawals, "amount")/1E18;

  //combine the despots and withdrawls into a single array for the IRR calculation
  totalArray = formatArray(mpDepositsAndWithdrawals);
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
  //console.log("ethPriceToday from calc minipools:", ethPriceToday);
  //const ethPriceNow = (ethPriceToday[0].price_usd  || 0); // ethPriceToday is an array of objects with a single object.
  const ethPriceNow = ethPriceToday; 
  uniqueValidatorIndexes.forEach(minipool => {
    const filteredArray = totalArray.filter(item => item.validatorIndex === minipool);
    // console.log("Filtered Array:", filteredArray);
    // need to know what minipool we're working with to fetch the details. 
    let minipoolData = minipools.find(pool => pool.validatorIndex === minipool);
    let mpDetail = minipoolDetails.find(mpDetails => mpDetails.minipoolAddress === minipoolData.minipoolStats.minipool_address);
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
    //console.log("ethPriceHistory from calc minipools:", ethPriceHistory);

    var totalNOEthDeposited = minipoolData.minipoolStats.node_deposit_balance || 0;
    var totalProtocolEthDeposited = minipoolData.minipoolStats.user_deposit_balance || 0;
    var totalEthDeposited = totalNOEthDeposited + totalProtocolEthDeposited;
    totalNOEthDeposited = (totalNOEthDeposited / 1E18) //convert to gwei
    totalProtocolEthDeposited = (totalProtocolEthDeposited / 1E18)
    totalEthDeposited = (totalEthDeposited / 1E18)

    let totalEthEarned = -(_.sumBy(filteredArray, 'eth_amount')); //total eth earned by the minipool. Negative because it is a withdrawal
    let NewTotalEthEarned = mpDetail.nodeBalance;
    // totalEthEarned can be found directly from 'nodeBalance' in minipooldetails this _.sumBy not needed.
    // Total fiat deposited is amount deposited * price of eth at the time of deposit
    //let totalNOFiatDeposited = totalNOEthDeposited * ethDepositPrice.price_usd; //total fiat deposited bu the node operator
    //let totalProtocolFiatDeposited = totalProtocolEthDeposited * ethDepositPrice.price_usd; //total fiat deposited bu the protocol
    let totalNOFiatDeposited = 0;
    let totalProtocolFiatDeposited = 0;
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
    const eth_apr = ((((365 / days) * totalEthEarned)) / totalEthDeposited).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const no_eth_apr = ((((365 / days) * nodeOperatorEthEarned)) / totalNOEthDeposited).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const p_eth_apr = (((365 / days) * protocolEthEarned) / (totalProtocolEthDeposited)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fiat_apr = (((365 / days) * totalFiatGain) / (totalFiatDeposited)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const no_fiat_apr = (((365 / days) * nodeOperatorFiatGain) / (totalNOFiatDeposited)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const p_fiat_apr = (((365 / days) * protocolFiatGain) / (totalProtocolFiatDeposited)).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const newNodeAPR = {
      nodeAddress: minipoolData.minipoolStats.node_address,
      walletEthDeposited: walletEthDeposited.toFixed(4),
      walletRPLDeposited: walletRPLDeposited.toFixed(4),
      walletEthWithdrawn: walletEthWithdrawn.toFixed(4),
      walletRPLWithdrawn: walletRPLWithdrawn.toFixed(4),
      minipool: minipool,
      status: (status ? "Active" : "Exited"),
      age: days,
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exited: (status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      minipoolEthDeposited: totalEthDeposited.toFixed(1), //total eth deposited by the minipool
      eth_earned: (totalEthEarned.toFixed(4)), //total eth earned by the minipool
      eth_apr: eth_apr,
      fiat_gain: totalFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //Total node's gain
      fiat_apr: fiat_apr
    }; //Total node's apr
    const newNodeOperatorAPR = {
      nodeAddress: minipoolData.minipoolStats.node_address,
      walletEthDeposited: walletEthDeposited.toFixed(4),
      walletRPLDeposited: walletRPLDeposited.toFixed(4),
      walletEthWithdrawn: walletEthWithdrawn.toFixed(4),
      walletRPLWithdrawn: walletRPLWithdrawn.toFixed(4),
      minipool: minipool,
      status: (status ? "Active" : "Exited"),
      age: days,
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exited: (status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      minipoolEthDeposited: totalNOEthDeposited.toFixed(1), //node operators eth deposited
      eth_earned: nodeOperatorEthEarned.toFixed(4), //node operators eth earned
      eth_apr: no_eth_apr, //node operator apr
      fiat_gain: nodeOperatorFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators gain
      fiat_apr: no_fiat_apr
    }; //Total node operator's apr
    const newProtocolAPR = {
      nodeAddress: minipoolData.minipoolStats.node_address,
      walletEthDeposited: walletEthDeposited.toFixed(4),
      walletRPLDeposited: walletRPLDeposited.toFixed(4),
      walletEthWithdrawn: walletEthWithdrawn.toFixed(4),
      walletRPLWithdrawn: walletRPLWithdrawn.toFixed(4),
      minipool: minipool,
      status: (status ? "Active" : "Exited"),
      age: days,
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      exited: (status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      minipoolEthDeposited: totalProtocolEthDeposited.toFixed(1), //protocol eth deposited
      eth_earned: protocolEthEarned.toFixed(4), //protocol eth earned
      eth_apr: p_eth_apr, //protocol apr
      fiat_gain: protocolFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //protocol gain
      fiat_apr: p_fiat_apr
    }; ////protocol apr in SD
    //console.log("Added minipool to node APRs:", nodeAPR, nodeOperatorAPR, protocolAPR);
    nodeAPR.push(newNodeAPR);
    nodeOperatorAPR.push(newNodeOperatorAPR);
    protocolAPR.push(newProtocolAPR);
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