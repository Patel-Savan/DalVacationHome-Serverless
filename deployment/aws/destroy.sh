#!/bin/bash

# Variables
BUCKET_NAME="your-bucket-name"
ZIP_FILE="function.zip"
STACK_NAME="DALVacationHomeNotificationStack"
REGION="your-region"

# Delete the CloudFormation stack
echo "Deleting CloudFormation stack..."
aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION

# Wait for the stack to be deleted
echo "Waiting for CloudFormation stack to be deleted..."
aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME --region $REGION

# Delete the Lambda function code from S3
echo "Deleting Lambda function code from S3..."
aws s3 rm s3://$BUCKET_NAME/$ZIP_FILE

echo "Cleanup complete!"
