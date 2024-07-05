import json
import boto3
import os

sqs_client = boto3.client('sqs')
sns_client = boto3.client('sns')
queue_url = os.environ['BOOKING_QUEUE_URL']
notification_topic_arn = os.environ['NOTIFICATION_TOPIC_ARN']

def send_notification(email, subject, message):
    sns_client.publish(
        TopicArn=notification_topic_arn,
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
        message_body = record['body']
        print(f"Received message: {message_body}")

        try:
            message = json.loads(message_body)
            user_email = message['user_email']
            booking_details = message['booking_details']

            # Here you would add the booking approval logic
            booking_approved = True  # or False based on your logic

            if booking_approved:
                subject = 'Booking Confirmation'
                body_message = f"Booking confirmed for {user_email}. Details: {booking_details}"
            else:
                subject = 'Booking Failure'
                body_message = f"Booking failed for {user_email}. Details: {booking_details}"

            send_notification(user_email, subject, body_message)
        except Exception as e:
            print(f"Error processing message: {e}")

    return {
        'statusCode': 200,
        'body': json.dumps('Processed booking request')
    }
