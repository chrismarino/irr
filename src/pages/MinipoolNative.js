
import React, { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../App.css';
import APRGrid from "../components/APRGrid";
import Layout from "../components/Layout";
import DataContext from '../components/DataContext';
import NodeAddressForm from "../components/NodeAddressForm";


function MinipoolNative() {
  const { minipoolNativeIRR, progressStatus, nodeAddress, setNodeAddress } = useContext(DataContext);
  const { show, setShow } = useContext(DataContext);
  const handleClose = () => setShow(false);
  //console.log("On Operator Page and minipoolNativeIRR is:", minipoolNativeIRR);

  return (
    <>
      <Layout>
        <div style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Minipool Native Returns</h1>
          {/* <NodeAddressForm />
          <p>Progress Status: {progressStatus}</p> */}
          <section style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3>Node <a href={`https://rocketscan.io/node/${nodeAddress}`} style={{ color: '#72d5fa' }}>
              {nodeAddress}</a></h3>
            {minipoolNativeIRR && <APRGrid tableRows={minipoolNativeIRR} />}
          </section>
        </div>

      </Layout></>
  );
}
export default MinipoolNative;

