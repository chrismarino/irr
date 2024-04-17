import Layout from "../components/Layout";
import { BrowserRouter, HashRouter, Route, Routes, Link } from "react-router-dom";
import React, { useContext } from 'react';
import '../App.css';
import NodeAddressForm from "../components/NodeAddressForm";
import NodePeriodicRewardsTable from "../components/NodePeriodicRewardsTable";
import { useState, useEffect, useRef } from 'react';
import DataContext from '../components/DataContext';

function Rewards() {
  const { totalNodeAPR, progressStatus, nodeAddress, setNodeAddress } = useContext(DataContext);
  const { show, setShow } = useContext(DataContext);
  const handleClose = () => setShow(false);
  return (
    <Layout>
      <div style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1>Rocket Pool Node Returns</h1>
          {/* <NodeAddressForm />
          <p>Progress Status: {progressStatus}</p> */}
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