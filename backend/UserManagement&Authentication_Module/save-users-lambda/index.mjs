import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import axios from 'axios';

const cognito = new CognitoIdentityProvider({
    region: 'us-east-1'
});

const dynamoDB = DynamoDBDocument.from(new DynamoDB({ region: 'us-east-1' }));
const tableName = "serverless-project-users";

const GOOGLE_CLOUD_FUNCTION_URL = "https://us-central1-csci-5409-428302.cloudfunctions.net/saveUserInfo";

export const handler = async (event) => {
    var name = event.userName;
    var userPoolId = event.userPoolId;
    var answers = event.request.userAttributes;

    const email = answers["email"];
    const favMovie = answers["custom:Movie"];
    const favFriend = answers["custom:Friend"];
    const favFood = answers["custom:Food"];
    const Role = answers["custom:Role"];
    const Key = answers["custom:Key"];

    const user = {
        username: name,
        useremail: email,
        favMovie: favMovie,
        favFood: favFood,
        favFriend: favFriend,
        role: Role,
        key: Key
    };

    console.log("User details:", user);

    try {
        // Save User info in the Database
        await saveUser(user);
        console.log("User info saved in DynamoDB");

        // Update Cognito User Attributes
        await cognito.adminUpdateUserAttributes({
            UserPoolId: userPoolId,
            Username: name,
            UserAttributes: [
                { Name: 'custom:Movie', Value: '' },
                { Name: 'custom:Friend', Value: '' },
                { Name: 'custom:Food', Value: '' },
                { Name: 'custom:Role', Value: '' },
                { Name: 'custom:Key', Value: '0' }
            ]
        });
        console.log("Cognito user attributes updated");

        // Prepare payload for Google Cloud Function
        const payload = {
            username: name,
            useremail: email,
            favMovie: favMovie,
            favFriend: favFriend,
            favFood: favFood,
            role: Role,
            key: Key
        };

        // Call Google Cloud Function
        const googleCloudFunctionResponse = await callGoogleCloudFunction(GOOGLE_CLOUD_FUNCTION_URL, payload);
        console.log("Google Cloud Function response:", googleCloudFunctionResponse);

    } catch (error) {
        console.error("Error:", error);

        event.response = {
            "error": "Error during post confirmation process",
            "errorMessage": error.message
        };
        return event;
    }

    return event;
};

/**
 * This Function is used to save the user info in the DynamoDb table
 * @param {*} user Object containing information about the user to be saved 
 * @returns Response Object depending on whether user info is saved into the database or not
 */
async function saveUser(user) {
    const params = {
        TableName: tableName,
        Item: user
    };
    try {
        await dynamoDB.put(params);
        return true;
    } catch (error) {
        console.log("Error saving user to DynamoDB:", error);
        return false;
    }
}

/**
 * This function makes an axios POST request to the provided URL with the given payload.
 * @param {string} url The URL to which the POST request is made.
 * @param {object} payload The payload to be sent in the POST request.
 * @returns {Promise<any>} A promise that resolves with the response from the server.
 */
async function callGoogleCloudFunction(url, payload) {
    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error details:", error.response ? error.response.data : error.message);
        throw new Error(`Failed to call Google Cloud Function: ${error.message}`);
    }
}
