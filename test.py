import requests
import json

def make_api_request():
    url = 'https://vh8bz4x2e6.execute-api.us-east-1.amazonaws.com/test/dynamodbmanager'

    payload = {
        "operation": "gpt_query",
        "payload": {
            "Key": {
                "id": "5678EFGH"
            }
        }
    }
    
    headers = {
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)

        if response.ok:
            data = response.json()
            return data
        else:
            response.raise_for_status()

    except requests.exceptions.RequestException as e:
        print(f"Error making API request: {e}")
        return None

# Call the function to make the API request
api_response = make_api_request()

# Print the response data
if api_response:
    print(json.dumps(api_response, indent=2))
