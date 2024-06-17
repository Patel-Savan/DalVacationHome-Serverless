import React, { useState } from "react";
import AWS from "aws-sdk";

const Chatbot: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  // AWS Configuration (should ideally be in environment variables)
  AWS.config.region = "us-east-1"; // e.g., 'us-east-1'
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "us-east-1:c166a4af-8d10-43e9-a933-a2eee76020c3",
  });

  const lexruntime = new AWS.LexRuntime();
  const userId = `chatbot-demo-${Date.now()}`; // Generate a unique ID for each session

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = () => {
    const params = {
      botAlias: "TestBotAlias", // Update to your bot's alias
      botName: "NavigateApplication", // Update to your bot's name
      inputText: input,
      userId: userId,
      sessionAttributes: {},
    };

    lexruntime.postText(params, (err: any, data: { message: any }) => {
      if (err) {
        console.error("AWS Lex Error:", err);
        setResponse("Something went wrong.");
      } else {
        setResponse(data.message ?? "No response from bot");
      }
    });

    setInput(""); // Clear input after sending
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Ask me something..."
      />
      <button onClick={handleSend}>Send</button>
      <p>Bot Response: {response}</p>
    </div>
  );
};

export default Chatbot;
