import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize AWS clients
const s3Client = new S3Client({ region: "us-east-1" });
const dynamoClient = new DynamoDBClient({ region: "us-east-1" });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Ensure headers exist and get content type in a case-insensitive manner
    const contentType =
      event.headers?.["Content-Type"] || event.headers?.["content-type"];
    console.log("Content-Type:", contentType);

    if (!contentType) {
      console.log("Content-Type header is missing.");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Content-Type header is missing." }),
      };
    }

    // Extract boundary from Content-Type header
    const boundaryMatch = contentType.match(/boundary=(.*)$/);
    if (!boundaryMatch) {
      console.log("Could not extract boundary from Content-Type header.");
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Could not extract boundary from Content-Type header.",
        }),
      };
    }
    const boundary = boundaryMatch[1];
    console.log("Boundary:", boundary);

    // Decode the body from base64
    const bodyBuffer = Buffer.from(event.body, "base64");
    console.log("Body Buffer Length:", bodyBuffer.length);

    // Use the boundary to split the body into parts
    const parts = bodyBuffer.toString("binary").split(`--${boundary}`);
    console.log("Number of Parts:", parts.length);

    // Extract fields and file content
    const fields = {};
    let fileBuffer = null;
    let fileName = "";

    for (let part of parts) {
      if (part.includes('Content-Disposition: form-data; name="')) {
        const nameMatch = part.match(/name="([^"]+)"/);
        if (nameMatch) {
          const name = nameMatch[1];
          console.log(`Processing field: ${name}`);
          if (part.includes('filename="')) {
            const filenameMatch = part.match(/filename="([^"]+)"/);
            if (filenameMatch) {
              fileName = filenameMatch[1];
              const contentMatch = part.match(/\r\n\r\n([\s\S]*)\r\n$/);
              if (contentMatch) {
                fileBuffer = Buffer.from(contentMatch[1], "binary");
                console.log(
                  `Extracted file: ${fileName}, Size: ${fileBuffer.length} bytes`
                );
              } else {
                console.log(`Failed to extract file content for ${name}`);
              }
            } else {
              console.log(`Filename match failed for ${name}`);
            }
          } else {
            const valueMatch = part.match(/\r\n\r\n([\s\S]*)\r\n$/);
            if (valueMatch) {
              fields[name] = valueMatch[1];
              console.log(`Extracted field: ${name} = ${fields[name]}`);
            } else {
              console.log(`Failed to extract value for ${name}`);
            }
          }
        } else {
          console.log("Name match failed for part:", part);
        }
      }
    }

    console.log("Fields:", fields);

    const { roomNumber, type, price, available, amenities } = fields;

    if (
      !roomNumber ||
      !type ||
      !price ||
      available === undefined ||
      !fileBuffer
    ) {
      console.log("Missing required room details or image.");
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required room details or image.",
        }),
      };
    }

    // Upload image to S3
    const s3Params = {
      Bucket: "myroombucket", // Replace with your bucket name
      Key: `uploaded_images/${Date.now()}_${fileName}`, // Example key, could be modified
      Body: fileBuffer,
      ContentType: "image/jpeg", // Set to appropriate content type
    };

    const s3Command = new PutObjectCommand(s3Params);
    await s3Client.send(s3Command);
    const imageUrl = `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`;

    // Convert available to boolean
    const availableBool = available === "true";

    // Convert amenities to array if it is a string
    const amenitiesArray = amenities
      ? amenities.split(",").map((item) => item.trim())
      : [];

    // Prepare the item to be inserted into DynamoDB
    const item = {
      roomNumber,
      type,
      price: parseFloat(price),
      available: availableBool,
      imageUrl,
      amenities: amenitiesArray,
    };

    const dynamoParams = {
      TableName: "rooms",
      Item: item,
    };

    // Using PutCommand from lib-dynamodb for simpler syntax
    await ddbDocClient.send(new PutCommand(dynamoParams));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Room created successfully!", imageUrl }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Failed to create room",
        error: err.toString(),
      }),
    };
  }
};
