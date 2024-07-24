import React, { useState } from "react";
import { styled, Tooltip, IconButton, Button, TextField } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import AWS from "aws-sdk";
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

const ChatbotUI: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  AWS.config.update({
    region: "us-east-1",
    credentials: new AWS.Credentials(
      "AKIAUOM77AWAYOO56DUU",
      "neV0ySnwh0yreD66NnwaLCDqWdS8CAdWExNpOuw0"
    ),
  });

  const lexruntime = new AWS.LexRuntimeV2();
  const userId: string = readLocalStorage("username") || getRandomString(10);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

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
        const botMessage: Message = {
          sender: "bot",
          content: data.messages?.[0]?.content ?? "No response from bot",
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
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
            </MessageContainer>
          </ChatBody>
          <ChatFooter>
            <ChatInput
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me something..."
              variant="outlined"
            />
            <Button variant="contained" color="primary" onClick={handleSend}>
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
