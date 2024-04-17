
import React, { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../App.css';
import WalletTable from '../components/WalletTable';
import NodeAddressForm from "../components/NodeAddressForm";
import Layout from "../components/Layout";
import DataContext from '../components/DataContext';
import CalcNodeIRRs from '../components/CalcNodeIRRs';


function NodeFiat() {
  const { nodePeriodicRewards, nodeAddress, done, nodeFiatIRR, progressStatus } = useContext(DataContext);
  const { show, setShow } = useContext(DataContext);
  const handleClose = () => setShow(false);
  //CalcNodeIRRs(); // will this work?
  let count = progressStatus

  return (
    <><Modal show={show} onHide={handleClose} className="d-flex align-items-start justify-content-center my-modal">
      <Modal.Header closeButton>
        <Modal.Title>Rate Limit Exceeded</Modal.Title>
      </Modal.Header>
      <Modal.Body>Rate Limited. Trying Again.</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
      <Layout>
        <div style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Rocket Pool Node Fiat Returns</h1>
          <h4 style={{ textAlign: 'center' }}>
            Early Alpha Release.<br></br>Known problems for nodes with more than 5 minipools. <br></br>
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
                <WalletTable tableRows={nodeFiatIRR} />
              </>
            ) : null}
          </section>


          {/* <section style={{ width: 'flex', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3>Node <a href={`https://rocketscan.io/node/${nodeAddress}`} style={{ color: '#72d5fa' }}>
              {nodeAddress}</a></h3>
            <WalletTable tableRows={nodeFiatIRR} />
          </section> */}
        </div>

      </Layout></>
  );
}
export default NodeFiat;

