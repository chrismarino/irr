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
//     bool* exists;
//     uint256* registrationTime;
//     string* timezoneLocation;
//     bool* feeDistributorInitialised;
//     address* feeDistributorAddress;
//     uint256* rewardNetwork;
//     uint256* rplStake;
//     uint256* effectiveRPLStake;
//     uint256* minimumRPLStake;
//     uint256* maximumRPLStake;
//     uint256* ethMatched;
//     uint256* ethMatchedLimit;
//     uint256* minipoolCount;
//     uint256* balanceETH;
//     uint256* balanceRETH;
//     uint256* balanceRPL;
//     uint256* balanceOldRPL;
//     uint256* depositCreditBalance;
//     uint256* distributorBalanceUserETH;
//     uint256* distributorBalanceNodeETH;
//     address* withdrawalAddress;
//     address* pendingWithdrawalAddress;
//     bool* smoothingPoolRegistrationState;
//     uint256* smoothingPoolRegistrationChanged;
//     address* nodeAddress;
// }


export default function useNodeDetails(nodeAddress) {
  const [nodeDetails, setNodeDetails] = useState(null);

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

  // Create a new contract instance for the node. Uses the Nodemanager Contract Address, not the node address.
  const node = new ethers.Contract(
    contracts.RocketNodeManager.address,
    nodeInterface,
    provider?.signer || provider
  );

  useEffect(() => {

    const fetchNodeDetails = async () => {
      const details = await node.getNodeDetails(nodeAddress);
      setNodeDetails(details); // create a new object to trigger re-render
    };

    fetchNodeDetails();
  }, [nodeAddress]);
  if (!nodeDetails) {
    return { isLoading: true };
  } else {
    return {
      nodeAddress: nodeAddress,
      balanceRPL: parseFloat(ethers.utils.formatEther(nodeDetails.balanceRPL || 0)).toFixed(4),
      balanceETH: parseFloat(ethers.utils.formatEther(nodeDetails.balanceETH || 0)).toFixed(4),
      effectiveRPLStake: parseFloat(ethers.utils.formatEther(nodeDetails.effectiveRPLStake || 0)).toFixed(4),
      rplStake: parseFloat(ethers.utils.formatEther(nodeDetails.rplStake || 0)).toFixed(4),
      ethMatched: parseFloat(ethers.utils.formatEther(nodeDetails.ethMatched || 0)).toFixed(4),
    }
  };
}




