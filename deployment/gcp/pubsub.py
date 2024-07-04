# This function defines the creation of Pub/Sub topics and a default subscription
def GenerateConfig(context):
    resources = []

    topic_name = context.properties['topic']
    project_id = context.env['project']

    # Creating Pub/Sub topic
    resources.append({
        'name': topic_name,
        'type': 'gcp-types/pubsub-v1:projects.topics',
        'properties': {
            'name': f'projects/{project_id}/topics/{topic_name}',
            'topic': topic_name
        }
    })

    return {'resources': resources}
