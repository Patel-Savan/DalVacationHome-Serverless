import functions_framework
from google.cloud import firestore
import json

@functions_framework.http
def check_active_sessions(request):
    # Set CORS headers for the preflight request
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }
        return ("", 204, headers)

    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}

    # Parse the request JSON
    request_json = request.get_json()
    agent_id = request_json.get('agent_id')
    delete_session = request_json.get('delete', False)

    if not agent_id:
        return ({"error": "agent_id is required"}, 400, headers)

    # Firestore client
    db = firestore.Client()
    sessions_ref = db.collection('chat_sessions')
    sessions = sessions_ref.where('agent_id', '==', agent_id).stream()

    session_id = None
    for session in sessions:
        session_id = session.id
        if delete_session:
            # Send disconnect message to customer
            db.collection('messages').add({
                'session_id': session_id,
                'sender_id': agent_id,
                'message': 'Agent has disconnected. Please try again!',
                'timestamp': firestore.SERVER_TIMESTAMP
            })
            # Delete the session
            session.reference.delete()
            return ({"message": "Session deleted"}, 200, headers)

    if session_id:
        return ({"sessionId": session_id}, 200, headers)
    else:
        return ({"error": "No active session found"}, 404, headers)
