import useK from "./useK";
import { useWebSocketProvider } from "wagmi";
import _ from "lodash";
import { ethers } from "ethers";
import contracts from "../contracts";
import { useQuery } from "react-query";
import { useContext, useRef } from 'react';
import DataContext from '../components/DataContext';

export default function useMinipoolHistory(nodeAddress) {
  const { setProgressStatus, ethPriceHistory } = useContext(DataContext);
  const prevNodeAddress = useRef(null);
  let { data: minipools } = useK.RocketMinipoolManager.Find.MinipoolCreated({
    args: [null, nodeAddress],
    from: 0,
    to: "latest",
  });
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  let provider = useWebSocketProvider();
  let minipoolAddresses = _.uniq(
    (minipools || []).map(({ args: [minipoolAddress] }) => minipoolAddress)
  );
  const fetchAllMinipoolHistories = async (addresses) => {
    if (
      (prevNodeAddress.current === nodeAddress) &&
      (
        (!minipools || minipools.length === 0) || (ethPriceHistory && ethPriceHistory.length > 0)
      )
    ) {
      return;
    }

    const results = [];
    for (let i = 0; i < addresses.length; i++) {
      console.log("Fetching minipool history for", addresses[i], "Waiting .25 seconds...");
      const result = await fetchMinipoolHistory(addresses[i], ethPriceHistory, provider);
      await delay(250);
      setProgressStatus("Working on Minipool History. " + (i+1) + " of " + addresses.length);
      prevNodeAddress.current = nodeAddress; // set the previous node address
      results.push(result);
    }

    return results;
  };

  const { data: details, status, error } = useQuery(
    ["MinipoolHistories", minipoolAddresses],
    () => fetchAllMinipoolHistories(minipoolAddresses, ethPriceHistory, provider)
  );
  return details;

}

const fetchMinipoolHistory = async (minipoolAddress, ethPriceHistory, provider) => {
  let mpDelegateInterface = new ethers.utils.Interface(
    contracts.RocketMinipoolDelegate.abi
  );
  const mp = new ethers.Contract(
    minipoolAddress,
    mpDelegateInterface,
    provider?.signer || provider
  );
  // Note: we don't Promise.all these reads to be gentler on the rate-limit.
  // TODO: issue a multi-read call instead.
  // get the events for the minipool
  const filterWithdrawn = mp.filters.EtherWithdrawn(null, null);
  const filterDeposited = mp.filters.EtherDeposited(null, null);
  const etherWithdrawnEvents = await mp.queryFilter(filterWithdrawn);
  const etherDepositedEvents = await mp.queryFilter(filterDeposited);
  // fetch the events for the minipool put them in a try/catch block
  let distributions = [];
  let deposits = [];
  try {
    distributions = await Promise.all(etherWithdrawnEvents.map(async (log) => {
      const { name, args } = mpDelegateInterface.parseLog(log);

      // Convert args
      const amount = Number(args.amount) / 1E18;
      let timeStamp = args.time.toNumber();
      let date = new Date(args.time * 1000);
      date = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      // Need YYYY-MM-DD format for getPriceOnDate
      let price_usd = ethPriceHistory.find(price => price.date === date)?.price_usd;
      return { name, timeStamp, date, amount, price_usd };
    }));
    //await delay(100);
    deposits = await Promise.all(etherDepositedEvents.map(async (log) => {
      const { name, args } = mpDelegateInterface.parseLog(log);

      // Convert args
      const amount = Number(args.amount) / 1E18;
      let timeStamp = args.time.toNumber();
      let date = new Date(args.time * 1000);
      date = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      // Need YYYY-MM-DD format for getPriceOnDate
      let price_usd = ethPriceHistory.find(price => price.date === date)?.price_usd;
      return { name, timeStamp, date, amount, price_usd };
    }));
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log('Hit rate limit: ', error);
    } else {
      console.error("Failed getting minipool deposit and withdrawal events:", error);
    }
  }
  // get the details for the minipool
  let isFinalized = await mp.getFinalised();
  let nodeRefundBalance = await mp.getNodeRefundBalance();
  let version = await mp.version();
  let status = await mp.getStatus();
  let statusTime = await mp.getStatusTime();
  //let minipoolIndex = await mp._index;
  let nodeDepositBalance = await mp.getNodeDepositBalance();
  let nodeFee = await mp.getNodeFee();
  let mpBalance = await provider.getBalance(minipoolAddress);

  let balanceLessRefund = mpBalance.sub(nodeRefundBalance);
  let calculatedNodeShare = ethers.constants.Zero;
  if (balanceLessRefund.gt(ethers.constants.Zero)) {
    calculatedNodeShare = await mp.calculateNodeShare(balanceLessRefund);
  }
  let nodeBalance = ethers.BigNumber.from(nodeRefundBalance || "0").add(
    ethers.BigNumber.from(calculatedNodeShare || "0")
  );
  let protocolBalance = mpBalance.sub(nodeBalance);
  mpBalance = mpBalance.toHexString();
  nodeDepositBalance = nodeDepositBalance.toHexString();
  nodeFee = nodeFee.toHexString();
  nodeRefundBalance = nodeRefundBalance.toHexString();
  calculatedNodeShare = calculatedNodeShare.toHexString();
  nodeBalance = nodeBalance.toHexString();
  protocolBalance = protocolBalance.toHexString();
  let totalDistributions = distributions ? _.sumBy(distributions, 'amount') : 0;
  let totalDeposits = deposits ? _.sumBy(deposits, 'amount') : 0;
  //console.log("minipool", minipoolAddress, "distributions", distributions, "deposits", deposits);
  // parse the events so we can display them in the UI
  mpBalance = parseFloat(ethers.utils.formatEther(mpBalance || 0)).toFixed(6);
  nodeFee = parseFloat(ethers.utils.formatEther(nodeFee || 0)).toFixed(6);
  nodeDepositBalance = parseFloat(ethers.utils.formatEther(nodeDepositBalance || 0)).toFixed(6);
  nodeRefundBalance = parseFloat(ethers.utils.formatEther(nodeRefundBalance || 0)).toFixed(6);
  calculatedNodeShare = parseFloat(ethers.utils.formatEther(calculatedNodeShare || 0)).toFixed(6);
  nodeBalance = parseFloat(ethers.utils.formatEther(nodeBalance || 0)).toFixed(6);
  protocolBalance = parseFloat(ethers.utils.formatEther(protocolBalance || 0)).toFixed(6);
  let upgraded = version > 2;
  minipoolAddress = String(minipoolAddress).toLowerCase();
  const result = {
    minipoolAddress,
    mpBalance,
    nodeDepositBalance,
    nodeRefundBalance,
    calculatedNodeShare,
    nodeBalance,
    nodeFee,
    protocolBalance,
    status,
    statusTime,
    isFinalized,
    upgraded,
    deposits, // there will be only 2 deposits when a minipool is created
    totalDeposits,
    distributions, // There will be a distribution when the minipool exits
    totalDistributions,
  };
  await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second
  return result;
};