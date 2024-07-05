# Loading variables from .env file
set -a
source .env
set +a

# Authenticating with Google Cloud (THIS IS OPTIONAL, WILL RUN FIRST TIME ONLY)
# gcloud auth login
# gcloud config set project $GCLOUD_PROJECT_ID

# Creating a storage bucket for storing pub/sub code
gsutil mb -l $DEPLOYMENT_REGION gs://$GCS_BUCKET_NAME/

# Zipping the pub/sub source code
zip $SOURCE_CODE_ZIP ../../backend/message-passing/main.py ../../backend/message-passing/requirements.txt

# Uploading the pub/sub source code zip file to the bucket
gsutil cp $SOURCE_CODE_ZIP gs://$GCS_BUCKET_NAME/

# Removing the pub/sub source code zip file
rm $SOURCE_CODE_ZIP

# Setting the pub/sub source code zip file bucket URL
SOURCE_ARCHIVE_URL="gs://$GCS_BUCKET_NAME/$SOURCE_CODE_ZIP"

echo $SOURCE_ARCHIVE_URL

# TODO: Change this to dynamic
# Substitute variables in deployment.yaml
# envsubst < deployment.yaml > deployment_substituted.yaml

# Deploy the infrastructure using Deployment Manager
gcloud deployment-manager deployments create $DEPLOYMENT_NAME --config deployment.yaml

echo "Deployment completed."