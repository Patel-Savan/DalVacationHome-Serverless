# This function defines the creation of a Cloud Function.
def GenerateConfig(context):
    resources = []

    function_name = context.env['name']
    properties = context.properties
    project_id = context.env['project']
    region = properties['location']

    resources.append({
        'name': function_name,
        'type': 'gcp-types/cloudfunctions-v1:projects.locations.functions',
        'properties': {
            'parent': f'projects/{project_id}/locations/{region}',
            'location': region,
            'function': function_name,
            'entryPoint': properties['entryPoint'],
            'runtime': properties['runtime'],
            'sourceArchiveUrl': 'gs://dalvacationhome-pubsub-code-bucket/pubsub_function_source.zip',   #TODO: Change it to dynamic
            'eventTrigger': properties['eventTrigger']
        }
    })

    return {'resources': resources}
