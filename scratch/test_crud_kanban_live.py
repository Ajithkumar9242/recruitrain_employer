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
    "email": f"apptester{timestamp}@recruitrain.de",
    "date_of_birth": "1995-01-01",
    "mobile_no": f"+91998877{timestamp % 10000:04d}",
    "address_line_1": "123 Main St",
    "city": "Berlin",
    "state": "Berlin",
    "country": "Germany",
    "nationality": "Germany",
    "gender": "Male",
    "marital_status": "Un-Married"
})
print("Create candidate response:", json.dumps(cand_res.json(), indent=2))
cand = cand_res.json()['message']['data']['name']

r_jobs = s.post('http://localhost:8000/api/method/recruitrain_employer.api.jobs.list_jobs', json={'page': 1, 'page_size': 1})
job = r_jobs.json()['message']['data'][0]['name']

# 2. CREATE
create_payload = {
    "candidate": cand,
    "job_opening": job,
    "source": "LinkedIn",
    "resume": "/files/test_resume.pdf",
    "cover_letter": "Testing cover letter",
    "notes": "Testing notes",
    "priority": "High",
    "rating": 4,
    "assigned_recruiter": "audit_tester@recruitrain.de"
}

r_create = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.create_application', json=create_payload)
print("Create application status:", r_create.status_code)
print("Create response:", json.dumps(r_create.json(), indent=2))

app_data = r_create.json().get('message', {}).get('data', {}) or {}
app_id = app_data.get('name') or app_data.get('id')

if app_id:
    # 3. READ
    r_read = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.get_application', json={'application_id': app_id})
    print("Get application status:", r_read.status_code)
    print("Get application data:", json.dumps(r_read.json(), indent=2))

    # 4. UPDATE
    r_update = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.update_application', json={
        'application_id': app_id,
        'notes': 'Updated notes in test',
        'rating': 5,
        'priority': 'Critical'
    })
    print("Update application status:", r_update.status_code)
    print("Update application response:", json.dumps(r_update.json(), indent=2))

    # 5. KANBAN / STAGE
    r_stage = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.change_status', json={
        'application_id': str(app_id),
        'new_status': 'Technical'
    })
    print("Change status status:", r_stage.status_code)
    print("Change status response:", json.dumps(r_stage.json(), indent=2))

    # 6. DELETE
    r_del = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.delete_application', json={'application_id': app_id})
    print("Delete application status:", r_del.status_code)
    print("Delete application response:", json.dumps(r_del.json(), indent=2))
