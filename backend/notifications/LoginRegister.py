import json
import boto3
import os

sns_client = boto3.client('sns')
topic_arn = os.environ['SNS_TOPIC_ARN']

def subscribe_user(email):
    try:
        print('inside create subscription')
        # Create subscription with filter policy
        response = sns_client.subscribe(
            TopicArn=topic_arn,
            Protocol='email',
            Endpoint=email,
            Attributes={
                'FilterPolicy': json.dumps({'email': [email]})
            }
        )
        print(f"Subscribed {email} with response: {response}")
    except Exception as e:
        print(f"Failed to subscribe {email}: {str(e)}")

def check_and_subscribe_user(email):
    # Check if the user is already subscribed
    subscriptions = sns_client.list_subscriptions_by_topic(TopicArn=topic_arn)
    subscribed_emails = [sub['Endpoint'] for sub in subscriptions['Subscriptions'] if sub['Protocol'] == 'email']
    
    if email not in subscribed_emails:
        subscribe_user(email)

def send_notification(email,message,subject):
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
        
        # Check and subscribe the user if not already subscribed
        check_and_subscribe_user(email)
         #publishing notification to sns topic
        send_notification(email,message,subject)
        
        response = {
            'statusCode': 200,
            'body': json.dumps({'message': f'{operation.capitalize()} notification sent successfully'})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    
    return response
