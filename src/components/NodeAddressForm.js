// NodeAddressForm.js
import React from 'react';

function NodeAddressForm({ setNodeAddress, nodeAddress }) {
  return (
    <div>
      <p></p><h3>Enter the address of a validator node<br></br>to find its total return</h3>
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
          style={{ marginRight: '10px' , width: '330px' }}
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
}

export default NodeAddressForm;