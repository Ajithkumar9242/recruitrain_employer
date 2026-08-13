import requests
import json

s = requests.Session()
s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})

# 1. Get or create Job Opening
r_jobs = s.post('http://localhost:8000/api/method/recruitrain_employer.api.jobs.list_jobs', json={'page': 1, 'page_size': 5})
jobs = r_jobs.json().get('message', {}).get('data', [])
if not jobs:
    r_create_job = s.post('http://localhost:8000/api/method/recruitrain_employer.api.jobs.create_job', json={
        'job_title': 'Senior Full Stack Engineer',
        'status': 'Open',
        'employment_type': 'Full-Time'
    })
    job = r_create_job.json().get('message', {}).get('data', {})
else:
    job = jobs[0]

job_id = job.get('name') or job.get('id')
print("Job Opening ID:", job_id)

# 2. Create Candidate
r_cand = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.create_candidate', json={
    'first_name': 'Kanban',
    'last_name': 'Candidate',
    'email': 'kanban.cand.2@recruitrain.de',
    'mobile_no': '+919876543211',
    'date_of_birth': '1996-01-01',
    'gender': 'Female',
    'nationality': 'India',
    'country': 'India',
    'address_line_1': '456 Tech Park',
    'city': 'Bengaluru',
    'state': 'Karnataka',
    'postal_code': '560001',
    'status': 'Active'
})

cand_data = r_cand.json().get('message', {}).get('data') or {}
cand_id = cand_data.get('name') or 'kanban.cand.2@recruitrain.de'
print("Candidate ID:", cand_id)

# 3. Create Job Application
r_app = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.create_application', json={
    'candidate': cand_id,
    'job_opening': job_id,
    'source': 'Career Portal',
    'current_stage': 'Applied'
})
print("Create Application status:", r_app.status_code)
print("Create Application response:", json.dumps(r_app.json(), indent=2))

app_data = r_app.json().get('message', {}).get('data') or {}
app_id = app_data.get('name') or app_data.get('id')

if app_id:
    # 4. Test change_stage
    r_stage = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.change_stage', json={
        'application_id': app_id,
        'new_stage': 'Shortlisted'
    })
    print("\nChange Stage status:", r_stage.status_code)
    print("Change Stage response:", json.dumps(r_stage.json(), indent=2))
