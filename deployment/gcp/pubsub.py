# This function defines the creation of Pub/Sub topics and a default subscription
def GenerateConfig(context):
    resources = []

    topic_name = context.properties['topic']
    project_id = context.env['project']
    subscription_name = f"{topic_name}-subscription"

    # Creating Pub/Sub topic
    resources.append({
        'name': topic_name,
        'type': 'gcp-types/pubsub-v1:projects.topics',
        'properties': {
            'name': f'projects/{project_id}/topics/{topic_name}',
            'topic': topic_name
        }
    })

    # Creating Pub/Sub subscription
    resources.append({
        'name': subscription_name,
        'type': 'gcp-types/pubsub-v1:projects.subscriptions',
        'properties': {
            'name': f'projects/{project_id}/subscriptions/{subscription_name}',
            'topic': f'projects/{project_id}/topics/{topic_name}',
            'subscription': subscription_name
        },
        'metadata': {
            'dependsOn': [topic_name]
        }
    })

    return {'resources': resources}
