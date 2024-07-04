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
    try:
        # Log the entire incoming event for debugging
        print("Received event:", json.dumps(event))

        # Check if the event contains a body field
        if 'body' in event:
            body_str = event['body']
            print("Received body:", body_str)
        else:
            # Direct invocation or Function URL scenario
            body_str = json.dumps(event)

        try:
            body = json.loads(body_str)
        except json.JSONDecodeError as e:
            raise ValueError('Body is not valid JSON')

        print("Parsed body:", body)

        if 'email' not in body or 'operation' not in body:
            raise ValueError('Missing email or operation in body')

        email = body['email']
        operation = body['operation']

        if operation == 'register':
            subject = 'Registration Successful'
            message = f'Welcome, {email}! Your registration was successful.'
        elif operation == 'login':
            subject = 'Login Successful'
            message = f'Hello, {email}! You have successfully logged in.'
        else:
            raise ValueError('Invalid operation')

        send_notification(email, subject, message)

        response = {
            'statusCode': 200,
            'body': json.dumps({'message': f'{operation.capitalize()} notification sent successfully'})
        }
    except Exception as e:
        # Log the error for debugging
        print("Error:", str(e))
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

    return response
