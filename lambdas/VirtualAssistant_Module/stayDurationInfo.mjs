import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export async function handler(event) {
  console.log("Received event:", JSON.stringify(event, null, 2));

  let referenceId =
    event.sessionState.intent.slots.referenceId.value.interpretedValue.trim();
  referenceId = referenceId.toUpperCase();

  console.log("Extracted referenceId (converted to uppercase):", referenceId);

  try {
    const bookingInfo = await fetchBookingInformation(referenceId);
    console.log("Fetched booking information:", bookingInfo);
    if (bookingInfo) {
      return buildFulfillmentResponse(
        `The stay duration for reference number ${referenceId} is from ${bookingInfo.entryDate} to ${bookingInfo.exitDate}, and the room number is ${bookingInfo.roomId}.`
      );
    } else {
      return buildFulfillmentResponse(
        "No booking information found for the provided reference ID."
      );
    }
  } catch (error) {
    console.error("Error fetching booking information:", error);
    return buildFulfillmentResponse(
      "Sorry, I couldn't fetch the booking information right now."
    );
  }
}

async function fetchBookingInformation(referenceId) {
  const params = {
    TableName: "room-booking",
    KeyConditionExpression: "referenceId = :refId",
    ExpressionAttributeValues: {
      ":refId": referenceId,
    },
    Limit: 1,
  };

  console.log("DynamoDB query parameters:", params);

  try {
    const response = await docClient.send(new QueryCommand(params));
    console.log("DynamoDB query response:", JSON.stringify(response, null, 2));
    if (response.Items && response.Items.length > 0) {
      return response.Items[0];
    }
    return null;
  } catch (error) {
    console.error("Error executing DynamoDB query:", error);
    throw error;
  }
}

function buildFulfillmentResponse(message) {
  return {
    sessionState: {
      dialogAction: {
        type: "Close",
        fulfillmentState: "Fulfilled",
      },
      intent: {
        name: "BookingInformation",
        state: "Fulfilled",
      },
    },
    messages: [
      {
        contentType: "PlainText",
        content: message,
      },
    ],
  };
}
