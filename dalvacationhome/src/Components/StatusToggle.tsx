import React, { useState, useEffect } from 'react';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';

interface StatusToggleProps {
  agentId: string;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ agentId }) => {
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to load initial status value from API
    const loadStatus = async () => {
      try {
        const response = await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/process-agent-status', { agent_id: agentId });
        setStatus(response.data.status === 'active');
      } catch (error) {
        console.error('Error loading status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [agentId]);

  const handleToggleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.checked;
    setStatus(newStatus);

    // Function to update status via API call
    try {
      await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/process-agent-status', {
        agent_id: agentId,
        status: newStatus ? 'active' : 'inactive',
      });
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
