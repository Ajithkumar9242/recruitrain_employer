import requests
import json
import time

s = requests.Session()
login_res = s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})
print("Login status:", login_res.status_code)

timestamp = int(time.time())
cand_res = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.create_candidate', json={
    "first_name": "AppTester",
    "last_name": f"User{timestamp}",
    "email": f"apptester{timestamp}@recruitrain.de"
})
print("Create candidate response:", json.dumps(cand_res.json(), indent=2))
