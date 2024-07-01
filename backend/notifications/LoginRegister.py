import json
import boto3

sns_client = boto3.client('sns')
topic_arn = 'arn:aws:sns:your-region:your-account-id:NotificationTopic'  # Replace with your SNS topic ARN

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
        body = json.loads(event['body'])
        email = body['email']
        operation = body['operation']  # 'login' or 'register'
        
        if operation == 'register':
            subject = 'Registration Successful'
            message = f'Welcome, {email}! Your registration was successful.'
        elif operation == 'login':
            subject = 'Login Successful'
            message = f'Hello, {email}! You have successfully logged in.'
        else:
            raise ValueError('Invalid operation')
        
        # Send notification
        send_notification(email, subject, message)
        
        response = {
            'statusCode': 200,
            'body': json.dumps({'message': f'{operation.capitalize()} notification sent successfully'})
        }
    except Exception as e:
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    
    return response
