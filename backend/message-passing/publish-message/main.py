from google.cloud import pubsub_v1
import json

publisher = pubsub_v1.PublisherClient()
# TODO: Make project id to load or inject dynamically during GDM
topic_path = publisher.topic_path('dalvacationhome-dev', 'customer-messages')

def publish_message(request):
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return ('', 204, headers)

    # Handle POST request
    if request.method == 'POST':
        request_json = request.get_json()
        if request_json is None:
            return ('Invalid JSON', 400)
        
        message_data = json.dumps(request_json).encode('utf-8')
        future = publisher.publish(topic_path, message_data)
        headers = {
            'Access-Control-Allow-Origin': '*',
        }
        return ('Message published with ID: {}'.format(future.result()), 200, headers)

    # If the request method is not POST or OPTIONS, return a 405 Method Not Allowed error
    return ('Method Not Allowed', 405)
