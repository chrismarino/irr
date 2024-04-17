import { useWebSocketProvider } from "wagmi";
import React from "react";
import { ethers } from "ethers";
import contracts from "../contracts";
import { useEffect, useState } from 'react';
//
// A React hook that finds the staking events for each minipool on a Node. Returns an array of minipool addresses and the staked deposits



export default function useStakedRPLDeposits(nodeAddress, rplPriceHistory) {
  const [stakedRPLDeposits, setStakedRPLDeposits] = useState(null);

  let provider = useWebSocketProvider();
  let nodeInterface = new ethers.utils.Interface(
    contracts.RocketNodeStaking.abi
  );
  // Set the interface for StakedDeposits contract
  const node = React.useMemo(() => {
    //console.log('Creating new Node Interface:', nodeInterface);
    // Create a new contract instance for the node. Uses the Nodemanager Contract Address, not the node address.
    return new ethers.Contract(
      contracts.RocketNodeStaking.address,
      nodeInterface,
      provider?.signer || provider
    );
  }, [provider]);

  useEffect(() => {
    const fetchStakedRPLDeposits = async () => {
      const maxRetries = 5;
      const delay = 500; // Delay in milliseconds
      const filterRPLStaked = node.filters.RPLStaked(nodeAddress, null, null);
      const stakedRPLDeposits = await node.queryFilter(filterRPLStaked);
      //console.log('Staked RPL Deposits:', stakedRPLDeposits);
      let details
      let deposits = [];
      try {
        deposits = await Promise.all(stakedRPLDeposits.map(async (log) => {
          const { name, args } = nodeInterface.parseLog(log);

          // Convert args
          const amount = Number(args.amount) / 1E18;
          let timeStamp = args.time.toNumber();
          let date = new Date(args.time * 1000);
          date = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
          // Need YYYY-MM-DD format for getPriceOnDate
          let price_usd = rplPriceHistory.find(price => price.date === date)?.price_usd;
          return { name, timeStamp, date, amount, price_usd };
        }));
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.log('Hit rate limit: ', error);
        } else {
          console.error("Failed getting RPL Staking events:", error);
        }
      }
      setStakedRPLDeposits(deposits);
    };

    fetchStakedRPLDeposits();
  }, [nodeAddress]);
  return stakedRPLDeposits;
}