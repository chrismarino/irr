
import React, { useContext } from 'react';
import '../App.css';
import WalletTable from '../components/WalletTable';
import NodeAddressForm from "../components/NodeAddressForm";
import Layout from "../components/Layout";
import DataContext from '../components/DataContext';


function NodeNative() {
  const { nodeAddress, done, nodeNativeIRR, progressStatus } = useContext(DataContext);

  return (
    <>
      <Layout>
        <div style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Rocket Pool Node Native Returns</h1>
          <h4 style={{ textAlign: 'center' }}>
          Early Alpha Release. <br></br>
            See open <a href="https://github.com/chrismarino/rocketreturns/issues" style={{ color: '#72d5fa' }}>issues</a> for details.
          </h4>
          <NodeAddressForm />
          {done !== 'Done' && nodeAddress !== '' ? (
            <p>Progress Status: {progressStatus}</p>
          ) : null}
          <section style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {done === 'Done' ? (
              <>
                <h3>Node <a href={`https://rocketscan.io/node/${nodeAddress}`} style={{ color: '#72d5fa' }}>{nodeAddress}</a></h3>
                <WalletTable tableRows={nodeNativeIRR} />
              </>
            ) : null}

          </section>

          {/* <section style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3>Node <a href={`https://rocketscan.io/node/${nodeAddress}`} style={{ color: '#72d5fa' }}>
              {nodeAddress}</a></h3>
            <WalletTable tableRows={nodeNativeIRR} />
          </section> */}

        </div>

      </Layout></>
  );
}
export default NodeNative;

