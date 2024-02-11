// NodeAddressForm.js
import React from 'react';

function NodeAddressForm({ setNodeAddress, nodeAddress }) {
  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        setNodeAddress(event.target.elements.nodeAddress.value);
      }}
    >
      <input
        type="text"
        name="nodeAddress"
        defaultValue={nodeAddress}
        onClick={event => event.target.select()}
        placeholder="Enter node address"
      />
      <button type="submit">Enter</button>
    </form>
  );
}

export default NodeAddressForm;