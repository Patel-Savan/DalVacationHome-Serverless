import json
import boto3
import os
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

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
    logger.info(f"Notification sent to {email} with subject: {subject}")

def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))

    for record in event['Records']:
        message_body = record['body']
        logger.info("Received message body: %s", message_body)

        try:
            message = json.loads(message_body)

            # SNS message has a 'Message' field which contains the actual message
            actual_message = json.loads(message['Message'])
            user_email = actual_message['user_email']
            booking_details = actual_message['booking_details']

            # Here you would add the booking approval logic
            booking_approved = True  # or False based on your logic
            logger.info("Booking approved: %s", booking_approved)

            if booking_approved:
                subject = 'Booking Confirmation'
                body_message = f"Booking confirmed for {user_email}. Details: {booking_details}"
            else:
                subject = 'Booking Failure'
                body_message = f"Booking failed for {user_email}. Details: {booking_details}"

            send_notification(user_email, subject, body_message)
        except Exception as e:
            logger.error(f"Error processing message: {e}")

    return {
        'statusCode': 200,
        'body': json.dumps('Processed booking request')
    }
