import React, { useContext, useRef } from 'react';
import DataContext from './DataContext';

function NodeAddressForm() {
  const { setNodeAddress, nodeAddress, setNodeDetails, setGotNodeDetails, setNodeNativeIRR, setMinipoolNativeIRR, setMinipoolFiatIRR, setTotalNodeAPR, setDone } = useContext(DataContext);
  const prevNodeAddress = useRef(nodeAddress);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h4>Enter a Rocket Pool node address</h4>
      <div style={{ fontSize: '18px' }}> {/* Set the font size here */}
      </div>
      <form
        onSubmit={event => {
          event.preventDefault();
          const address = event.target.elements.nodeAddress.value;
          const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
          if (isValidAddress && address !== prevNodeAddress.current) {
            setNodeAddress(address);
            setNodeNativeIRR([]); // Reset the APR table
            setMinipoolNativeIRR([]); // Reset the APR table
            setTotalNodeAPR([]); // Reset the APR table
            setMinipoolFiatIRR([]); // Reset the APR table
            setNodeDetails([]) // Reset the node details.
            setDone([]) // Reset the node details.
            setGotNodeDetails(false);
            prevNodeAddress.current = address;
          } else {
            //setNodeAddress("");
            console.error('Invalid address in NodeAddressForm');
          }
        }}
      >
        <input
          type="text"
          name="nodeAddress"
          defaultValue={nodeAddress}
          onClick={event => event.target.select()}
          placeholder="Enter node address"
          style={{ marginRight: '10px', width: '330px' }}
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
}

export default NodeAddressForm;