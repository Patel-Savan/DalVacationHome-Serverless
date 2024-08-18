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

        if not agent_id:
            return ('agent_id is required', 400, {'Access-Control-Allow-Origin': '*'})

        try:
            # Reference to the document
            doc_ref = db.collection('agents_status').document(agent_id)

            if status:
                # If status is provided, update or create the document
                doc_ref.set({'status': status})
                return (json.dumps({'message': 'Status updated successfully', 'status': status}), 200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
            else:
                # If status is not provided, check if the document exists
                doc = doc_ref.get()
                if doc.exists:
                    # Return the current status
                    current_status = doc.to_dict().get('status')
                    return (json.dumps({'status': current_status}), 200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
                else:
                    # Create a new record with default status 'inactive'
                    doc_ref.set({'status': 'inactive'})
                    return (json.dumps({'message': 'New status record created', 'status': 'inactive'}), 200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
        except Exception as e:
            return (json.dumps({'error': str(e)}), 500, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})

    return ('Method Not Allowed', 405, {'Access-Control-Allow-Origin': '*'})
