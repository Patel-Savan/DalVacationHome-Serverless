import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Initialize the DynamoDB Client
const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  const { username } = event;

  // Parameters for DynamoDB query operation
  const params = {
    TableName: "bookingHistory",
    KeyConditionExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": username,
    },
  };

  try {
    // Using QueryCommand to fetch data from bookingHistory table
    const data = await ddbDocClient.send(new QueryCommand(params));

    // Return response with CORS headers
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allows all domains to access your API
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      },
      body: JSON.stringify({
        bookings: data.Items,
        message: "Booking history successfully retrieved.",
      }),
    };
  } catch (error) {
    console.error("Error fetching data from DynamoDB", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Ensures the error message is also accessible from any domain
      },
      body: JSON.stringify({ message: "Failed to fetch booking history." }),
    };
  }
}

// https://rxjjubs344.execute-api.us-east-1.amazonaws.com/dev/my-booked-rooms
