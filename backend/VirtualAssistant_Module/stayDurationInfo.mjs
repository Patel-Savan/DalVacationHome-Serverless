import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import fetch from "node-fetch";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export async function handler(event) {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const currentIntent = event.sessionState.intent;

  if (currentIntent.name === "UserConcerns") {
    const sessionId = "User101";
    const message = event.inputTranscript;
    const senderId = event.sessionId; // Adjust this based on your logic to get the sender ID

    const apiResponse = await sendUserConcern(sessionId, senderId, message);

    if (apiResponse.ok) {
      return buildFulfillmentResponse(
        "Your concern is forwarded to a property agent. Go to the Customer Concern section."
      );
    } else {
      console.error("Error sending user concern:", apiResponse.statusText);
      return buildFulfillmentResponse(
        "Sorry, there was an issue forwarding your concern. Please try again later."
      );
    }
  }

  let slots = currentIntent.slots;
  let referenceId = slots.referenceId?.value?.interpretedValue?.trim();

  if (!referenceId) {
    // Extract reference ID from the user's input if not already captured in slots
    const userInput = event.inputTranscript;
    const regex = /REF\d{13}/i; // Adjust the pattern based on your reference ID format
    const match = userInput.match(regex);
    if (match) {
      referenceId = match[0].toUpperCase();
      slots.referenceId = { value: { interpretedValue: referenceId } };
    }
  } else {
    referenceId = referenceId.toUpperCase();
  }

  if (!referenceId) {
    // Elicit the referenceId slot if it's not provided
    return elicitSlot(
      event,
      "referenceId",
      "Please provide your booking reference ID."
    );
  }

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

async function sendUserConcern(sessionId, senderId, message) {
  const apiUrl =
    "https://us-central1-dalvacationhome-dev.cloudfunctions.net/publishToCustomerMessagesTopic";
  const payload = {
    session_id: sessionId,
    sender_id: senderId,
    message: message,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return response;
  } catch (error) {
    console.error("Error sending user concern:", error);
    throw error;
  }
}

function elicitSlot(event, slotToElicit, message) {
  return {
    sessionState: {
      dialogAction: {
        type: "ElicitSlot",
        slotToElicit: slotToElicit,
        intentName: event.sessionState.intent.name,
        slots: event.sessionState.intent.slots,
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
