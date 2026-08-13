import requests
import json

s = requests.Session()
s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})

r_list = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.list_candidates', json={'page': 1, 'page_size': 1})
cand = r_list.json().get('message', {}).get('data', [])[0]
cand_id = cand.get('name')

print("Testing all fields for update_candidate on candidate:", cand_id)

disallowed = []
allowed = []

for field, val in cand.items():
    if field in ['name', 'doctype', 'owner', 'creation', 'modified', 'modified_by', 'idx']:
        continue
    r = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_candidate', json={
        'name': cand_id,
        field: val
    })
    if r.status_code == 400 and 'cannot be updated' in r.text:
        disallowed.append(field)
    elif r.status_code == 200:
        allowed.append(field)

print("\n--- Disallowed fields in update_candidate ---")
print(disallowed)
print("\n--- Allowed fields in update_candidate ---")
print(allowed)
