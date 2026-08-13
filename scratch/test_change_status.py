import requests
import json

s = requests.Session()
s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})

r_status = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.change_status', json={
    'application_id': '298',
    'new_status': 'Shortlisted'
})
print("Change Status response:", r_status.status_code)
print(json.dumps(r_status.json(), indent=2))
