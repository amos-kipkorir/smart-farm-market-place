import requests
from requests.auth import HTTPBasicAuth
from config import Config

def get_access_token():
    consumer_key = Config.MPESA_CONSUMER_KEY
    consumer_secret = Config.MPESA_CONSUMER_SECRET
    api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    response = requests.get(api_url, auth=HTTPBasicAuth(consumer_key, consumer_secret))
    json_response = response.json()
    return json_response['access_token']