from google.cloud import firestore

# Initialize Firestore
db = firestore.Client()

def handle_chat_message(request):
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
        
        session_id = request_json.get('session_id')
        sender_id = request_json.get('sender_id')
        message = request_json.get('message')

        if not session_id or not sender_id or not message:
            return ('Missing required fields', 400)

        # Store the message in Firestore
        db.collection('messages').add({
            'session_id': session_id,
            'sender_id': sender_id,
            'message': message,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        headers = {
            'Access-Control-Allow-Origin': '*',
        }
        return ('Processed message!', 200, headers)

    # If the request method is not POST or OPTIONS, return a 405 Method Not Allowed error
    return ('Method Not Allowed', 405)
