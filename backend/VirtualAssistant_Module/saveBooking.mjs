import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize the DynamoDB Client
const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  const {
    username,
    roomNumber,
    entryDate,
    exitDate,
    roomType,
    numberOfGuests,
  } = event;

  // Convert entryDate and exitDate from string to Date objects
  const entry = new Date(entryDate);
  const exit = new Date(exitDate);

  // Calculate the difference in days
  const timeDiff = exit.getTime() - entry.getTime();
  const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Prepare the item to be inserted into DynamoDB
  const item = {
    username: username,
    roomId: roomNumber,
    referenceId: `REF${Date.now()}`, // Simple way to generate a unique referenceId
    entryDate: entryDate,
    exitDate: exitDate,
    days: days, // Number of days calculated from date difference
    roomType: roomType,
    numberOfGuests: parseInt(numberOfGuests, 10),
  };

  // Parameters for DynamoDB put operation for the primary booking table
  const bookingParams = {
    TableName: "room-booking",
    Item: item,
  };

  try {
    // Using PutCommand from lib-dynamodb for simpler syntax
    await ddbDocClient.send(new PutCommand(bookingParams));

    // Prepare to add the same item to bookingHistory table
    const historyParams = {
      TableName: "bookingHistory",
      Item: {
        ...item,
        timestamp: new Date().toISOString(), // Additional data for history tracking
      },
    };

    // Add data to bookingHistory table
    await ddbDocClient.send(new PutCommand(historyParams));

    // Return response with CORS headers
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allows all domains to access your API
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
      },
      body: JSON.stringify({
        referenceId: item.referenceId,
        message: "Booking successfully recorded in both tables.",
      }),
    };
  } catch (error) {
    console.error("Error inserting item into DynamoDB", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Ensures the error message is also accessible from any domain
      },
      body: JSON.stringify({ message: "Failed to record booking." }),
    };
  }
}
