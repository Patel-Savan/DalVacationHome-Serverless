import json
from google.cloud import firestore

db = firestore.Client()

def agent_status(request):
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
        if not request_json:
            return ('Invalid JSON', 400, {'Access-Control-Allow-Origin': '*'})

        agent_id = request_json.get('agent_id')
        status = request_json.get('status')

        if not agent_id or not status:
            return ('agent_id and status are required', 400, {'Access-Control-Allow-Origin': '*'})

        try:
            # Check if the document exists and update or create it
            doc_ref = db.collection('agents_status').document(agent_id)
            doc_ref.set({'status': status})

            return (json.dumps({'message': 'Status updated successfully'}), 200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
        except Exception as e:
            return (json.dumps({'error': str(e)}), 500, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})

    return ('Method Not Allowed', 405, {'Access-Control-Allow-Origin': '*'})
