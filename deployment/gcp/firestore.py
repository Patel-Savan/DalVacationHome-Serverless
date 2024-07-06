# This function defines the setup for Firestore.
def GenerateConfig(context):
    resources = []

    resources.append({
        'name': 'firestore-database',
        'type': 'gcp-types/firestore-v1:projects.databases',
        'properties': {
            'project': context.env['project'],
            'databaseId': '(default)',
            'type': 'FIRESTORE_NATIVE'
        }
    })

    return {'resources': resources}
