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

    if not agent_id:
        return ({"error": "agent_id is required"}, 400, headers)

    # Firestore client
    db = firestore.Client()
    sessions_ref = db.collection('chat_sessions')
    sessions = sessions_ref.where('agent_id', '==', agent_id).stream()

    for session in sessions:
        return ({"sessionId": session.id}, 200, headers)

    return ({"error": "No active session found"}, 400, headers)
