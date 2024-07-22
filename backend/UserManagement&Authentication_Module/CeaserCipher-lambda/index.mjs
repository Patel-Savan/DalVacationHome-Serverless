import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import axios from "axios";

const dynamoDb = DynamoDBDocument.from(new DynamoDB({ region: "us-east-1" }));

const GOOGLE_CLOUD_FUNCTION_URL = "https://us-central1-csci-5409-428302.cloudfunctions.net/login-info"; // Replace with your actual URL

/**
 * Entry Point for Ceaser-Cipher Check
 * @param {*} event Event body containing information about request from frontend
 * @returns json body based on user input
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
    // Getting Encryption key that was provided during Signup from Database
    var dataItem = await getKeyFromDynamoDB(username);

    console.log(dataItem);

    if (!dataItem || !dataItem.username) {
      dataItem = await getKeyFromDynamoDBUsingEmail(username);

      if (!dataItem || !dataItem.username)
        return buildResponse(403, "Account does not exist for this email");
    }

    const key = dataItem.key;
    // Verifying Ciphertext provided by User
    const isValid = verifyCipherText(normalText, cipherText, key);

    console.log(isValid);
    if (!isValid) {
      return buildResponse(401, "Incorrect Encryption");
    }

    // Getting token from Database that was provided by AWS Cognito during first step
    const data = await getToken(username);

    // Deleting tokens from database for security reasons
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

    // Getting Login Info from DynamoDB
    const loginInfo = await getLoginInfo(dataItem.username);

    if (loginInfo) {
      await updateLoginInfo(dataItem.username, loginStats); // Updating Login info If User has logged in before
    } else {
      await saveLoginInfo(userInfo, loginStats); // Saving new record to DynamoDB for User If login for the first time
    }

    // Call Google Cloud Function
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
 * Function for Deleting tokens from database
 * @param {*} username username for which tokens are to be deleted
 */
async function deleteToken(username) {
  const params = {
    TableName: "auth-info",
    Key: {
      username: username
    }
  };

  await dynamoDb.delete(params);
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

/**
 * Function to get current Login Info of Users
 * @param {*} username username for which login info is to be fetched
 * @returns login info object if present
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

/**
 * Function to update the login info of users
 * add new login info when user logs into the system
 * @param {*} username username for which login info is to be updated
 * @param {*} loginStats login info object to be added to the list
 * @returns true if update was successful
 */
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

/**
 * Function for saving login info when user logs in the first time
 * @param {*} userInfo user information object
 * @param {*} loginStats login information object to be added
 * @returns true if information add was successful
 */
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

/**
 * Function for getting encryption key from database for Checking cipher text
 * @param {*} username username for which key is to be fetched
 * @returns encryption key
 */
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

  console.log("Building response:", response);
  return response;
}
