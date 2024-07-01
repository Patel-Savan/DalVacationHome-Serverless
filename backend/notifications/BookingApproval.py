import json
import boto3

sns_client = boto3.client('sns')

def send_notification(email, subject, message):
    sns_client.publish(
        TopicArn='arn:aws:sns:your-region:your-account-id:NotificationTopic',  # Replace with your SNS topic ARN
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
        
        # Process the booking request
        booking_approved = True  # This should be the result of your booking logic
        
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
