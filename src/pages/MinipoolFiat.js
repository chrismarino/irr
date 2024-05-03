
import React, { useContext } from 'react';
import '../App.css';
import APRGrid from "../components/APRGrid";
import Layout from "../components/Layout";
import DataContext from '../components/DataContext';


function MinipoolFiat() {
  const { minipoolFiatIRR, displayDetail, nodeAddress, setDisplayDetail } = useContext(DataContext);
  // console.log("On Protocl Page and minipoolNativeIRR is:", minipoolFiatIRR);

  return (
    <>
      <Layout>
        <div style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Minipool Fiat Returns</h1>

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
            {minipoolFiatIRR && <APRGrid tableRows={minipoolFiatIRR} />}
          </section>
        </div>

      </Layout></>
  );
}
export default MinipoolFiat;

