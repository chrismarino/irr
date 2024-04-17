// CurrentCoinPrices.js
import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

function CurrentCoinPrices({ ethPriceToday, rplPriceToday }) {
  const rows = [
    { id: 1, coin: 'Ethereum', price: (ethPriceToday || 0)},
    { id: 2, coin: 'Rocketpool', price: (rplPriceToday || 0)},
  ];

  const columns = [
    {
      field: 'coin',
      headerName: 'Coin',
      flex: 1,
      align: 'left',
      headerAlign: 'left'
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
  ];

  return (
    <div style={{ height: 400, width: 400 }}>
      <p>Current Prices</p>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={2}
        autoHeight
        pageSizeOptions={[5, 10, 20, 50, 100]}
        style={{ color: 'white' }} // Change font color to red
        rowSelection={false}
        pagination
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
      />

    </div>
  );
}

export default CurrentCoinPrices;