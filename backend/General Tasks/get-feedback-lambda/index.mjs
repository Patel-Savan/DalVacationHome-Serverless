import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamoDb = DynamoDBDocument.from(
  new DynamoDB({
    region: "us-east-1"
  })
);
const tableName = "reviews";
/**
 * This Function is the Entry point for Get feedback Function
 * @param {*} event Event body containing required details from frontend
 * @returns Response Body based on Processing of data
 */
export const handler = async (event) => {

  const queryParams = event.queryStringParameters;

  console.log(event);
  console.log(queryParams)
  const roomNumber = parseInt(queryParams.roomNumber);
  console.log(roomNumber);

  var data;
  data = await getReviews(roomNumber);

  if (!data) {
    const Response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        message: "No Reviews available for this room"
      })
    };
    return Response;
  }

  console.log(data);

  const Response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      data: data.reviews
    })
  };

  return Response;
};

/**
 * This Function is used for getting User from DynamoDb database based on given email
 * @param {*} useremail User Email using which user details is to be onbtained
 * @returns Response Object based on whether user with given email is present or not
 */
async function getReviews(roomNumber) {
  const params = {
    TableName: tableName,
    Key: {
      roomNumber: roomNumber
    }
  };

  return await dynamoDb.get(params).then(
    (response) => {
      return response.Item;
    },
    (error) => {
      console.log(error.message);
    }
  );
}
