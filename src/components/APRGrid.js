import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
const APR_COLS = [
  {
    field: "minipool",
    headerName: "Minipool",
    align: 'left', 
    flex: 2
  },
  {
    field: "status",
    headerName: "Status",
    type: "number",
    renderCell: (params) => (params.value ? 'Active' : 'Exited'),
    align: 'center', 
    flex: 2
  },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    align: 'center', 
    flex: 1
  },

  {
    field: "eth_deposited",
    headerName: "Eth Deposited",
    type: "number",
    align: 'center', 
    flex: 3

  },
  {
    field: "eth_earned",
    headerName: "Eth Earned",
    type: "number",
    align: 'right', 
    flex: 3

  },
  {
    field: "eth_apr",
    headerName: "Eth APR",
    align: 'center', 
    flex: 2
  },
  {
    field: "fiat_gain",
    headerName: "Fiat Gain",
    type: "number",
    align: 'right', 
    flex: 3

  },
  {
    field: "fiat_apr",
    headerName: "Fiat APR",
    align: 'center', 
    type: "percent",
    flex: 2

  },

];
function APRGrid({ rows }) {
  if (rows === undefined) {
    return <div>Loading...</div>;
  }
  const columns = APR_COLS;
  //console.log("APRGrid rows:", rows);
  return (
    <div style={{ height: 400, width: 800 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        getRowId={(row) => row.minipool} // Use minipool property as unique id
        pageSizeOptions={[5, 10, 20, 50, 100]}
        style={{ color: 'white' }} // Change font color to red
        rowSelection={false}
        autoHeight
        pagination
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
      />
    </div>
  );
}

export default APRGrid;