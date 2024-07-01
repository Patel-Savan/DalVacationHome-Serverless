import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProvider({
    region:'us-east-1'
})

const dynamoDB = DynamoDBDocument.from(new DynamoDB({ region: 'us-east-1' }));
const tableName ="app-users"

/**
 * Entry Point for Register User Lambda Function
 * @param {*} event Event body containing required details from Frontend 
 * @returns Response according to the processing of Data
 */
export const handler = async (event) => {

    var name = event.userName;
    var userPoolId = event.userPoolId;
    var answers = event.request.userAttributes;

    const favMovie = answers["custom:Movie"]
    const favFood = answers["custom:Friend"]
    const favFriend = answers["custom:Food"]
    const Role = answers["custom:Role"]
    const Key = answers["custom:Key"]
    
    const user = {
        username : name,
        favMovie : favMovie,
        favFood : favFood,
        favFriend : favFriend,
        role : Role,
        key : Key
    }

    try{
        await saveUser(user);

        await cognito.adminUpdateUserAttributes({
            UserPoolId : userPoolId,
            Username : name,
            UserAttributes : [
                { Name: 'custom:Movie', Value: '' },
                { Name: 'custom:Friend', Value: '' },
                { Name: 'custom:Food', Value: '' },
                { Name : 'custom:Role', Value : ''},
                {Name : 'custom:Key', Value:0}
            ]
        })

    }catch(error){

        event.response = {
            "error": "Error during post confirmation process",
            "errorMessage": error.message
        };
        return event;
    }

    return event;
}

/**
 * This Function is used to Generate Response for sending to the client
 * @param {*} statusCode Status Code of Required Response 
 * @param {*} message Message of Required Response
 * @returns Generated Response body
 */

function buildResponse(statusCode,message){

    const response = {
        statusCode:statusCode,
        headers:{
            'Access-Control-Allow-Origin':'*',
            'Content-type':'application/json'
        },
        body:JSON.stringify(message)
    }

    return response;
}


/**
 * This Function is used to save the user info in the DynamoDb table
 * @param {*} user Object containing information about the user to be saved 
 * @returns Response Object depending on whether user info is saved into the database or not
 */
async function saveUser(user){
    const params = {
        TableName : tableName,
        Item : user
    }
    try{
        await dynamoDB.put(params)
        return true;
    }catch(error){
        return false;
    }
}