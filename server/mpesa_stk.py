import requests
import datetime
import base64
from mpesa_auth import get_access_token
from config import Config

def stk_push(phone_number, amount, order_id):
    access_token = get_access_token()
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    business_short_code = Config.MPESA_SHORTCODE
    passkey = Config.MPESA_PASSKEY
    
    password = base64.b64encode((business_short_code + passkey + timestamp).encode('utf-8')).decode('utf-8')
    
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {
        "BusinessShortCode": business_short_code,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": business_short_code,
        "PhoneNumber": phone_number,
        "CallBackURL": Config.MPESA_CALLBACK_URL,
        "AccountReference": f"ORDER{order_id}",
        "TransactionDesc": f"Payment for Order {order_id}"
    }
    
    response = requests.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        json=payload,
        headers=headers
    )
    return response.json()