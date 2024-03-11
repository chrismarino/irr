import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';

function MyDataGrid() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace this with your actual API endpoint
        const response1 = await fetch('https://api.provider1.com/data');
        const data1 = await response1.json();

        // Use data from response1 as input to the second API call
        // Replace this with your actual API endpoint and data
        const response2 = await fetch(`https://api.provider2.com/data?input=${data1.input}`);
        const data2 = await response2.json();

        // Process the data and create the rows
        // This assumes that data1 and data2 are arrays with the same length
        const newRows = data1.map((item, index) => ({
          id: index,
          ...item,
          ...data2[index],
        }));

        setRows(newRows);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // Replace this with your actual columns
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    // Add more columns here
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}

export default MyDataGrid;