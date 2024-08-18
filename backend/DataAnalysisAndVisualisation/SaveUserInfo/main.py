import json
from google.cloud import bigquery

def insert_user_details(request):
    request_json = request.get_json(silent=True)
    
    if request_json is None:
        return json.dumps({'message': 'Bad Request: No JSON payload provided'}), 400
    
    username = request_json.get('username')
    useremail = request_json.get('useremail')
    favMovie = request_json.get('favMovie')
    favFriend = request_json.get('favFriend')
    favFood = request_json.get('favFood')
    role = request_json.get('role')
    key = request_json.get('key')
    
    if not all([username, useremail, favMovie, favFriend, favFood, role, key]):
        return json.dumps({'message': 'Bad Request: Missing required fields'}), 400

    # Initialize BigQuery client
    client = bigquery.Client()
    dataset_id = 'user_data'  # your dataset ID (without project ID)
    table_id = 'user_details'  # your table ID
    table_ref = client.dataset(dataset_id).table(table_id)

    rows_to_insert = [
        {
            'username': username,
            'useremail': useremail,
            'favMovie': favMovie,
            'favFriend': favFriend,
            'favFood': favFood,
            'role': role,
            'key': key
        }
    ]
    
    errors = client.insert_rows_json(table_ref, rows_to_insert)
    
    if errors == []:
        return json.dumps({'message': 'User details successfully inserted into BigQuery'}), 200
    else:
        return json.dumps({'message': 'Failed to insert into BigQuery', 'errors': errors}), 500
