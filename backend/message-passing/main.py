import base64
import functions_framework
from google.cloud import pubsub_v1, firestore
from datetime import datetime
import json

# Initialize Firestore
db = firestore.Client()

# Initialize Pub/Sub
publisher = pubsub_v1.PublisherClient()
agent_topic = 'projects/dalvacationhome/topics/property-agent-messages'

@functions_framework.cloud_event
def hello_pubsub(cloud_event):
    # Decode the Pub/Sub message
    message_data = base64.b64decode(cloud_event.data["message"]["data"]).decode('utf-8')
    message_json = json.loads(message_data)

    # Print the message data to the log
    print('Received message:', message_json)

    # Log message to Firestore
    doc_ref = db.collection('messages').document()
    doc_ref.set({
        **message_json,
        'timestamp': datetime.utcnow()
    })

    # Forward message to property agent topic
    future = publisher.publish(agent_topic, data=message_data.encode('utf-8'))
    print(f'Message published to {agent_topic}: {future.result()}')

    print('Message processed and forwarded:', message_json)
