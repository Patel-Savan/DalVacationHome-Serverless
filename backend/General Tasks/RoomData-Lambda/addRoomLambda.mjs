import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize the DynamoDB Client
const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  let roomDetails;
  try {
    roomDetails = event;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON format." }),
    };
  }

  const { roomNumber, type, price, available, imageUrl, amenities } =
    roomDetails;

  if (!roomNumber || !type || !price || available === undefined || !imageUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required room details." }),
    };
  }

  // Convert available to boolean
  const availableBool = available === "true";

  // Convert amenities to array if it is a string
  const amenitiesArray = amenities
    ? amenities.split(",").map((item) => item.trim())
    : [];

  // Prepare the item to be inserted into DynamoDB
  const item = {
    roomNumber: roomNumber,
    type: type,
    price: parseFloat(price),
    available: availableBool,
    imageUrl: imageUrl,
    amenities: amenitiesArray,
  };

  const params = {
    TableName: "rooms",
    Item: item,
  };

  try {
    // Using PutCommand from lib-dynamodb for simpler syntax
    await ddbDocClient.send(new PutCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Room created successfully." }),
    };
  } catch (error) {
    console.error("Error inserting room into DynamoDB", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create room." }),
    };
  }
}
