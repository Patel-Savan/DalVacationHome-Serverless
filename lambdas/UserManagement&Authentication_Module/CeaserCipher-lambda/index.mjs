import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

import { DynamoDB } from "@aws-sdk/client-dynamodb";

// Initialize DynamoDB Document Client
const dynamoDb = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));

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
    // Fetch encryption key from DynamoDB
    const dataItem = await getKeyFromDynamoDB(username);

    console.log(dataItem)
    if (!dataItem || !dataItem.username) {
      return buildResponse(403, "Account does not exist for this email");
    }

    const key = dataItem.key;
    // Verify the ciphertext
    const isValid = verifyCipherText(normalText, cipherText, key);

    console.log(isValid)
    if (!isValid) {
      return buildResponse(401, "Incorrect Encryption");
    }

    const data = await getToken(username);
    
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

async function deleteToken(username){
  const params = {
    TableName : "auth-info",
    Key : {
      username : username
    }
  }

  await dynamoDb.delete(params)
  
}
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

function verifyCipherText(normalText, cipherText, key) {
  const encrypted = caesarCipherEncrypt(normalText, parseInt(key));
  return encrypted === cipherText;
}

function caesarCipherEncrypt(text, shift) {
  return text
    .split("")
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        // Uppercase letters
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        // Lowercase letters
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
      }
      return char;
    })
    .join("");
}

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
