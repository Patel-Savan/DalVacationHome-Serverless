// Import required modules from AWS SDK v3
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize the DynamoDB Client
const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  const { roomNumber, entryDate, exitDate, days, roomType, numberOfGuests } =
    event;

  // Prepare the item to be inserted into DynamoDB
  const item = {
    roomId: roomNumber,
    referenceId: `REF${Date.now()}`, // Simple way to generate a unique referenceId
    entryDate: entryDate,
    exitDate: exitDate,
    days: parseInt(days, 10),
    roomType: roomType,
    numberOfGuests: parseInt(numberOfGuests, 10),
  };

  // Parameters for DynamoDB put operation
  const params = {
    TableName: "room-booking",
    Item: item,
  };

  try {
    // Using PutCommand from lib-dynamodb for simpler syntax
    await ddbDocClient.send(new PutCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({
        referenceId: item.referenceId,
        message: "Booking successfully recorded.",
      }),
    };
  } catch (error) {
    console.error("Error inserting item into DynamoDB", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to record booking." }),
    };
  }
}
