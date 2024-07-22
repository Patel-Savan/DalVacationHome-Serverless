import React, { useState, useEffect } from 'react';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';

const StatusToggle: React.FC = () => {
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to load initial status value from API
    const loadStatus = async () => {
      try {
        const response = await axios.get('https://api.example.com/status'); // Replace with your API endpoint
        setStatus(response.data.active); // Assuming the API returns an object with an 'active' boolean field
      } catch (error) {
        console.error('Error loading status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  const handleToggleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.checked;
    setStatus(newStatus);

    // Function to update status via API call
    try {
      await axios.post('https://api.example.com/update-status', { active: newStatus }); // Replace with your API endpoint
    } catch (error) {
      console.error('Error updating status:', error);
      // Optionally revert status change on error
      setStatus(!newStatus);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box display="flex" alignItems="center">
      <Typography>{status ? 'Active' : 'Inactive'}</Typography>
      <Switch checked={status} onChange={handleToggleChange} />
    </Box>
  );
};

export default StatusToggle;
