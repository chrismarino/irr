import useK from "./useK";
import { useWebSocketProvider } from "wagmi";
import _ from "lodash";
import { ethers } from "ethers";
import contracts from "../contracts";
import { useQueries } from "react-query";
import { useEffect, useState } from 'react';
import RocketMinipoolDelegate from '../generated/contracts/RocketMinipoolDelegate.json';
import RocketNodeDeposit from '../generated/contracts/RocketNodeDeposit.json';
// A React hook that finds Deposit Events for a given node address
// Returns an object with the following properties:{
//     isLoading: boolean;
// }


export default function useNodeDeposits(nodeAddress) {
  const [nodeDeposits, setNodeDeposits] = useState(null);

  let provider = useWebSocketProvider();

  // Set the interface for NodeDeposits contract
  let nodeInterface = new ethers.utils.Interface(
    contracts.RocketNodeDeposit.abi
  );

  // Create a new contract instance for the node. Uses the NodeDeposit Contract Address, not the node address.
  const node = new ethers.Contract(
    contracts.RocketNodeDeposit.address,
    nodeInterface,
    provider?.signer || provider
  );

  useEffect(() => {
    if (!nodeAddress) return;
    const fetchNodeDeposits = async () => {
      const filterDeposits = node.filters.DepositReceived(nodeAddress, null, null);
      const depositeEvents = await node.queryFilter(filterDeposits);
      const decodedDeposits = depositeEvents.map(log => {
        const { name, args } = nodeInterface.parseLog(log);

        // Convert args
        const amount = args.amount;
        const timestamp = new Date(args.time * 1000);
        return { name, amount, timestamp };
      });
      setNodeDeposits(decodedDeposits);
    };

    fetchNodeDeposits();
  }, [nodeAddress]);
  
  if (!nodeDeposits) {
    return { isLoading: true };
  } else {
    const deposits = nodeDeposits.map(deposit => ({
      ...deposit,
      amount: Number(deposit.amount) / 1E18,
    }));
    return {
      isLoading: false,
      deposits: deposits,
      // Convert the balance from wei to ether
      // balanceRPL: parseFloat(ethers.utils.formatEther(NodeDeposits.balanceRPL || 0)).toFixed(4),

    }
  };
}




