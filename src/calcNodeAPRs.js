// Pulling out the caliculation of the APRs from the main app.js file to make it easier to read and maintain.
import _ from "lodash";
// Sturcture of Rocketpool Stats object for each minipool. Need to roll up these totals for the node.
// "claimed_smoothing_pool": 0,
// "effective_rpl_stake": 455869217950000000000,
// "index": 983397,
// "is_vacant": false,
// "minipool_address": "0x6841ccfeaf1a9c1c5bd19badf0500b99c0bd7e97",
// "minipool_deposit_type": "Variable",
// "minipool_node_fee": 0.14,
// "minipool_status": "Staking",
// "minipool_status_time": 1698071063,
// "node_address": "0x635d06a61a36566003d71428f1895e146cdbd54e",
// "node_deposit_balance": 16000000000000000000,
// "node_deposit_credit": 0,
// "node_max_rpl_stake": 3.982559932502385e+21,
// "node_min_rpl_stake": 265503995500158980000,
// "node_refund_balance": 0,
// "node_rpl_stake": 455869217950000000000,
// "node_timezone_location": "America/Los_Angeles",
// "penalty_count": 0,
// "rpl_cumulative_rewards": 0,
// "smoothing_pool_opted_in": true,
// "unclaimed_rpl_rewards": 8473578832143186000,
// "unclaimed_smoothing_pool": 77122626715194030,
// "user_deposit_balance": 16000000000000000000,
// "version": 3

export function calcNodeAPRs(minipools, nodeDepositsAndWithdrawals, ethPriceToday) {
  // A utility function used to calculate the irr of a node.

  var totalArray = [];
  var minipools = minipools;


  const minipoolAPRs = []
// Pull the RPL and Smoothingpool data from each minipool
 nodeRollupCalcs.forEach(minipool => {
    const filteredArray = totalArray.filter(item => item.validatorIndex === minipool);
    // need to know what minipool we're working with to fetch the details. 
    let minipoolData = minipools.find(pool => pool.validatorIndex === minipool);
    if (minipoolData.minipoolStats === undefined) {
      throw new Error("Minipool data is undefined. Minipool: " + minipool);
    }

    var totalNOEthDeposited = totalNOEthDeposited + minipoolData.minipoolStats.node_deposit_balance;
    var totalProtocolEthDeposited = totalProtocolEthDeposited + minipoolData.minipoolStats.user_deposit_balance;
    var totalEthDeposited = totalNOEthDeposited + totalProtocolEthDeposited;
    totalNOEthDeposited = (totalNOEthDeposited / 1E18) //convert to gwei
    totalProtocolEthDeposited = (totalProtocolEthDeposited / 1E18)
    totalEthDeposited = (totalEthDeposited / 1E18)

    let totalEthEarned = _.sumBy(filteredArray, 'eth_amount'); //total eth earned by the minipool
    let totalFiatDeposited = _.sumBy(filteredArray, 'fiat_amount'); // total fiat deposited by the minipool
    // Total fiat deposited is the share of the total fiat deposited.
    let totalNOFiatDeposited = totalFiatDeposited * (totalNOEthDeposited / totalEthDeposited);
    let totalProtocolFiatDeposited = totalFiatDeposited * (totalProtocolEthDeposited / totalEthDeposited);
    if (totalEthEarned > 0) { totalEthEarned = totalEthEarned - 32000000000 } //back out the 32 eth deposit
    totalEthEarned = -(totalEthEarned / 1000000000)

    var protocolEthEarned = totalEthEarned * (totalProtocolEthDeposited / totalEthDeposited); 
    var nodeOperatorEthEarned = totalEthEarned * (totalNOEthDeposited / totalEthDeposited);
    const commission = protocolEthEarned * minipoolData.minipoolStats.minipool_node_fee; //Calculate the commission
    protocolEthEarned = protocolEthEarned - commission; //paid by the protocol
    nodeOperatorEthEarned = nodeOperatorEthEarned + commission; //to the Node Operator


    // Fiat gains are the eth earned - eth deposited, times the current price of eth
    const totalFiatGain = ((totalEthEarned + totalEthDeposited) * ethPriceToday.eth_price_usd) - totalFiatDeposited;
    const protocolFiatGain = ((protocolEthEarned + totalProtocolEthDeposited) * ethPriceToday.eth_price_usd) - totalProtocolFiatDeposited;
    const nodeOperatorFiatGain = ((nodeOperatorEthEarned + totalNOEthDeposited) * ethPriceToday.eth_price_usd) - totalNOFiatDeposited;

    //if (totalFiatDeposited > 0) { totalFiatDeposited = totalFiatDeposited - 32000000000 * 2350 } //back out the 32 eth deposit
    let minipoolIndex = minipools.find(pool => pool.validatorIndex === minipool);
    let status = minipoolIndex.status;
    const eth_apr = ((((100) * (365 / days) * totalEthEarned)) / totalEthDeposited).toFixed(3);
    const fiat_apr = (((100) * (365 / days) * totalFiatGain) / (totalFiatDeposited)).toFixed(2);
    const no_eth_apr = ((((100) * (365 / days) * nodeOperatorEthEarned)) / totalNOEthDeposited).toFixed(3);
    const p_eth_apr = (((100) * (365 / days) * protocolEthEarned) / (totalProtocolEthDeposited)).toFixed(2);
    const no_fiat_apr = (((100) * (365 / days) * nodeOperatorFiatGain) / (totalNOFiatDeposited)).toFixed(2);
    const p_fiat_apr = (((100) * (365 / days) * protocolFiatGain) / (totalProtocolFiatDeposited)).toFixed(2);
    nodeAPIs.push({
      node: nodeAddress,
      minipools: minipools.length,
      age: days,
      // Overall node results
      eth_deposited: totalEthDeposited.toFixed(5), //total eth deposited by the minipool
      eth_earned: (totalEthEarned.toFixed(5)), //total eth earned by the minipool
      eth_apr: eth_apr,
      fiat_gain: totalFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //Total node's gain
      fiat_apr: fiat_apr,
      //Node Operator results
      no_eth_deposited: totalNOEthDeposited.toFixed(5), //node operators eth deposited
      no_eth_earned: (-nodeOperatorEthEarned.toFixed(5)), //node operators eth earned
      no_eth_apr: no_eth_apr, //node operator apr
      no_fiat_gain: nodeOperatorFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //node operators gain
      no_fiat_apr: no_fiat_apr, //node operator apr

      // Protocol results
      p_eth_deposited: totalProtocolEthDeposited.toFixed(5), //protocol eth deposited
      p_eth_earned: (-protocolEthEarned.toFixed(5)), //protocol eth earned
      p_eth_apr: p_eth_apr, //protocol apr
      p_fiat_gain: protocolFiatGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), //protocol gain
      p_fiat_apr: p_fiat_apr //protocol apr in SD

    });
  });

  return { nodeAPRs };
}

