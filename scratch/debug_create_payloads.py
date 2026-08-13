import requests
import json

s = requests.Session()
login_res = s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})
print("Login status:", login_res.status_code)

# Test 1: JSON payload with snake_case
payload1 = {
    'first_name': 'Test1',
    'last_name': 'Candidate1',
    'email': 'test1.debug@recruitrain.de',
    'mobile_no': '+919876543210',
    'date_of_birth': '1995-05-05',
    'gender': 'Male',
    'nationality': 'Germany',
    'country': 'Germany',
    'address_line_1': 'Test Street 1',
    'city': 'Berlin',
    'state': 'Berlin',
    'postal_code': '10115',
    'status': 'Active'
}

r1 = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.create_candidate', json=payload1)
print("\n--- Test 1 (JSON Direct Payload) ---")
print("Status:", r1.status_code)
print("Response:", json.dumps(r1.json(), indent=2))

# Test 2: Nested payload (e.g. if wrapper object was sent)
payload2 = {
    'data': payload1
}
r2 = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.create_candidate', json=payload2)
print("\n--- Test 2 (Nested data wrapper) ---")
print("Status:", r2.status_code)
print("Response:", json.dumps(r2.json(), indent=2))

# Test 3: Form-data payload instead of JSON
r3 = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.create_candidate', data=payload1)
print("\n--- Test 3 (Form Data payload) ---")
print("Status:", r3.status_code)
print("Response:", json.dumps(r3.json(), indent=2))
