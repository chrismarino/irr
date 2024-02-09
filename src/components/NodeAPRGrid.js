import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
const APR_COLS = [
  {
    field: "minipool",
    headerName: "Minipool",
    // width: 165,
  },
  {
    field: "status",
    headerName: "Status",
    type: "number",
    renderCell: (params) => (params.value ? 'Active' : 'Exited'),
    //width: 120,
  },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    //width: 120,
  },

  {
    field: "eth_deposited",
    headerName: "Eth Deposited",
    type: "number",
    //width: 120,

  }, 
  {
    field: "eth_earned",
    headerName: "Eth Earned",
    type: "number",
    //width: 120,

  },
  {
    field: "eth_apr",
    headerName: "Eth APR",
    //width: 195,
  },
  {
    field: "fiat_gain",
    headerName: "Fiat Gain",
    type: "number",
    //width: 120,

  }, 
  {
    field: "fiat_apr",
    headerName: "Fiat APR",
    type: "percent",
   // width: 120,

  },

];
function NodeAPRGrid({ rows }) {
if (rows === undefined) {
    return <div>Loading...</div>;
  }
const columns = APR_COLS;
console.log("NodeAPRGrid rows:", rows);
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid 
      rows={rows} 
      columns={columns} 
      pageSize={10} 
      getRowId={(row) => row.minipool} // Use minipool property as unique id
      style={{ color: 'white' }} // Change font color to red
      />
    </div>
  );
}

export default NodeAPRGrid;