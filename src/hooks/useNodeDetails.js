import useK from "./useK";
import { useWebSocketProvider } from "wagmi";
import _ from "lodash";
import { ethers } from "ethers";
import contracts from "../contracts";
import { useQueries } from "react-query";
import { useEffect, useState } from 'react';
import RocketMinipoolDelegate from '../generated/contracts/RocketMinipoolDelegate.json'; 
import RocketNodeManager from '../generated/contracts/RocketNodeManager.json';
// A React hook that finds the Creation Event for each minipool on a Node and also fetches the 
// details of a node. Returns an array of minipool addresses and the node details
// struct NodeDetails {
//     bool exists;
//     uint256 registrationTime;
//     string timezoneLocation;
//     bool feeDistributorInitialised;
//     address feeDistributorAddress;
//     uint256 rewardNetwork;
//     uint256 rplStake;
//     uint256 effectiveRPLStake;
//     uint256 minimumRPLStake;
//     uint256 maximumRPLStake;
//     uint256 ethMatched;
//     uint256 ethMatchedLimit;
//     uint256 minipoolCount;
//     uint256 balanceETH;
//     uint256 balanceRETH;
//     uint256 balanceRPL;
//     uint256 balanceOldRPL;
//     uint256 depositCreditBalance;
//     uint256 distributorBalanceUserETH;
//     uint256 distributorBalanceNodeETH;
//     address withdrawalAddress;
//     address pendingWithdrawalAddress;
//     bool smoothingPoolRegistrationState;
//     uint256 smoothingPoolRegistrationChanged;
//     address nodeAddress;
// }


export default function useNodeDetails(nodeAddress) {
  let { data: minipools } = useK.RocketMinipoolManager.Find.MinipoolCreated({
    args: [null, nodeAddress],
    from: 0,
    to: "latest",
  });
  let provider = useWebSocketProvider();

// Find the minipool addresses....
  let minipoolAddresses = _.uniq(
    (minipools || []).map(({ args: [minipoolAddress] }) => minipoolAddress)
  );
  // Set the interface for NodeDetails contract
  let nodeInterface = new ethers.utils.Interface(
    contracts.RocketNodeManager.abi
  );

  // For very large nodes we can't load all minipools at once without hitting rate limits.
  // But most nodes are smaller and they can be loaded at once.
  // So we aggressively load the first minipools for a node and then spread out the remainder.
  // Thus, most nodes load right away and larger nodes load over a predictable loading window.



  let details = useQueries(
    minipoolAddresses.map((minipoolAddress, i) => ({
      queryKey: ["MinipoolDetails", minipoolAddress],
      queryFn: async () => {

        const mp = new ethers.Contract(
          minipoolAddress,
          mpDelegateInterface,
          provider?.signer || provider
        );
        // Note: we don't Promise.all these reads to be gentler on the rate-limit.
        // TODO: issue a multi-read call instead.
        // get the events for the minipool
        const contract = new ethers.Contract(minipoolAddress, RocketMinipoolDelegate.abi, provider);
        //const iface = new ethers.utils.Interface(contract.interface);
        const filterWithdrawn = contract.filters.EtherWithdrawn(null, null);
        const filterDeposited = contract.filters.EtherDeposited(null, null);
        const etherWithdrawnEvents = await contract.queryFilter(filterWithdrawn);
        const etherDepositedEvents = await contract.queryFilter(filterDeposited);
        const decodedWithdrawnEvents = etherWithdrawnEvents.map(log => {
          const { name, args } = mpDelegateInterface.parseLog(log);

          // Convert args
          const amount = args.amount;
          const timestamp = new Date(args.time * 1000);
          return { name, amount, timestamp };
        });
        const decodedDepositedEvents = etherDepositedEvents.map(log => {
          const { name, args } = mpDelegateInterface.parseLog(log);

          // Convert args
          const amount = args.amount;
          const timestamp = new Date(args.time * 1000);
          return { name, amount, timestamp };
        });
        // get the details for the minipool
        let isFinalized = await mp.getFinalised();
        let nodeRefundBalance = await mp.getNodeRefundBalance();
        let version = await mp.version();
        let status = await mp.getStatus();
        //let minipoolIndex = await mp._index;
        let nodeDepositBalance = await mp.getNodeDepositBalance();
        let balance = await provider.getBalance(minipoolAddress);

        let balanceLessRefund = balance.sub(nodeRefundBalance);
        let calculatedNodeShare = ethers.constants.Zero;
        if (balanceLessRefund.gt(ethers.constants.Zero)) {
          calculatedNodeShare = await mp.calculateNodeShare(balanceLessRefund);
        }
        let nodeBalance = ethers.BigNumber.from(nodeRefundBalance || "0").add(
          ethers.BigNumber.from(calculatedNodeShare || "0")
        );
        let protocolBalance = balance.sub(nodeBalance);
        balance = balance.toHexString();
        nodeDepositBalance = nodeDepositBalance.toHexString();
        nodeRefundBalance = nodeRefundBalance.toHexString();
        calculatedNodeShare = calculatedNodeShare.toHexString();
        nodeBalance = nodeBalance.toHexString();
        protocolBalance = protocolBalance.toHexString();
        let displayTotalWithdrawals = _.sumBy(decodedWithdrawnEvents, event => Number(event.amount))/1E18;
        let displayTotalDeposits = _.sumBy(decodedDepositedEvents, event => Number(event.amount))/1E18;
        let displayBalance = parseFloat(ethers.utils.formatEther(balance || 0)).toFixed(4);
        let displayNodeDepositBalance = parseFloat(ethers.utils.formatEther(nodeDepositBalance || 0)).toFixed(4);
        let displayNodeRefundBalance = parseFloat(ethers.utils.formatEther(nodeRefundBalance || 0)).toFixed(4);
        let displayCalculatedNodeShare = parseFloat(ethers.utils.formatEther(calculatedNodeShare || 0)).toFixed(4);
        let displayNodeBalance = parseFloat(ethers.utils.formatEther(nodeBalance || 0)).toFixed(4);
        let displayProtocolBalance = parseFloat(ethers.utils.formatEther(protocolBalance || 0)).toFixed(4);
        let upgraded = version > 2;

        return {
          minipoolAddress,
          displayBalance,
          displayNodeDepositBalance,
          displayNodeRefundBalance,
          displayCalculatedNodeShare,
          displayNodeBalance,
          displayProtocolBalance,
          status,
          isFinalized,
          upgraded,
          displayTotalDeposits,
          displayTotalWithdrawals,
        };
      },
    }))
  );
  return minipoolAddresses.map(
    (minipoolAddress, i) => ({
      minipoolAddress,
      ...(details[i].data || { isLoading: true }),
    }),
    []
  );
}
