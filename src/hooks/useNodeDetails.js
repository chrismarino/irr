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
  const node = new ethers.Contract(
    contracts.RocketNodeManager.address,
    nodeInterface,
    provider?.signer || provider
  );

  useEffect(() => {

    const fetchNodeDetails = async () => {
      const details = await node.getNodeDetails(nodeAddress);
      setNodeDetails(details);
    };

    fetchNodeDetails();
  }, [nodeAddress]);
return  nodeDetails

  // if(!nodeDetails) return [
  //   { name: 'balanceRPL', value: (nodeDetails.balanceRPL || 0)},
  //   { name: 'balanceETH', value: (nodeDetails.balanceETH  || 0)},
  //   { name: 'effectiveRPLStake', value: (nodeDetails.effectiveRPLStake || 0) },
  //   { name: 'rplStake', value: (nodeDetails.rplStake  || 0)},
  // ];

}
