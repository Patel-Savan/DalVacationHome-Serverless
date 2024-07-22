import React, { useEffect, useState } from 'react';
import StatusToggle from '../Components/StatusToggle';
import AgentChatBox from '../Components/AgentChatBox';
import Navbar from '../Components/Navbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import axios from 'axios';

const AgentChatPage: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const agentId = 'agent100';  // TODO: Replace with the actual agent ID

  useEffect(() => {
    if (sessionId) return; // If sessionId is already set, no need to check again

    const checkActiveSessions = async () => {
      try {
        const response = await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/check-agent-session', { agent_id: agentId });
        if (response.data.sessionId) {
          setSessionId(response.data.sessionId);
          setError(null);
        } else {
          setError('No active session found');
          setTimeout(checkActiveSessions, 120000); // Retry after 2 minutes if no active session found
        }
      } catch (error) {
        console.error('Error checking active sessions:', error);
        setError('No active session found');
        setTimeout(checkActiveSessions, 120000); // Retry after 2 minutes on error
      }
    };

    checkActiveSessions();
  }, [agentId, sessionId]);

  const handleActiveStatusChange = (isActive: boolean) => {
    if (isActive) {
      setSessionId(null); // Reset sessionId to trigger session check
      setError('Checking for active session...');
    }
  };

  return (
    <>
      <Navbar />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        gap="20px"
      >
        <Typography variant="body1" fontWeight="bold">
          Toggle to Active to be considered for Live Chat! Or to Inactive to Take a Break!
        </Typography>
        <StatusToggle agentId={agentId} onActiveStatusChange={handleActiveStatusChange} />
        {sessionId ? (
          <AgentChatBox sessionId={sessionId} agentId={agentId} />
        ) : (
          <Typography>{error || 'Checking for active session...'}</Typography>
        )}
      </Box>
    </>
  );
};

export default AgentChatPage;
