import json
import boto3
import os

sns_client = boto3.client('sns')
topic_arn = os.environ['SNS_TOPIC_ARN']

def send_notification(email, subject, message):
    sns_client.publish(
        TopicArn=topic_arn,
        Message=message,
        Subject=subject,
        MessageAttributes={
            'email': {
                'DataType': 'String',
                'StringValue': email
            }
        }
    )

def lambda_handler(event, context):
    for record in event['Records']:
        message = json.loads(record['body'])
        user_email = message['user_email']
        booking_details = message['booking_details']
        
        # Here we will write the booking request logic
        # Process the booking request
        # For now hardcoding the booking approved flag
        booking_approved = True  
        
        if booking_approved:
            subject = 'Booking Confirmation'
            message = f"Booking confirmed for {user_email}."
        else:
            subject = 'Booking Failure'
            message = f"Booking failed for {user_email}."
        
        # Send booking confirmation or failure notification
        send_notification(user_email, subject, message)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Processed booking request')
    }
