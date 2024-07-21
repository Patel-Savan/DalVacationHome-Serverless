# Loading variables from .env file
set -a
source .env
set +a

# Delete the Firestore (default) database.
gcloud firestore databases delete --database="(default)" -q

# Delete the deployment
gcloud deployment-manager deployments delete $DEPLOYMENT_NAME -q

# Delete the Analyze Sentiment source code bucket
gsutil rm -r gs://$ANALYZE_SENTIMENT_BUCKET_NAME/

# Delete the Pub/Sub source code bucket
gsutil rm -r gs://$PUBSUB_BUCKET_NAME/

echo "Deployment destroyed."