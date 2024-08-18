import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import axios from "axios";

const dynamoDb = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));

const GOOGLE_CLOUD_FUNCTION_URL = "https://us-central1-csci-5409-428302.cloudfunctions.net/login-info"; // Replace with your actual URL

/**
 * This Function is the Entry point for Ceaser Cipher Lambda Function
 * @param {*} event Event body containing required details from frontend
 * @returns Response Body based on Processing of data
 */
export const handler = async (event) => {
  const body = JSON.parse(event.body);

  console.log(event);

  const username = body.username.toLowerCase();

  console.log(username);
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
    var dataItem = await getKeyFromDynamoDB(username);        // Getting Cipher Key from DynamoDB with Username
    console.log(dataItem);

    if (!dataItem || !dataItem.username) {
      dataItem = await getKeyFromDynamoDBUsingEmail(username);    // Getting Cipher Key from DynamoDB with Useremail If  not found with Username

      if (!dataItem || !dataItem.username)
        return buildResponse(403, "Account does not exist for this email");
    }

    const key = dataItem.key;
    const isValid = verifyCipherText(normalText, cipherText, key);      // Getting Correct CipherText for given normal Text and provided key

    console.log(isValid);
    if (!isValid) {
      return buildResponse(401, "Incorrect Encryption");
    }

    const data = await getToken(username);                // Getting Token provided by Cognito that was stored in DynamoDB during first step
    console.log("Token data:", data); 

    if (!data) {
      return buildResponse(401, "No tokens found for user");
    }

    if (data) {
      await deleteToken(username);
    }

    const userInfo = {
      username: dataItem.username,
      useremail: dataItem.useremail,
      role: dataItem.role
    };

    const currentDate = new Date();
    const loginDate = currentDate.toLocaleDateString();
    const loginTime = currentDate.toLocaleTimeString();

    const loginStats = {
      action: "Login",
      date: loginDate,
      time: loginTime
    };

    const loginInfo = await getLoginInfo(dataItem.username);      // Getting Previous Login Info of User

    if (loginInfo) {
      await updateLoginInfo(dataItem.username, loginStats);       // Updating Login Info of User by adding new Login Info to Previous information
    } else {
      await saveLoginInfo(userInfo, loginStats);                  // Creating new record for storing User Login Info If does not exist
    }

    const cloudFunctionResponse = await axios.post(GOOGLE_CLOUD_FUNCTION_URL, {
      username: dataItem.username,
      useremail: dataItem.useremail,
      role: dataItem.role,
      action: "Login",
      date: loginDate,
      time: loginTime
    });

    console.log("Google Cloud Function response:", cloudFunctionResponse.data);

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        username: dataItem.username,
        useremail: dataItem.useremail,
        role: dataItem.role,
        accessToken: data.accessToken,
        idToken: data.idToken,
        refreshToken: data.refreshToken
      })
    };

    return response;
  } catch (error) {
    console.error("Error:", error);
    return buildResponse(500, "Internal Server Error");
  }
};


/**
 * Function for deleting token from DynamoDB Once It is sent to frontEnd
 * @param {*} username username for which token is to be deleted
 */
async function deleteToken(username) {
  const params = {
    TableName: "auth-info",
    Key: {
      username: username
    }
  };

  if (username) {
    await dynamoDb.delete(params);    // Deleting token from DynamoDB
  }
}

/**
 * Getting token from DynamoDB that was stored during first step
 * @param {*} username username for which token is to be fetched
 * @returns token if exist
 */
async function getToken(username) {
  const params = {
    TableName: "auth-info",
    Key: {
      username: username
    }
  };

  const response = await dynamoDb.get(params);
  console.log("getToken response:", response);

  return response.Item;
}

/**
 * Function for Getting Previous Login Info for User
 * @param {*} username username for which Login Info is to fetched
 * @returns Login Info Record
 */
async function getLoginInfo(username) {
  const params = {
    TableName: "login-info",
    Key: {
      username: username
    }
  };

  return await dynamoDb.get(params).then(
    (response) => {
      return response.Item;
    },
    (error) => {
      console.log(error);
    }
  );
}

async function updateLoginInfo(username, loginStats) {
  const params = {
    TableName: "login-info",
    Key: {
      username: username
    },
    UpdateExpression: "SET loginInfo = list_append(loginInfo, :newLoginInfo)",
    ExpressionAttributeValues: {
      ":newLoginInfo": [loginStats]
    },
    ReturnValues: "ALL_NEW"
  };

  return await dynamoDb.update(params).then(
    (response) => {
      return true;
    },
    (error) => {
      console.log(error);
    }
  );
}

async function saveLoginInfo(userInfo, loginStats) {
  const item = {
    username: userInfo.username,
    useremail: userInfo.useremail,
    role: userInfo.role,
    loginInfo: [loginStats]
  };

  const params = {
    TableName: "login-info",
    Item: item
  };

  try {
    await dynamoDb.put(params);
    return true;
  } catch (error) {
    console.log(error);
  }
}

async function getKeyFromDynamoDB(username) {
  const params = {
    TableName: "serverless-project-users",
    Key: {
      username: username
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

const getKeyFromDynamoDBUsingEmail = async (email) => {
  const params = {
    TableName: "serverless-project-users",
    IndexName: "useremail",
    KeyConditionExpression: "useremail = :email",
    ExpressionAttributeValues: {
      ":email": email
    }
  };

  try {
    const result = await dynamoDb.query(params);
    if (result.Items.length > 0) {
      console.log("User retrieved successfully by email:", result.Items[0]);
      return result.Items[0];
    }
  } catch (error) {
    console.error("Error retrieving user by email:", error);
  }
  return null;
};

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
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
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

  console.log("Building response:", response);
  return response;
}
