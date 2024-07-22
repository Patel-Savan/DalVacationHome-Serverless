import functions_framework
from google.cloud import firestore

@functions_framework.http
def get_messages_by_session(request):
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
    session_id = request_json.get('session_id')

    if not session_id:
        return ({"error": "session_id is required"}, 400, headers)

    # Firestore client
    db = firestore.Client()
    messages_ref = db.collection('messages')
    messages = messages_ref.where('session_id', '==', session_id).stream()

    messages_list = []
    for message in messages:
        messages_list.append(message.to_dict())

    return ({"messages": messages_list}, 200, headers)
