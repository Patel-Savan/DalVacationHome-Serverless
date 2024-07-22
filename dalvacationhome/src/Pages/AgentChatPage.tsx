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
    const checkActiveSessions = async () => {
      try {
        const response = await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/check-agent-session', { agent_id: agentId });
        setSessionId(response.data.sessionId);
      } catch (error) {
        console.error('Error checking active sessions:', error);
        setError('No active session found');
      }
    };

    checkActiveSessions();
  }, [agentId]);

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
        <StatusToggle agentId={agentId} />
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
