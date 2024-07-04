import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import jwt from 'jsonwebtoken'

const dynamoDb = DynamoDBDocument.from(new DynamoDB({
    region:'us-east-1'
}))
const tableName = "auth-info"

const cognito = new CognitoIdentityProvider();
const clientId = '56d2mgqmfdne9meq9amq5s5p2j';

/**
 * Entry Point for Login-lambda function
 * @param {*} event Event body containing information about frontend request
 * @returns message based on credentials provided by User
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
    
        // Save Tokens in Database for future use 
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
 * Function for saving user login info such as tokens in Database
 * @param {*} user user object containing username, tokens
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
 * Function for deleting previous tokens if new Login request is made
 * @param {*} username username for which tokens is to be stored
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
