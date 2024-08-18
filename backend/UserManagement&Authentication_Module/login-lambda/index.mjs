import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import jwt from 'jsonwebtoken'

const dynamoDb = DynamoDBDocument.from(new DynamoDB({
    region:'us-east-1'
}))
const tableName = "auth-info"

const cognito = new CognitoIdentityProvider();
const clientId = '41lrh3o3oi7ar1sivs1llpqe5o';

/**
 * Entry Point for Login 
 * @param {*} event Event body containing information about request from frontend
 * @returns json body based on user input
 */
export const handler = async (event) => {

  console.log(event)
  const body = JSON.parse(event.body)
  var username = body.username.toLowerCase()
  var password = body.password

  console.log(username)
  console.log(password)
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password
        }
      };

      try {

        // Checking Credentials with AWS Cognito
        const authResult = await cognito.initiateAuth(params);
    
        const { AccessToken, RefreshToken, IdToken } = authResult.AuthenticationResult;
    
        const decodedToken = jwt.decode(AccessToken);
        const expirationTime = new Date(decodedToken.exp * 1000).toISOString(); // Convert to ISO string

        const user = {
            username : username,
            accessToken : AccessToken,
            refreshToken : RefreshToken,
            idToken: IdToken,
            expirationTime : expirationTime
        }

        // Deleting previous login tokens
        await deleteIfExist(username);
    
        // Store tokens and expiration time in DynamoDB
        await saveLoginInfo(user); 
    
        const Response = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin':'*',
            'Content-type':'application/json',
        },
          body: JSON.stringify({ success: true })
        };

        return Response;
      } catch (error) {
        
        console.error(error);

        return {
          statusCode: 401,
          headers: {
            'Access-Control-Allow-Origin':'*',
            'Content-type':'application/json'
          },
          body: JSON.stringify({ success: false, message: error.message })
        };

      }
}

/**
 * Save Login info such as username, tokens for future use 
 * @param {*} user user info to be saved in database 
 */
async function saveLoginInfo(user){
    const params = {
        TableName : tableName,
        Item : user
    }

    await dynamoDb.put({
        TableName: tableName,
        Item: user
      });
}

/**
 * Function for deleting previous login info
 * @param {*} username username for which info is to be deleted
 */
async function deleteIfExist(username){

    const params = {
        TableName : tableName,
        Key : {
            username : username
        }
    }
    
    const getUser = await dynamoDb.get(params)
    
    if(getUser.Item){
        await dynamoDb.delete(params)
    }
}
