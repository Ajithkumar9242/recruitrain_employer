import requests
import json

session = requests.Session()
login_res = session.post(
    'http://localhost:8000/api/method/login',
    data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'}
)
print("Login status:", login_res.status_code)
print("Login response:", login_res.json())

prof_res = session.get('http://localhost:8000/api/method/recruitrain_employer.api.profile.get_my_profile')
print("\nget_my_profile status:", prof_res.status_code)
data = prof_res.json()
print("get_my_profile data:")
print(json.dumps(data, indent=2))
