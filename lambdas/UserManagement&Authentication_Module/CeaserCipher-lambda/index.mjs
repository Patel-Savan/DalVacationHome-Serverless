import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamoDb = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));

/**
 * Entry Point for Ceaser-Cipher Check
 * @param {*} event Event body containing information about request from frontend
 * @returns json body based on user input
 */
export const handler = async (event) => {
  const body = JSON.parse(event.body);

  console.log(event)

  const username = body.username.toLowerCase();

  console.log(username)
  const normalText = body.normalText;
  const cipherText = body.cipherText;

  if (!normalText || !cipherText) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Both normalText and cipherText are required"
      })
    };
  }

  try {

    // Getting Encryption key that was provided during Signup from Database 
    const dataItem = await getKeyFromDynamoDB(username);

    console.log(dataItem)
    if (!dataItem || !dataItem.username) {
      return buildResponse(403, "Account does not exist for this email");
    }

    const key = dataItem.key;
    // Verifying Ciphertext provided by User 
    const isValid = verifyCipherText(normalText, cipherText, key);

    console.log(isValid)
    if (!isValid) {
      return buildResponse(401, "Incorrect Encryption");
    }

    // Getting token from Database that was provided by AWS Cognito during first step
    const data = await getToken(username);
    
    // Deleting tokens from database for security reaspns
    if(data){
      await deleteToken(username)
    }

    const Response = {
        statusCode:200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-type": "application/json"
        },
        body:JSON.stringify({
            username:username,
            role:dataItem.role,
            accessToken:data.accessToken,
            idToken:data.idToken,
            refreshToken:data.refreshToken
        })
    }

    return Response;

  } catch (error) {
    console.error("Error:", error);
    return buildResponse(500, "Internal Server Error");
  }
};

/**
 * Function for Deleting tokens from database
 * @param {*} username username for which tokens are to be deleted
 */
async function deleteToken(username){
  const params = {
    TableName : "auth-info",
    Key : {
      username : username
    }
  }

  await dynamoDb.delete(params)
  
}

/**
 * Function for getting tokens from database
 * @param {*} username username for which tokens are to be fetched
 * @returns token for user
 */
async function getToken(username) {
  const params = {
    TableName: "auth-info",
    Key: {
        username : username
    }
  };

  return await dynamoDb.get(params)
    .then(response => {
      return response.Item;
    },
    error => {
      console.log(error.message);
    }
  );
}

/**
 * Function for getting encryption key from database for Checking cipher text
 * @param {*} username username for which key is to be fetched
 * @returns encryption key
 */
async function getKeyFromDynamoDB(username) {
  const params = {
    TableName: "app-users", // Replace with your table name
    Key: {
        username:username
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

/**
 * Function for Verifying Cipher text provided by user
 * @param {*} normalText normal text 
 * @param {*} cipherText cipher text provided by user
 * @param {*} key key provided by user during signup
 * @returns boolean based on cipher text
 */
function verifyCipherText(normalText, cipherText, key) {

  // Getting correct cipher text for given normal text and key
  const encrypted = caesarCipherEncrypt(normalText, parseInt(key));
  return encrypted === cipherText;
}

/**
 * Function for getting cipher text based on normal text and key
 * @param {*} text text for which cipher text is to be generated
 * @param {*} shift key for generating cipher text
 * @returns cipher text
 */
function caesarCipherEncrypt(text, shift) {
  return text
    .split("")
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return char;
    })
    .join("");
}

/**
 * Function for creating response to be sent to frontend
 * @param {*} statusCode status code of the response
 * @param {*} message message supporting status code 
 * @returns created response
 */
function buildResponse(statusCode, message) {
  const response = {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "application/json"
    },
    body: JSON.stringify(message)
  };

  return response;
}
