// NodeAddressForm.js
import React from 'react';

function NodeAddressForm({ setNodeAddress, nodeAddress }) {
  return (
    <div>
      <h4>Enter the address of a validator node<br></br>to find its total return</h4>
      <div style={{ fontSize: '18px' }}> {/* Set the font size here */}
      <p>Here are some addresses to try out:</p>
      0x1829f19524429a2edaf07bd13d1e47af19643d9b<br></br>
      0xee43198c3be288fddabafefabbd49f6111b175c5<br></br>
      0x1829f19524429a2edaf07bd13d1e47af19643d9b<br></br>
      </div>
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