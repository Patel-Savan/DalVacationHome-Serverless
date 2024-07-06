# Loading variables from .env file
set -a
source .env
set +a

# Delete the deployment
gcloud deployment-manager deployments delete $DEPLOYMENT_NAME -q

# Delete the source code bucket
gsutil rm -r gs://$GCS_BUCKET_NAME/