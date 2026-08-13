import requests
import json

s = requests.Session()
s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})

r_list = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.list_candidates', json={'page': 1, 'page_size': 1})
cand = r_list.json().get('message', {}).get('data', [])[0]
cand_id = cand.get('name')

print("Testing update_candidate for candidate_id =", cand_id)

# Test 1: Update job title
r1 = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_candidate', json={
    'name': cand_id,
    'current_job_title': 'Lead System Architect'
})
print("Update job title status:", r1.status_code)
print("Response:", json.dumps(r1.json(), indent=2)[:300])

# Test 2: Update first_name and email
r2 = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_candidate', json={
    'name': cand_id,
    'first_name': 'UpdatedFirst',
    'email': cand.get('email')
})
print("Update first_name status:", r2.status_code)
print("Response:", json.dumps(r2.json(), indent=2)[:300])

# Test 3: What if name is missing in update payload?
r3 = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_candidate', json={
    'candidate_id': cand_id,
    'first_name': 'UpdatedFirst'
})
print("Update without name key status:", r3.status_code)
print("Response:", json.dumps(r3.json(), indent=2)[:300])
