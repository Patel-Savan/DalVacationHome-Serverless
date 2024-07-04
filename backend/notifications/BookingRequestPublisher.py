import json
import boto3
import os

sns_client = boto3.client('sns')
topic_arn = os.environ['SNS_TOPIC_ARN']

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        user_email = body['user_email']
        booking_details = body['booking_details']
        
        # Publish booking request to SNS topic
        sns_client.publish(
            TopicArn=topic_arn,
            Message=json.dumps({
                'user_email': user_email,
                'booking_details': booking_details
            }),
            Subject='Booking Request'
        )
        
        response = {
            'statusCode': 200,
            'body': json.dumps({'message': 'Booking request sent for approval successfully'})
        }
    except Exception as e:
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    
    return response
