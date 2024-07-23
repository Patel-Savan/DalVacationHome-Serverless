import base64
import json
from google.cloud import firestore

# Initialize Firestore
db = firestore.Client()

def get_active_agent():
    # Query the agents_status collection for an active agent
    agents_ref = db.collection('agents_status')
    active_agents = agents_ref.where('status', '==', 'active').limit(1).get()
    
    if active_agents:
        for agent in active_agents:
            return agent
    return None

def mark_agent_busy(agent_id):
    # Update the agent's status to busy
    agent_ref = db.collection('agents_status').document(agent_id)
    agent_ref.update({'status': 'busy'})

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
        # Get an active agent ID
        agent = get_active_agent()

        if agent:
            agent_id = agent.id
            # Mark the agent as busy
            mark_agent_busy(agent_id)

            # Create a new chat session
            session_ref.set({
                'sender_id': sender_id,
                'agent_id': agent_id,
                'status': 'active',
                'created_at': firestore.SERVER_TIMESTAMP,
                'last_message': firestore.SERVER_TIMESTAMP
            })
        else:
            # Handle the case where no active agents are available
            print('No active agents available. Retrying...')
            raise Exception('No active agents available.')
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
