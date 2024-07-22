import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

// Initialize the DynamoDB Client
const client = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function handler(event) {
  console.log(event);

  if (!event) {
    console.error("Request body is missing.");
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Request body is missing." }),
    };
  }

  let roomDetails;
  try {
    roomDetails = event;
  } catch (error) {
    console.error("Invalid JSON format:", error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Invalid JSON format." }),
    };
  }

  const { roomNumber, type, price, available, imageUrl, amenities } =
    roomDetails;
  if (!roomNumber) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Room number is required." }),
    };
  }

  let updateExpression = "set";
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (type) {
    updateExpression += " #type = :type,";
    expressionAttributeValues[":type"] = type;
    expressionAttributeNames["#type"] = "type"; // Avoid conflict with reserved words
  }

  if (price) {
    updateExpression += " price = :price,";
    expressionAttributeValues[":price"] = parseFloat(price);
  }

  if (available !== undefined) {
    updateExpression += " available = :available,";
    expressionAttributeValues[":available"] = available;
  }

  if (imageUrl) {
    updateExpression += " imageUrl = :imageUrl,";
    expressionAttributeValues[":imageUrl"] = imageUrl;
  }

  if (amenities) {
    updateExpression += " amenities = :amenities,";
    expressionAttributeValues[":amenities"] = Array.isArray(amenities)
      ? amenities
      : amenities.split(",").map((item) => item.trim());
  }

  updateExpression = updateExpression.slice(0, -1); // Remove trailing comma

  const params = {
    TableName: "rooms",
    Key: { roomNumber },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: "UPDATED_NEW",
  };

  console.log("Update parameters:", JSON.stringify(params, null, 2));
  try {
    const result = await ddbDocClient.send(new UpdateCommand(params));
    console.log("Update result:", result);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        message: "Room updated successfully.",
        updatedAttributes: result.Attributes,
      }),
    };
  } catch (error) {
    console.error("Error updating room in DynamoDB", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Failed to update room." }),
    };
  }
}
