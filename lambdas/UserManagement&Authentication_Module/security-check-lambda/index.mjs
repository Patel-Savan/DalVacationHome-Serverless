import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

const dynamoDb = DynamoDBDocument.from(new DynamoDB({
    region:'us-east-1'
}))
const tableName = "app-users"
/**
 * This Function is the Entry point for Login Lambda Function
 * @param {*} event Event body containing required details from frontend
 * @returns Response Body based on Processing of data
 */
export const handler = async (event) => {

    const body = JSON.parse(event.body)
    var username = body.username.toLowerCase();
    var favMovie = body.favMovie;
    var favFriend = body.favFriend;
    var favFood = body.favFood;

    console.log(event)
    console.log(username)
    
    //Get User info from database to compare with provided answers
    const data = await getUser(username)
    
    if(!data || !data.username){
        return buildResponse(403,"Account does not exist for this email")
    }

    const storedMovie = data.favMovie;
    const storedFood = data.favFood;
    const storedFriend = data.favFriend;

    if(storedMovie.toLowerCase() == favMovie.toLowerCase() && storedFood.toLowerCase() == favFood.toLowerCase() && storedFriend.toLowerCase() == favFriend.toLowerCase()){
        return buildResponse(200,"Security Check Complete")
    }else{
        return buildResponse(401,"Wrong Security Answers")
    }
    
}

/**
 * This Function is used for getting User from DynamoDb database based on given email
 * @param {*} useremail User Email using which user details is to be onbtained 
 * @returns Response Object based on whether user with given email is present or not
 */

async function getUser(username){
    const params = {
        TableName : tableName,
        Key : {
            username : username
        }
    }

    return await dynamoDb.get(params)
        .then(response => {
            return response.Item
        }, error => {
            console.log(error.message)
        });
}

/**
 * This Function is used to Generate Response for sending to the client
 * @param {*} statusCode Status Code of Required Response 
 * @param {*} message Message of Required Response
 * @returns Generated Response body
 */

function buildResponse(statusCode,message){

    const Response = {
        statusCode:statusCode,
        headers:{
            'Access-Control-Allow-Origin':'http://localhost:5173',
            'Content-type':'application/json'
        },
        body:JSON.stringify(message)
    }

    return Response;
}
