import React, { useState, useRef, useLayoutEffect } from "react";
import { styled, Tooltip, IconButton, Button, TextField } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import AWS from "aws-sdk";
import axios from "axios";
import { readLocalStorage, getRandomString } from '../utils/utils';

const ChatButton = styled(Button)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: theme.spacing(8),
  height: theme.spacing(8),
  borderRadius: "50%",
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.secondary.dark,
  },
}));

const ChatBox = styled("div")(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: 300,
  height: 400,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),
}));

const ChatHeader = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
});

const ChatBody = styled("div")({
  flexGrow: 1,
  overflowY: "auto",
  marginBottom: 8,
});

const ChatFooter = styled("div")({
  display: "flex",
});

const ChatInput = styled(TextField)({
  flexGrow: 1,
  marginRight: 8,
});

const MessageContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
});

const UserMessage = styled("div")({
  alignSelf: "flex-end",
  backgroundColor: "#e1ffc7",
  borderRadius: 8,
  padding: 8,
  marginBottom: 8,
  maxWidth: "80%",
});

const BotMessage = styled("div")({
  alignSelf: "flex-start",
  backgroundColor: "#f1f1f1",
  borderRadius: 8,
  padding: 8,
  marginBottom: 8,
  maxWidth: "80%",
});

interface Message {
  sender: "user" | "bot";
  content: string;
}

interface AgentMessage {
  message: string;
  sender_id: string;
  timestamp: any;
}

const ChatbotUI: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [connectedToAgent, setConnectedToAgent] = useState<boolean>(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const userId: string = readLocalStorage("username") || getRandomString(10);

  AWS.config.update({
    region: "us-east-1",
    credentials: new AWS.Credentials(
      "AKIAUOM77AWAYOO56DUU",
      "neV0ySnwh0yreD66NnwaLCDqWdS8CAdWExNpOuw0"
    ),
  });

  const lexruntime = new AWS.LexRuntimeV2();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const fetchSessionMessages = async () => {
    try {
      // Fetch messages from the server for the given session
      const response = await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/get-session-messages', { session_id: "session_122" });
  
      // Sort messages by timestamp
      const sortedMessages = response.data.messages.sort((a: AgentMessage, b: AgentMessage) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
  
      // Map sorted messages to the format expected by the chat component
      const newMessages = [
        // Always add the "connected" message at the beginning
        { sender: "bot", content: "You are now connected with an agent." },
        ...sortedMessages.map((msg: any) => ({
          sender: msg.sender_id === userId ? "user" : "bot",
          content: msg.message,
        }))
      ];
  
      // Update the messages state with the new messages
      setMessages(newMessages);
  
      // Scroll to the bottom of the chat to show the latest message
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };    

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    try {
      await axios.post('https://us-central1-dalvacationhome-dev.cloudfunctions.net/publish-to-customer-message-topic', {
        session_id: "session_122",
        sender_id: userId,
        message: input,
      });
      setInput('');
      fetchSessionMessages();
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

  const handleSend = () => {
    const userMessage: Message = { sender: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
  
    const params = {
      botAliasId: "TSTALIASID",
      botId: "LUDGJ0UHVZ",
      text: input,
      sessionId: userId,
      localeId: "en_US",
    };
  
    lexruntime.recognizeText(params, (err, data) => {
      if (err) {
        console.error("AWS Lex Error:", err);
        const botMessage: Message = {
          sender: "bot",
          content: "Something went wrong.",
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        const botMessageContent = data.messages?.[0]?.content ?? "No response from bot";
        const botMessage: Message = {
          sender: "bot",
          content: botMessageContent,
        };
  
        if (botMessageContent === "Please wait while I try to connect you with a property agent") {
          setConnectedToAgent(true);
  
          // Wait for 30 seconds before fetching session messages
          setTimeout(() => {
            fetchSessionMessages();
            
            // Set an interval to fetch messages every 10 seconds
            const intervalId = setInterval(fetchSessionMessages, 10000);
            
            // Clear interval when the component unmounts or the chat is closed
            return () => clearInterval(intervalId);
          }, 30000);
        } else {
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }
      }
    });
  
    setInput("");
  };
  

  const toggleChat = () => setIsOpen(!isOpen);

  const renderTextWithLinks = (text: string) => {
    const parts = text.split(/\b(https?:\/\/\S+)/g);

    return parts.map((part, index) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {part}
          </a>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };

  return (
    <div>
      {isOpen ? (
        <ChatBox>
          <ChatHeader>
            <h2>Chat with us!</h2>
            <IconButton onClick={toggleChat}>
              <CloseIcon />
            </IconButton>
          </ChatHeader>
          <ChatBody>
            <MessageContainer>
              {messages.map((message, index) => (
                <div key={index}>
                  {message.sender === "user" ? (
                    <UserMessage>{message.content}</UserMessage>
                  ) : (
                    <BotMessage>
                      {renderTextWithLinks(message.content)}
                    </BotMessage>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </MessageContainer>
          </ChatBody>
          <ChatFooter>
            <ChatInput
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me something..."
              variant="outlined"
            />
            <Button variant="contained" color="primary" onClick={connectedToAgent ? handleSendMessage : handleSend}>
              Send
            </Button>
          </ChatFooter>
        </ChatBox>
      ) : (
        <Tooltip title="Chat with us!" placement="left">
          <ChatButton onClick={toggleChat}>
            <ChatIcon />
          </ChatButton>
        </Tooltip>
      )}
    </div>
  );
};

export default ChatbotUI;
