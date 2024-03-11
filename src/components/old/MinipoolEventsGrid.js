import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
const EVENT_COLS = [
  {
    field: "address",
    headerName: "Minipool",
    align: 'left', 
    flex: 2
  },
  {
    field: "data",
    headerName: "data",
    type: "number",
    align: 'center', 
    flex: 2
  },
  {
    field: "topics",
    headerName: "topics",
    type: "number",
    align: 'center', 
    flex: 1
  },

 

];
function MinipoolEventsGrid({ rows }) {
  if (rows === undefined) {
    return <div>Loading...</div>;
  }
  const columns = EVENT_COLS;
  console.log("EventGrid rows:", rows);
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

export default MinipoolEventsGrid;