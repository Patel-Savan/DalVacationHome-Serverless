import json
from google.cloud import language_v1

client = language_v1.LanguageServiceClient()

def analyze_sentiment(request):
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
            return ('Invalid JSON', 400, {'Access-Control-Allow-Origin': '*'})

        feedback = request_json.get('feedback')
        if not feedback:
            return ('Feedback is required', 400, {'Access-Control-Allow-Origin': '*'})

        document = language_v1.Document(content=feedback, type_=language_v1.Document.Type.PLAIN_TEXT)
        sentiment = client.analyze_sentiment(request={'document': document}).document_sentiment

        headers = {
            'Access-Control-Allow-Origin': '*',
        }
        return (json.dumps({
            'score': sentiment.score,
            'magnitude': sentiment.magnitude
        }), 200, headers)

    return ('Method Not Allowed', 405, {'Access-Control-Allow-Origin': '*'})
