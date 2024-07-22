# ========== *** Loading variables from .env file *** ==========
set -a
source .env
set +a



# ========== *** PUB/SUB FUNCTIONS SOURCE CODE UPLOAD TO BUCKETS *** ==========

# creating storage bucket
gsutil mb -l $DEPLOYMENT_REGION gs://$PUBSUB_BUCKET_NAME/

# zipping code
(cd ../../backend/message-passing/publish-message && zip $PUBLISH_TO_CUSTOMER_MESSAGE_TOPIC_CODE_ZIP main.py requirements.txt)

# uploading zipped code
(cd ../../backend/message-passing/publish-message && gsutil cp $PUBLISH_TO_CUSTOMER_MESSAGE_TOPIC_CODE_ZIP gs://$PUBSUB_BUCKET_NAME/)

# removing zipped code from local
(cd ../../backend/message-passing/publish-message && rm $PUBLISH_TO_CUSTOMER_MESSAGE_TOPIC_CODE_ZIP)


# zipping code
(cd ../../backend/message-passing/process-customer-message && zip $PROCESS_CUSTOMER_MESSAGE_CODE_ZIP main.py requirements.txt)

# uploading zipped code
(cd ../../backend/message-passing/process-customer-message && gsutil cp $PROCESS_CUSTOMER_MESSAGE_CODE_ZIP gs://$PUBSUB_BUCKET_NAME/)

# removing zipped code from local
(cd ../../backend/message-passing/process-customer-message && rm $PROCESS_CUSTOMER_MESSAGE_CODE_ZIP)


# zipping code
(cd ../../backend/message-passing/process-agent-message && zip $PROCESS_AGENT_MESSAGE_CODE_ZIP main.py requirements.txt)

# uploading zipped code
(cd ../../backend/message-passing/process-agent-message && gsutil cp $PROCESS_AGENT_MESSAGE_CODE_ZIP gs://$PUBSUB_BUCKET_NAME/)

# removing zipped code from local
(cd ../../backend/message-passing/process-agent-message && rm $PROCESS_AGENT_MESSAGE_CODE_ZIP)


# zipping code
(cd ../../backend/message-passing/process-agent-status && zip $PROCESS_AGENT_STATUS_CODE_ZIP main.py requirements.txt)

# uploading zipped code
(cd ../../backend/message-passing/process-agent-status && gsutil cp $PROCESS_AGENT_STATUS_CODE_ZIP gs://$PUBSUB_BUCKET_NAME/)

# removing zipped code from local
(cd ../../backend/message-passing/process-agent-status && rm $PROCESS_AGENT_STATUS_CODE_ZIP)




# ========== *** ANALYZE SENTIMENT FUNCTION SOURCE UPLOAD TO BUCKETS *** ==========

# creating storage bucket
gsutil mb -l $DEPLOYMENT_REGION gs://$ANALYZE_SENTIMENT_BUCKET_NAME/

# zipping code
(cd ../../backend/sentiment-analysis && zip $ANALYZE_SENTIMENT_SOURCE_CODE_ZIP main.py requirements.txt)

# uploading zipped code
(cd ../../backend/sentiment-analysis && gsutil cp $ANALYZE_SENTIMENT_SOURCE_CODE_ZIP gs://$ANALYZE_SENTIMENT_BUCKET_NAME/)

# removing zipped code from local
(cd ../../backend/sentiment-analysis && rm $ANALYZE_SENTIMENT_SOURCE_CODE_ZIP)






# TODO: Change this to dynamic
# Substitute variables in deployment.yaml
# envsubst < deployment.yaml > deployment_substituted.yaml

# Deploy the infrastructure using Deployment Manager
gcloud deployment-manager deployments create $DEPLOYMENT_NAME --config deployment.yaml






# ========== ALLOWING UNAUTH ACCESS FOR PUBLIC ENDPOINTS ==========

# TODO: Load below function names dynamically

gcloud functions add-iam-policy-binding analyze-sentiment --region=$DEPLOYMENT_REGION --member=allUsers --role=roles/cloudfunctions.invoker

gcloud functions add-iam-policy-binding publish-to-customer-message-topic --region=$DEPLOYMENT_REGION --member=allUsers --role=roles/cloudfunctions.invoker

gcloud functions add-iam-policy-binding process-agent-message --region=$DEPLOYMENT_REGION --member=allUsers --role=roles/cloudfunctions.invoker

gcloud functions add-iam-policy-binding process-agent-status --region=$DEPLOYMENT_REGION --member=allUsers --role=roles/cloudfunctions.invoker




# Create Firestore database with (default) database ID in the specified location
gcloud firestore databases create --location=nam5

# Verify Firestore database creation
# gcloud firestore databases describe






# Check if deployment was successful
if [ $? -eq 0 ]; then
    # Retrieve the Cloud Function URLs
    # TODO: Load below function names dynamically
    gcloud functions describe analyze-sentiment --region $DEPLOYMENT_REGION --format 'value(httpsTrigger.url)'
    gcloud functions describe publish-to-customer-message-topic --region $DEPLOYMENT_REGION --format 'value(httpsTrigger.url)'
    gcloud functions describe process-agent-message --region $DEPLOYMENT_REGION --format 'value(httpsTrigger.url)'
else
    echo "Deployment failed."
fi