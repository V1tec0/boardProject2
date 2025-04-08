import requests

URL = 'http://127.0.0.1:8000/api/messages/1/'
# URL = 'http://127.0.0.1:8000/api/messages/'

data = {
    'text': 'фцвфцвфцвфцваппк',
    'isprimary': '0'
}

# response = requests.post(URL, data=data)
response = requests.get(URL)
print(response)
print(response.content)