import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';

interface AgentChatBoxProps {
  sessionId: string;
  agentId: string;
}

interface Message {
  message: string;
  sender_id: string;
  timestamp: any;
}

const AgentChatBox: React.FC<AgentChatBoxProps> = ({ sessionId, agentId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/get-session-messages', { session_id: sessionId });
        const sortedMessages = response.data.messages.sort((a: Message, b: Message) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        setMessages(sortedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [sessionId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    try {
      await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/process-agent-message', {
        session_id: sessionId,
        sender_id: agentId,
        message: newMessage,
      });
      setNewMessage('');
      const response = await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/get-session-messages', { session_id: sessionId });
      const sortedMessages = response.data.messages.sort((a: Message, b: Message) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      border={1}
      borderColor="grey.500"
      borderRadius="8px"
      padding="16px"
      width="600px"
      height="600px"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Typography variant="h6" gutterBottom>
        Agent Chat
      </Typography>
      <Box display="flex" flexDirection="column" flexGrow={1} overflow="auto">
        {messages.map((msg, index) => (
          <Box
            key={index}
            alignSelf={msg.sender_id === agentId ? 'flex-end' : 'flex-start'}
            bgcolor={msg.sender_id === agentId ? 'blue' : 'grey'}
            color={msg.sender_id === agentId ? 'white' : 'black'}
            borderRadius="8px"
            padding="8px"
            margin="4px 0"
            maxWidth="80%"
          >
            <Typography variant="body1">{msg.message}</Typography>
            <Typography variant="caption" display="block" align="right">
              {new Date(msg.timestamp).toLocaleString()}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box display="flex" alignItems="center" mt={2}>
        <TextField
          label="Type a message"
          variant="outlined"
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ ml: 1 }}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default AgentChatBox;