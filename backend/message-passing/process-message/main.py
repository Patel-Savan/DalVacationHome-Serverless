import base64
import json
from google.cloud import firestore

# Initialize Firestore
db = firestore.Client()

def handle_chat_message(event, context):
    # Decode the Pub/Sub message
    message_data = base64.b64decode(event['data']).decode('utf-8')
    message_json = json.loads(message_data)

    session_id = message_json['session_id']
    sender_id = message_json['sender_id']
    message = message_json['message']

    # Check if a chat session exists or create a new one
    session_ref = db.collection('chat_sessions').document(session_id)
    session_doc = session_ref.get()

    if not session_doc.exists:
        # Create a new chat session
        session_ref.set({
            'sender_id': sender_id,
            'agent_id': 'default_agent',  # TODO: Replace with actual logic to assign an agent
            'status': 'active',
            'created_at': firestore.SERVER_TIMESTAMP,
            'last_message': firestore.SERVER_TIMESTAMP
        })
    else:
        # Update the last message timestamp
        session_ref.update({'last_message': firestore.SERVER_TIMESTAMP})

    # Store the message in Firestore
    db.collection('messages').add({
        'session_id': session_id,
        'sender_id': sender_id,
        'message': message,
        'timestamp': firestore.SERVER_TIMESTAMP
    })

    print(f'Processed message: {message_json}')
