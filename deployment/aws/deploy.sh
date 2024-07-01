#!/bin/bash

# Variables
BUCKET_NAME="your-bucket-name"
ZIP_FILE="function.zip"
LAMBDA_FILE="BookingApprovalLambda.py"
STACK_NAME="DALVacationHomeNotificationStack"
TEMPLATE_FILE="notification-module.yaml"
EMAIL="your-email@example.com"
REGION="your-region"

# Zip the Lambda function code
echo "Zipping Lambda function code..."
zip $ZIP_FILE $LAMBDA_FILE

# Upload the Lambda function code to S3
echo "Uploading Lambda function code to S3..."
aws s3 cp $ZIP_FILE s3://$BUCKET_NAME/

# Create or update the CloudFormation stack
echo "Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file $TEMPLATE_FILE \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        S3BucketName=$BUCKET_NAME \
        S3Key=$ZIP_FILE \
        NotificationEmail=$EMAIL \
    --region $REGION \
    --capabilities CAPABILITY_NAMED_IAM

echo "Deployment complete!"
