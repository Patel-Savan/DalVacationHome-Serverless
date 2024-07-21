import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Initialize the DynamoDB Client
const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const roomNumber = event.queryStringParameters?.roomNumber;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
    "Content-Type": "application/json", // Ensures the response is recognized as JSON
  };

  if (!roomNumber) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify([{ message: "Room number is required." }]),
    };
  }

  const params = {
    TableName: "rooms",
    Key: {
      roomNumber: roomNumber,
    },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    if (!data.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify([{ message: "Room not found." }]),
      };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([data.Item]), // Wrap the item in an array
    };
  } catch (error) {
    console.error("Error fetching room from DynamoDB", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify([{ message: "Failed to fetch room." }]),
    };
  }
}
