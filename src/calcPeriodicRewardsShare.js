import _ from "lodash";
export default function calcPeriodicRewardsShare(nodePeriodicRewards, minipoolDetails) {
    // a function that determines if a minipool was active during a reward period and assignes a share of the Smoothing Pool and 
    // Inflation rewards to that minipool. Share base on the number of days the minipool was active during the reward period, and
    // the minipool's stake. Returnd an array of objects with the minipool, share and rewards.
    // Uses timestamp (not dates) of minipool creation and end of reward period to determine if minipool was 
    // active during the reward period.
    if(nodePeriodicRewards.length === 0 || !minipoolDetails) return;
    let interval = nodePeriodicRewards.map(interval => ({
        interval: interval.rewardIndex,
        endTime: interval.endTime,
        startTime: interval.endTime - (28* 86400), // 86400 seconds in a day
        smootingPoolRewards: interval.smoothingPoolEth,
        inflationRewards: interval.collateralRpl,
    }));
    let minipoolsX = minipoolDetails.map(minipool => ({
        minipoolAddress: minipool.minipoolAddress,
        startTime: minipool.statusTime.toNumber(),
        endTime: (_.maxBy(minipool.withdrawals, 'timeStamp') || {}).timeStamp || Math.floor(Date.now() / 1000), // If no withdrawals, use today's date.
        nodeDeposit: minipool.nodeDepositBalance,
    }));
    console.log("Interval:", interval, "Minipools:",  minipoolDetails);

    return interval, minipoolsX;
}