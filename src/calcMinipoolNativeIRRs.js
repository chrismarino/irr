import _ from "lodash";
const { xirr, convertRate } = require('node-irr')

export default function calcMinipoolNativeIRRs(minipools, minipoolHistory, periodicRewardsShare, ethPriceHistory, rplPriceHistory) {
  let ethPriceToday = Number(ethPriceHistory[0].price_usd);
  let rplPriceToday = Number(rplPriceHistory[0].price_usd);
  var minipoolNativeIRR = [];

  minipools.forEach(minipool => {
    // need to know what minipool we're working with to fetch the details. Find the minipool index
    minipool = minipools.find(pool => pool.validatorIndex === minipool.validatorIndex);
    if (!minipool) {
      throw new Error(`No minipool found with validator index: ${minipool}`);
    }
    let mpHistory = minipoolHistory.find(mpHistorys => mpHistorys.minipoolAddress === minipool.minipoolStats.minipool_address);
    if (!mpHistory) {
      throw new Error(`No minipool detail found with address: ${minipool.minipoolStats.minipool_address}`);
    }
    // Now that we have the minipool and its history, we can calculate the APRs
    // First, Calculate the age of active and exited minipools
    // Use the date of the earliest deposit and the date of the latest withdrawal to calculate the age of the minipool.
    // maxDate does not consider swept rewards. Need to rework this to include the swept rewards.
    let today = new Date().toISOString().slice(0, 10);
    let startDateString = _.minBy(mpHistory.deposits, 'date').date;
    let endDateString = (_.maxBy(mpHistory.distributions, 'date') || {}).date || today; // If no withdrawals, use today's date.
    let startDate = new Date(startDateString);  // actual dates
    let endDate = new Date(endDateString);
    let ageInSec = Math.abs(endDate - startDate);
    let days = Math.ceil(ageInSec / (1000 * 60 * 60 * 24)); // age from dates. Use fractional dates to calculate minipool allocations.
    let nodeFee = Number(mpHistory.nodeFee); //Node fee. Not used.
    // Set the deposits...and convert to gwei
    var ethDeposited = (minipool.minipoolStats.node_deposit_balance || 0) / 1E18;
    let ethReturnedCapital = mpHistory.isFinalized === true ? ethDeposited : 0;
    var walletRPLStaked = minipools[0].minipoolStats.node_rpl_stake / 1E18 // need full history to calculate IRR
    // Set the Continious Reward Distibutions...
    var distributedCREth = mpHistory.totalDistributions || 0;

    // Set the eth earned and fiat values.
    var undistributedCREth = 0;
    undistributedCREth = Number(mpHistory.nodeBalance);
    // Calculate the current fiat values of the eth earned

    // Set the inflation and smoothing pool rewards for this minipool. Rewards are for operator only. Node and Protocl are set to zero.
    // Find the rewards for this minipool...
    let rewards = periodicRewardsShare.find(reward => reward.minipoolAddress === minipool.minipoolStats.minipool_address);
    if (!rewards) {
      throw new Error(`No reward found with minipool address: ${minipool.minipoolStats.minipool_address}`);
    }
    // rewards is an array of values:

    // minipoolAddress
    // smoothingPoolEthRewards
    // inflationRPLRewards,
    // minipoolInflationAPR
    // 
    // Note: Inflation APR is calculated within the function because it has access to RPL history, etc <= this is wrong.

    // Set the rewards...
    let inflationTotal = (rewards.inflationRPLRewards / 1E18);
    let inflationClaimed = (rewards.claimedInflationRPLRewards / 1E18);
    let inflationUnclaimed = inflationTotal - inflationClaimed;

    let smoothingPoolEthUnclaimed = (rewards.smoothingPoolEthRewards / 1E18);
    let smoothingPoolEthClaimed = (rewards.claimedSmoothingPoolEthRewards / 1E18);
    let smoothingPoolEthTotal = smoothingPoolEthUnclaimed + smoothingPoolEthClaimed;

    // Add distributed and total smoothing pool and earned (undsitributed) eth to the total eth earned for the minipool
    let totalEthtoMinipool;
    if (minipool.status === true) {
      totalEthtoMinipool = undistributedCREth + smoothingPoolEthTotal + distributedCREth; // undistributedCREth includes the initial deposit
    } else { // Exited minipools have distribited their bond, so back it out to keep the total eth earned correct.
      distributedCREth = distributedCREth - ethDeposited // back out the bond for exited minipools
      totalEthtoMinipool = undistributedCREth + smoothingPoolEthTotal + distributedCREth;
    }
    let continuousRewardsTotal = distributedCREth + undistributedCREth;

    //Find the IRRs...
    // Calculate the IRR of the Continuous Rewards. Deposits are just the initial depost on the start date.
    // Distributions are the total eth distributed to the operator. 
    // Deposits are used for continious rewards, smooting pool and overall minipool IRR..
    const deposits = [{ amount: ethDeposited, date: startDateString }]; // deposits are just the initial deposit.
    const distributions = mpHistory.distributions.map(({ amount, date }) => ({ amount, date }));
    let undistributed = [];
    if (minipool.status === true) { //have to include the initial deposit for the IRR calculation
      undistributed = [{ amount: undistributedCREth + ethDeposited, date: today }];
    }
    // Combine the deposits and distributions into a single array for the IRR calculation
    var combinedCR = deposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
      .concat(distributions.map(({ amount, date }) => ({ amount, date })))
      .concat(undistributed.map(({ amount, date }) => ({ amount, date })));

    // Add the price on date for the fiat calc.
    let distributedCREthFlow = distributions.map(item => {
      const price_usd = ethPriceHistory.find(price => price.date === item.date)?.price_usd;
      return { ...item, price_usd };
    });

    let irrDaily = xirr(combinedCR);
    let operatorCREthIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate

    // Calc Smoothing Pool IRRs

    // Calculate the IRR of the Smoothing Pool. deposits are just the initial depost on the start date.
    // distributions are the total eth distributed to the operator.

    const calimed = [{ amount: smoothingPoolEthClaimed, date: today }]
    let unclaimed = [{ amount: smoothingPoolEthUnclaimed + ethDeposited, date: today }];

    let combinedSP = deposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
      .concat(calimed.map(({ amount, date }) => ({ amount, date })))
      .concat(unclaimed.map(({ amount, date }) => ({ amount, date })));
    // prepare the entery in the array. No values change beyond this point. Only formatting

    irrDaily = xirr(combinedSP);
    let operatorSPEthIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate

    // Calculate the IRR of the minipool. 
    unclaimed = [{ amount: smoothingPoolEthUnclaimed, date: today }];
    let totalFlows = deposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
      .concat(distributions.map(({ amount, date }) => ({ amount, date })))
      .concat(undistributed.map(({ amount, date }) => ({ amount, date })))
      .concat(calimed.map(({ amount, date }) => ({ amount, date })))
      .concat(unclaimed.map(({ amount, date }) => ({ amount, date })));
    irrDaily = xirr(totalFlows);
    let operatorMinipoolEthIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate
    let totalEthGain = totalEthtoMinipool;

    let inflationIRR = rewards.minipoolInflationAPR; // Inflation APR per minipool uses staked RPL at time of reward (Check this)

    const newNativeIRR = {
      minipool: minipool.validatorIndex,
      ethDeposited: ethDeposited.toFixed(4), //node operators eth deposited
      ethReturned: ethReturnedCapital.toFixed(4), //node operators eth returned
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: (minipool.status ? "Active" : "Exited"),
      exited: (minipool.status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      age: days,
      continuousRewardsDistributed: distributedCREth.toFixed(4),
      continuousRewardsUndistributed: undistributedCREth.toFixed(4), //node operators eth earned
      continuousRewardsTotal: continuousRewardsTotal.toFixed(4),
      smoothingPoolClaimed: smoothingPoolEthClaimed.toFixed(4),
      smoothingPoolUnclaimed: smoothingPoolEthUnclaimed.toFixed(4),
      smoothingPoolTotal: smoothingPoolEthTotal.toFixed(4),
      totalEthtoMinipool: totalEthtoMinipool.toFixed(4),
      continiousRewardsIRR: operatorCREthIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      smoothingPoolIRR: operatorSPEthIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalEthIRR: operatorMinipoolEthIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      inflationUnclaimed: inflationUnclaimed.toFixed(4),
      inflationClaimed: inflationClaimed.toFixed(4),
      inflationTotal: inflationTotal.toFixed(4),
      inflationIRR: inflationIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalEthGain: totalEthGain.toFixed(4),
      continuousRewardsFlows: combinedCR,  // need the flows to calc the wallet IRRs
      distributedCREthFlow: distributedCREthFlow,  // need the flows to calc the wallet IRRs
      smoothingPoolFlows: combinedSP,
      totalEthFlows: totalFlows

    }; //node operator apr

    //console.log("Added minipool to node Narive IRR:");
    minipoolNativeIRR.push(newNativeIRR);
  });


  return minipoolNativeIRR;
}