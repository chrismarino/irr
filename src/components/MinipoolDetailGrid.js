import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
const APR_COLS = [
  {
    field: "minipoolIndex",
    headerName: "Index",
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
    field: "displayNodeDepositBalance",
    headerName: "displayNodeDepositBalance",
    type: "number",
    align: 'center', 
    flex: 1
  },

  {
    field: "displayNodeRefundBalance",
    headerName: "displayNodeRefundBalance",
    type: "number",
    align: 'center', 
    flex: 3

  },
  {
    field: "displayCalculatedNodeShare",
    headerName: "displayCalculatedNodeShare",
    type: "number",
    align: 'right', 
    flex: 3

  },
  {
    field: "displayNodeBalance",
    headerName: "displayNodeBalance",
    align: 'center', 
    flex: 4
  },
  {
    field: "displayProtocolBalance",
    headerName: "displayProtocolBalance",
    type: "number",
    align: 'right', 
    flex: 3

  },
  {
    field: "displayBalance",
    headerName: "displayBalance",
    align: 'center', 
    type: "number",
    flex: 2

  },

];
function MinipoolDetailGrid({ rows }) {
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
        getRowId={(row) => row.minipoolAddress} // Use minipool property as unique id
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

export default MinipoolDetailGrid;