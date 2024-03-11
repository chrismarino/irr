import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';

function MyDataGrid() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace these with your actual API calls
        const response1 = await fetch('api1');
        const data1 = await response1.json();

        const response2 = await fetch('api2', data1);
        const data2 = await response2.json();

        // Process the data and create the rows
        const newRows = data2.map((item, index) => ({
          id: index,
          ...item,
        }));

        setRows(newRows);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}

export default MyDataGrid;