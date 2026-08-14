import requests

session = requests.Session()
session.post('http://localhost:8000/api/method/login', data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'})

res = session.get('http://localhost:8000/api/resource/Employer User?fields=["name","first_name","last_name","full_name","phone","bio","role","status","company","login_count"]')
print("List status:", res.status_code)
print("List response:", res.json())
