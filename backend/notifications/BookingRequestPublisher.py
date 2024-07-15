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
    logger.info('topic arn is as follows --- %s ',topic_arn)
    logger.info("Received event: %s", json.dumps(event))
    
    try:
        # Parse the request body
        body = json.loads(event['body'])
        logger.info("Parsed body: %s", body)

        email = body['user_email']
        booking_details = body['booking_details']
        
        # Log the email and booking details
        logger.info("User email: %s", email)
        logger.info("Booking details: %s", booking_details)
        
        # Publish booking request to SNS topic
        sns_client.publish(
            TopicArn=topic_arn,
            Message=json.dumps({
                'user_email': email,
                'booking_details': booking_details
            }),
            Subject='Booking Request'
        )
        
        logger.info("Published message to SNS topic: %s", topic_arn)
        
        response = {
            'statusCode': 200,
            'body': json.dumps({'message': 'Booking request sent for approval successfully'})
        }
        logger.info("Response: %s", response)
        
    except Exception as e:
        logger.error("Error: %s", str(e))
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    
    return response
