import json
import boto3
import os
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

sns_client = boto3.client('sns')
topic_arn = os.environ['BOOKING_REQUEST_TOPIC_ARN']

def lambda_handler(event, context):
    logger.info('Topic ARN: %s', topic_arn)
    logger.info("Received event: %s", json.dumps(event))
    
    try:
        # Parse the request body
        body = json.loads(event['body'])
        logger.info("Parsed body: %s", body)

        user_email = body['user_email']
        booking_details = body['booking_details']
        booking_approved = body['booking_approved']
         
        # Log the email and booking details
        logger.info("User email: %s", user_email)
        logger.info("Booking details: %s", booking_details)
        logger.info("Booking approved: %s", booking_approved)
        
        # Publish booking request to SNS topic
        sns_client.publish(
            TopicArn=topic_arn,
            Message=json.dumps({
                'user_email': user_email,
                'booking_details': booking_details,
                'booking_approved': booking_approved
            }),
            Subject='Booking Request'
        )
        
        logger.info("Published message to SNS topic: %s", topic_arn)
        
        response = {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'message': 'Booking request sent for approval successfully'})
        }
        logger.info("Response: %s", response)
        
    except Exception as e:
        logger.error("Error: %s", str(e))
        response = {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': str(e)})
        }
    
    return response
