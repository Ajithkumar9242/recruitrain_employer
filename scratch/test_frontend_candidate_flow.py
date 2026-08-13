import requests
import json

s = requests.Session()
login_res = s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})
print("Login status:", login_res.status_code)

# 1. Test get_candidate with name/candidate_id
r_list = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.list_candidates', json={'page': 1, 'page_size': 5})
cands = r_list.json().get('message', {}).get('data', [])
if cands:
    cand_id = cands[0].get('name') or cands[0].get('id')
    print("\n--- Test get_candidate for candidate_id =", cand_id, "---")
    r_get = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.get_candidate', json={'candidate_id': cand_id, 'name': cand_id})
    print("get_candidate status:", r_get.status_code)
    print("get_candidate response envelope keys:", list(r_get.json().keys()))
    print("get_candidate message keys:", list(r_get.json().get('message', {}).keys()))

    # 2. Test update_candidate for candidate_id
    print("\n--- Test update_candidate for name =", cand_id, "---")
    r_upd = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_candidate', json={
        'name': cand_id,
        'current_job_title': 'Senior Test Engineer'
    })
    print("update_candidate status:", r_upd.status_code)
    print("update_candidate response:", json.dumps(r_upd.json(), indent=2)[:300])

# 3. Test create_candidate with valid payload
print("\n--- Test create_candidate ---")
new_cand_payload = {
    'first_name': 'John',
    'last_name': 'TestCandidate',
    'email': 'john.testcandidate.3@example.com',
    'mobile_no': '+919876543219',
    'date_of_birth': '1990-01-01',
    'gender': 'Male',
    'nationality': 'Germany',
    'country': 'Germany',
    'address_line_1': '123 Main St',
    'city': 'Berlin',
    'state': 'Berlin',
    'postal_code': '10115',
    'status': 'Active',
    'source': 'Career Portal'
}
r_create = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.create_candidate', json=new_cand_payload)
print("create_candidate status:", r_create.status_code)
print("create_candidate response:", json.dumps(r_create.json(), indent=2))
