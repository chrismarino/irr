  // get the finalized minipools to calculate the fiat value of returned capital.
  const finalizedMinipoolsDist = minipoolHistory
    .filter(minipool => minipool.isFinalized === true)
    .map(minipool => ({
      nodeDepositBalance: minipool.nodeDepositBalance,
      distributions: minipool.distributions.map(distribution => ({
        amount: distribution.amount,
        date: distribution.date,
        price_usd: distribution.price_usd
      }))
    }));
  const minipoolEthCapReturned = finalizedMinipoolsDist.reduce((sum, minipool) => {
    const latestDistribution = minipool.distributions.reduce((latest, distribution) => {
      return (!latest || new Date(distribution.date) > new Date(latest.date)) ? distribution : latest;
    }, null);
    return sum + minipool.nodeDepositBalance * latestDistribution.price_usd;
  }, 0);

  var minipoolRPLCapReturned = 0; // To do...

  // Fiat value of all distributed rewards is the same calc as Return of Capital, but for all minipools.
  // Backing out Return of Capital will leave just the distributed rewards since it will be zero for non-finalized minipools.
  // and non-zero for finalized minipools.

  const totalFiatReturned = minipoolHistory.reduce((sum, minipool) => {
    const distributionSum = minipool.distributions.reduce((distSum, distribution) => {
      return distSum + distribution.amount * distribution.price_usd;
    }, 0);
    return sum + distributionSum;
  }, 0);

  //Add up the total from the minipools.
  var minipoolEthDistContinuousRewards = totalFiatReturned - minipoolEthCapReturned;