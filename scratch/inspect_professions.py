import requests
import json

s = requests.Session()
s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})

r_prof = s.get('http://localhost:8000/api/method/recruitrain_employer.api.master.list_professions')
print("=== PROFESSIONS count ===", len(r_prof.json().get('message', {}).get('data', [])))
print("Professions:", json.dumps(r_prof.json().get('message', {}).get('data', []), indent=2))

r_emp = s.get('http://localhost:8000/api/method/recruitrain_employer.api.master.list_employment_types')
print("=== EMPLOYMENT TYPES ===", json.dumps(r_emp.json().get('message', {}).get('data', []), indent=2))
