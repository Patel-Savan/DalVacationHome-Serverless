# Loading variables from .env file
set -a
source .env
set +a

# Authenticating with Google Cloud (THIS IS OPTIONAL, WILL RUN FIRST TIME ONLY)
# gcloud auth login
# gcloud config set project $PROJECT_ID

# Creating a storage bucket
gsutil mb -l $REGION gs://$BUCKET_NAME/

# Zipping the source code
zip $ZIP_FILE ../../backend/message-passing/main.py ../../backend/message-passing/requirements.txt

# Uploading the zip file to the bucket
gsutil cp $ZIP_FILE gs://$BUCKET_NAME/

# Removing the zip file
rm $ZIP_FILE

# Setting the zip file bucket URL
SOURCE_ARCHIVE_URL="gs://$BUCKET_NAME/$ZIP_FILE"

echo $SOURCE_ARCHIVE_URL

# TODO: Change this to dynamic
# Substitute variables in deployment.yaml
# envsubst < deployment.yaml > deployment_substituted.yaml

# Deploy the infrastructure using Deployment Manager
gcloud deployment-manager deployments create $DEPLOYMENT_NAME --config deployment_substituted.yaml

echo "Deployment completed."