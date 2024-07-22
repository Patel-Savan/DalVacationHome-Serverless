import React, { useState, useEffect } from 'react';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from 'axios';

interface StatusToggleProps {
  agentId: string;
  onActiveStatusChange: (isActive: boolean) => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ agentId, onActiveStatusChange }) => {
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

    try {
      await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/process-agent-status', {
        agent_id: agentId,
        status: newStatus ? 'active' : 'inactive',
      });
      onActiveStatusChange(newStatus);

      if (!newStatus) {
        // Handle the case when agent marks themselves as inactive
        await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/check-agent-session', {
          agent_id: agentId,
          delete: true
        });
      }
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
