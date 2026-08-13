import requests
import json

s = requests.Session()
s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})

# Test delete_candidate with name vs candidate_id
r = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.delete_candidate', json={
    'candidate_id': 'Real Candidate',
    'name': 'Real Candidate'
})
print("Delete status:", r.status_code)
print("Delete response:", r.json())
