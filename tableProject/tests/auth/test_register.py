import requests

URL = 'http://localhost:8000/api/csrf/'

response = requests.get(URL)
xcsrf_token = response.headers['X-CSRFToken']
csrf_token = response.cookies['csrftoken']
print(xcsrf_token, csrf_token)

# -------------------------------------------------------

URL = 'http://localhost:8000/api/session/'

data = {
    'email': 'abcihbava@gmail.com',
    'password': 'srEdaytgh0'
}

headers = {
    'X-CSRFToken': csrf_token,
    'Cookie': 'csrftoken=' + csrf_token,
}

response = requests.post(URL, data=data, headers=headers)
print(response)
# print(response.text)
print(response.json())