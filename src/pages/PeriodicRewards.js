import Layout from "../components/Layout";
import React, { useContext } from 'react';
import '../App.css';
import NodePeriodicRewardsTable from "../components/NodePeriodicRewardsTable";
import DataContext from '../components/DataContext';

function Rewards() {
  const { nodeAddress } = useContext(DataContext);

  return (
    <Layout>
      <div style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1>Rocket Pool Node Returns</h1>

        <section style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3>Node <a href={`https://rocketscan.io/node/${nodeAddress}`} style={{ color: '#72d5fa' }}>
            {nodeAddress}</a></h3>
          <h1>Periodic Rewards: Operator</h1>
          <NodePeriodicRewardsTable
            sx={{ mb: 5, border: 0 }}
            header={"header"}
          />
        </section>
      </div>
    </Layout>
  );
}


export default Rewards;