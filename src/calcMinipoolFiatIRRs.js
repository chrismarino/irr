import _ from "lodash";
const { xirr, convertRate } = require('node-irr')

export default function calcMinipoolFiatIRRs(minipools, minipoolHistory, periodicRewardsShare, ethPriceHistory, rplPriceHistory) {
  let ethPriceToday = Number(ethPriceHistory[0].price_usd) || 0;
  let rplPriceToday = Number(rplPriceHistory[0].price_usd) || 0;
  var minipoolFiatIRR = [];

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
    let ethPriceAtEndDate = ethPriceHistory.find(price => price.date === endDateString)?.price_usd ?? 0
    let rplPriceAtEndDate = rplPriceHistory.find(price => price.date === endDateString)?.price_usd ?? 0
    let ethPriceAtStartDate = ethPriceHistory.find(price => price.date === startDateString)?.price_usd ?? 0
    let rplPriceAtStartDate = rplPriceHistory.find(price => price.date === startDateString)?.price_usd ?? 0
    let bondValueOnEndDate = mpHistory.nodeDepositBalance * ethPriceAtEndDate;
    let bondValueOnStartDate = mpHistory.nodeDepositBalance * ethPriceAtStartDate;
    let startDate = new Date(startDateString);  // actual dates
    let endDate = new Date(endDateString);
    let ageInSec = Math.abs(endDate - startDate);
    let days = Math.ceil(ageInSec / (1000 * 60 * 60 * 24)); // age from dates. Use fractional dates to calculate minipool allocations.

    // Set the deposits...and convert to gwei
    const earliestDeposit = _.minBy(mpHistory.deposits, 'date');
    const ethDeposited = (mpHistory.nodeDepositBalance * earliestDeposit.price_usd) || 0;


    var walletRPLStaked = minipools[0].minipoolStats.node_rpl_stake / 1E18 // need full history to calculate IRR
    // Set the Continious Reward Distibutions...need to find the price at time of distribution....

    var distributedCREth = mpHistory.distributions.reduce((sum, distribution) => {
      return sum + distribution.amount * distribution.price_usd || 0;
    }, 0);
    // calculate the fiat value of the capital returned when it was returned..
    let ethReturnedCapital = 0;
    if (mpHistory.isFinalized === true) {
      const latestDistribution = mpHistory.distributions.reduce((latest, distribution) => {
        return (!latest || new Date(distribution.date) > new Date(latest.date)) ? distribution : latest;
      }, null);

      if (latestDistribution) {
        ethReturnedCapital = mpHistory.nodeDepositBalance * latestDistribution.price_usd || 0;
      }
    }

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
    let inflationTotal = (rewards.inflationRPLRewards / 1E18) * rplPriceToday;
    let inflationClaimed = (rewards.claimedInflationRPLRewards / 1E18) * rplPriceToday;;
    let inflationUnclaimed = inflationTotal - inflationClaimed;

    let smoothingPoolEthUnclaimed = (rewards.smoothingPoolEthRewards / 1E18) * ethPriceToday;;
    let smoothingPoolEthClaimed = (rewards.claimedSmoothingPoolEthRewards / 1E18) * ethPriceToday;;
    let smoothingPoolEthTotal = smoothingPoolEthUnclaimed + smoothingPoolEthClaimed;

    // Add distributed and total smoothing pool and earned (undsitributed) eth to the total eth earned for the minipool
    let totalEthtoMinipool;
    if (minipool.status === true) {
      totalEthtoMinipool = (undistributedCREth * ethPriceToday) + smoothingPoolEthTotal + distributedCREth; // undistributedCREth includes the initial deposit
    } else { // Exited minipools have distribited their bond, so back it out to keep the total eth earned correct.
      distributedCREth = distributedCREth - ethReturnedCapital // back out the bond for exited minipools
      totalEthtoMinipool = (undistributedCREth * ethPriceToday) + smoothingPoolEthTotal + distributedCREth;
    }
    // Convert the undistributed eth to fiat. OK for exited minipools as well because there is no undistributed eth.
    undistributedCREth = undistributedCREth * ethPriceToday;
    let continuousRewardsTotal = distributedCREth + undistributedCREth;

    //Find the IRRs...
    // Calculate the IRR of the Continuous Rewards. 
    // 
    const deposits = [{ amount: ethDeposited, date: startDateString }]; // deposits are just the initial deposit.
    const distributions = mpHistory.distributions.map(item => ({
      amount: item.price_usd * item.amount, // amount is now the fiat value of the distribution.
      date: item.date // need the date to calc irr.
    }));
    let undistributed = [];
    if (minipool.status === true) { // Undistributed eth shows up today for the IRR calc.
      undistributed = [
        { amount: undistributedCREth, date: endDateString },
        { amount: bondValueOnEndDate, date: endDateString } // need to use the value of ethDeposited at endDate
      ];
    }
    if (minipool.status === false) { // Undistributed eth shows up today for the IRR calc.
      undistributed = [
        { amount: undistributedCREth, date: endDateString }, // There is no undistributed eth for exited minipools
      ];
    }
    // Combine the deposits and distributions into a single array for the IRR calculation
    const combinedCR = deposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
      .concat(distributions.map(({ amount, date }) => ({ amount, date })))
      .concat(undistributed.map(({ amount, date }) => ({ amount, date })));

    let irrDaily = xirr(combinedCR);
    let continiousRewardsIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate

    // Calc Smoothing Pool IRRs

    // Calculate the IRR of the Smoothing Pool. deposits are just the initial depost on the start date.
    // distributions are the total eth distributed to the operator.

    const calimed = [{ amount: smoothingPoolEthClaimed, date: endDateString }]
    let unclaimed = [{ amount: smoothingPoolEthUnclaimed + ethDeposited, date: endDateString }];

    let combinedSP = deposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
      .concat(calimed.map(({ amount, date }) => ({ amount, date })))
      .concat(unclaimed.map(({ amount, date }) => ({ amount, date })));
    // prepare the entery in the array. No values change beyond this point. Only formatting

    irrDaily = xirr(combinedSP);
    let smoothingPoolIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate

    // Calculate the IRR of the minipool. Unclaimed here don't get the ethDeposit..
    unclaimed = [{ amount: smoothingPoolEthUnclaimed, date: endDateString }];
    let totalFlows = deposits.map(({ amount, date }) => ({ amount: -1 * amount, date }))
      .concat(distributions.map(({ amount, date }) => ({ amount, date })))
      .concat(undistributed.map(({ amount, date }) => ({ amount, date })))
      .concat(calimed.map(({ amount, date }) => ({ amount, date })))
      .concat(unclaimed.map(({ amount, date }) => ({ amount, date })));
    irrDaily = xirr(totalFlows);
    let operatorMinipoolEthIRR = convertRate(irrDaily.rate, 'year'); // Convert the daily rate to an annual rate
    let totalEthGain = ethReturnedCapital + continuousRewardsTotal + smoothingPoolEthTotal + undistributedCREth - ethDeposited;
    if (minipool.status === true) { // if false, just use gains
      totalEthGain = continuousRewardsTotal + smoothingPoolEthTotal + undistributedCREth + (bondValueOnEndDate - ethDeposited);

    }


    let inflationIRR = rewards.minipoolInflationAPR; // Inflation APR per minipool uses staked RPL at time of reward (Check this)

    const newFiatIRR = {
      minipool: minipool.validatorIndex,
      ethDeposited: ethDeposited.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      ethReturned: ethReturnedCapital.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      activated: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: (minipool.status ? "Active" : "Exited"),
      exited: (minipool.status ? "N/A" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })),
      age: days,
      continuousRewardsDistributed: distributedCREth.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      continuousRewardsUndistributed: undistributedCREth.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      continuousRewardsTotal: continuousRewardsTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      smoothingPoolClaimed: smoothingPoolEthClaimed.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      smoothingPoolUnclaimed: smoothingPoolEthUnclaimed.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      smoothingPoolTotal: smoothingPoolEthTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      totalEthtoMinipool: totalEthtoMinipool.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      continiousRewardsIRR: "N/M", // Calculated above, but not displayed. Not meaningful
      smoothingPoolIRR:  "N/M", // Not meaningful
      totalEthIRR: operatorMinipoolEthIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      inflationUnclaimed: inflationUnclaimed.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      inflationClaimed: inflationClaimed.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      inflationTotal: inflationTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      inflationIRR: inflationIRR.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalEthGain: totalEthGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      continuousRewardsFlows: combinedCR,  // need the flows to calc the wallet IRRs
      smoothingPoolFlows: combinedSP,
      totalEthFlows: totalFlows

    }; //node operator apr

    //console.log("Added minipool to node APRs:", totalNodeAPR, fiatAPR, fiatAPR);
    minipoolFiatIRR.push(newFiatIRR);
  });


  return minipoolFiatIRR;
}