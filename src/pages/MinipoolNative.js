
import React, { useContext } from 'react';
import '../App.css';
import APRGrid from "../components/APRGrid";
import Layout from "../components/Layout";
import DataContext from '../components/DataContext';


function MinipoolNative() {
  const { minipoolNativeIRR, displayDetail, nodeAddress, setDisplayDetail } = useContext(DataContext);
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
              <label>
            Display Claimed/Distributed Reward Details:
            <input
              type="checkbox"
              checked={displayDetail}
              onChange={() => setDisplayDetail(!displayDetail)}
            />
          </label>
            {minipoolNativeIRR && <APRGrid tableRows={minipoolNativeIRR} />}
          </section>
        </div>

      </Layout></>
  );
}
export default MinipoolNative;

