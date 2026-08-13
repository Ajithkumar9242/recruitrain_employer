import requests
import json

s = requests.Session()
s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})

r_del = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.delete_application', json={'application_id': '387'})
print("Delete status:", r_del.status_code)
print("Delete response:", json.dumps(r_del.json(), indent=2))
