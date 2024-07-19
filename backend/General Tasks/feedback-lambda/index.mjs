import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamoDb = DynamoDBDocument.from(
  new DynamoDB({
    region: "us-east-1"
  })
);
const tableName = "reviews";

export const handler = async (event) => {
  console.log(event);
  const body = JSON.parse(event.body);
  const username = body.username;
  const useremail = body.useremail;
  const roomNumber = body.roomNumber;
  const cleanliness = body.cleanliness;
  const amenities = body.amenities;
  const service = body.service;
  const overall = body.overall;
  const review = body.review;

  console.log(body);
  try {
    const reviewData = {
      username: username,
      useremail: useremail,
      cleanliness: cleanliness,
      amenities: amenities,
      service: service,
      overall: overall,
      review: review
    };

    if (!roomNumber || !username || !useremail) {
      const Response = {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          message: "Username, Useremail and room number is required"
        })
      };

      return Response;
    }

    const reviewDataItem = await getReviewForRoom(roomNumber);

    if (reviewDataItem) {
      await updateReviewForRoom(roomNumber, reviewData);
    } else {
      await addReviewForRoom(roomNumber, reviewData);
    }

    const Response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json"
      },
      body: JSON.stringify({ success: true })
    };

    return Response;
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json"
      },
      body: JSON.stringify({ message: "Error while storing your review" })
    };
  }
};

async function getReviewForRoom(roomNumber){
  const params = {
    TableName: tableName,
    Key: {
      roomNumber: roomNumber
    }
  }

  return await dynamoDb.get(params).then(
    (response) => {
      return response.Item;
    },
    (error) => {
      console.log(error);
    }
  );

}

async function updateReviewForRoom(roomNumber, reviewData){
  const params = {
    TableName: tableName,
    Key: {
      roomNumber: roomNumber
    },
    UpdateExpression: "SET reviews = list_append(reviews, :newReview)",
    ExpressionAttributeValues: {
      ":newReview": [reviewData]
    },
    ReturnValues: "ALL_NEW"
  };

  return await dynamoDb.update(params).then(
    (response) => {
      console.log(response);
    },
    (error) => {
      console.log(error);
    }
  );
}
async function addReviewForRoom(roomNumber, reviewData) {
  const item = {
    roomNumber: roomNumber,
    reviews: [reviewData]
  };
  const params = {
    TableName: tableName,
    Item: item
  };

  await dynamoDb.put(params);
}
