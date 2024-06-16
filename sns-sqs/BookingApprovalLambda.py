import json
import boto3

sns_client = boto3.client('sns')
topic_arn = 'arn:aws:sns:your-region:your-account-id:UserNotifications'

def send_notification(email, subject, message):
    sns_client.publish(
        TopicArn=topic_arn,
        Message=message,
        Subject=subject
    )

def lambda_handler(event, context):
    for record in event['Records']:
        payload = json.loads(record['body'])
        
        # Process the booking request here
        booking_approved = True  # This should be the result of your booking logic
        
        if booking_approved:
            message = f"Booking confirmed for {payload['user_email']}."
            subject = 'Booking Confirmation'
        else:
            message = f"Booking failed for {payload['user_email']}."
            subject = 'Booking Failure'
        
        send_notification(payload['user_email'], subject, message)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Processed booking request')
    }
