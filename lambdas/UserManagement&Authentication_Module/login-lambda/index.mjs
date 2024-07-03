import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import jwt from 'jsonwebtoken'

const dynamoDb = DynamoDBDocument.from(new DynamoDB({
    region:'us-east-1'
}))
const tableName = "auth-info"

const cognito = new CognitoIdentityProvider();
const clientId = '3k13ohqka2hf32cb5nk436evpp';


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
