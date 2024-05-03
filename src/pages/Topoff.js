import React from 'react';
import Layout from "../components/Layout";
import TopoffTable from '../components/TopoffTable';
import DataContext from '../components/DataContext';
import {useContext } from 'react';

function RPLvETH() {
  const {nodeAddress } = useContext(DataContext);
  return (
    <Layout>
    <div style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Rocket Pool Node Returns</h1>
          <section style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3>Node <a href={`https://rocketscan.io/node/${nodeAddress}`} style={{ color: '#72d5fa' }}>
              {nodeAddress}</a></h3>
              <h1 style={{ textAlign: 'center' }}>RPL Topoff Events TBD</h1>
           {<TopoffTable tableRows={[]} />}
           </section>
        </div>
    </Layout>
  );
}

export default RPLvETH;