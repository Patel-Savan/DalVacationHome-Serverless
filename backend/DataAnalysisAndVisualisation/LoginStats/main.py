import json
from google.cloud import bigquery

def insert_to_bigquery(request):
    request_json = request.get_json(silent=True)
    
    if request_json is None:
        return json.dumps({'message': 'Bad Request: No JSON payload provided'}), 400
    
    username = request_json.get('username')
    useremail = request_json.get('useremail')
    role = request_json.get('role')
    action = request_json.get('action')
    date = request_json.get('date')
    time = request_json.get('time')

    if not all([username, useremail, role, action, date, time]):
        return json.dumps({'message': 'Bad Request: Missing required fields'}), 400

    # Initialize BigQuery client
    client = bigquery.Client()
    dataset_id = 'csci-5409-428302.user_data'  # your dataset ID
    table_id = 'login_info'                    # your table ID
    table_ref = client.dataset(dataset_id).table(table_id)

    rows_to_insert = [
        {u'username': username, u'useremail': useremail, u'role': role, u'action': action, u'date': date, u'time': time}
    ]
    
    errors = client.insert_rows_json(table_ref, rows_to_insert)
    
    if errors == []:
        return json.dumps({'message': 'Login stats successfully inserted into BigQuery'}), 200
    else:
        return json.dumps({'message': 'Failed to insert into BigQuery', 'errors': errors}), 500
