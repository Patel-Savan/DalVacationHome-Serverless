import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// Initialize the DynamoDB Client
const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  const params = {
    TableName: "rooms",
  };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error("Error fetching rooms from DynamoDB", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch rooms." }),
    };
  }
}
