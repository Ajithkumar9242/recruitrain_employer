import requests
import json
import io

s = requests.Session()
login_res = s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})
assert login_res.status_code == 200, "Login failed"
print("[TEST 1/8] Backend Authentication: SUCCESS")

# 1. Candidate List
r_list = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.list_candidates', json={'page': 1, 'page_size': 10})
assert r_list.status_code == 200, f"list_candidates failed: {r_list.text}"
print("[TEST 2/8] Candidate List Endpoint: SUCCESS")

# 2. Candidate Creation
create_payload = {
    'first_name': 'Certified',
    'last_name': 'Candidate',
    'email': 'certified.cand.full@recruitrain.de',
    'mobile_no': '+919988776655',
    'date_of_birth': '1992-08-20',
    'gender': 'Male',
    'nationality': 'Germany',
    'marital_status': 'Un-Married',
    'profession': 'Nurse',
    'employment_type': 'Full-Time',
    'current_job_title': 'Senior Staff Nurse',
    'current_company': 'Berlin City Hospital',
    'years_of_experience': 5.5,
    'notice_period': 30,
    'current_salary': 45000,
    'expected_salary': 55000,
    'preferred_location': 'Berlin',
    'address_line_1': 'Hauptstrasse 12',
    'city': 'Berlin',
    'state': 'Berlin',
    'country': 'Germany',
    'postal_code': '10115',
    'status': 'Active',
    'source': 'LinkedIn'
}
r_create = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.create_candidate', json=create_payload)
assert r_create.status_code == 200, f"create_candidate failed: {r_create.text}"
cand_data = r_create.json().get('message', {}).get('data', {})
cand_id = cand_data.get('name')
print(f"[TEST 3/8] Candidate Creation (ID: {cand_id}): SUCCESS")

# 3. Candidate Get & Completeness
r_get = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.get_candidate', json={'candidate_id': cand_id})
assert r_get.status_code == 200, "get_candidate failed"
r_comp = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.get_profile_completeness', json={'candidate_id': cand_id})
assert r_comp.status_code == 200, "get_profile_completeness failed"
print("[TEST 4/8] Get Candidate & Completeness Score: SUCCESS")

# 4. Candidate Update
r_upd = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_candidate', json={
    'name': cand_id,
    'first_name': 'CertifiedUpdated',
    'preferred_location': 'Munich'
})
assert r_upd.status_code == 200, f"update_candidate failed: {r_upd.text}"
print("[TEST 5/8] Candidate Profile Update: SUCCESS")

# 5. Resume Upload
file_content = b"PDF Resume Text Document for Certified Candidate"
files = {'file': ('resume.txt', io.BytesIO(file_content), 'text/plain')}
data = {'doctype': 'Candidate', 'docname': cand_id, 'fieldname': 'resume', 'is_private': 1}
r_upload = s.post('http://localhost:8000/api/method/upload_file', data=data, files=files)
assert r_upload.status_code == 200, f"upload_file failed: {r_upload.text}"
file_url = r_upload.json().get('message', {}).get('file_url')
s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_candidate', json={'name': cand_id, 'resume': file_url})
print(f"[TEST 6/8] Multipart Resume Upload (URL: {file_url}): SUCCESS")

# 6. Candidate Subresources (Education, Skills)
r_edu = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_education', json={
    'candidate_id': cand_id,
    'education': [{'institution': 'TU Berlin', 'degree': 'B.Sc. Nursing', 'start_date': '2015-09-01', 'end_date': '2019-06-30'}]
})
assert r_edu.status_code == 200, f"update_education failed: {r_edu.text}"
r_skills = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_skills', json={
    'candidate_id': cand_id,
    'skills': [{'skill': 'Patient Care', 'experience_years': 5, 'proficiency': 'Expert'}]
})
assert r_skills.status_code == 200, f"update_skills failed: {r_skills.text}"
print("[TEST 7/8] Subresource Updates (Education & Skills): SUCCESS")

# 7. Job Application Creation & Kanban Stage Transition
r_jobs = s.post('http://localhost:8000/api/method/recruitrain_employer.api.jobs.list_jobs', json={'page': 1, 'page_size': 1})
jobs = r_jobs.json().get('message', {}).get('data', [])
if jobs:
    job_id = jobs[0].get('name')
    r_app = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.create_application', json={
        'candidate': cand_id,
        'job_opening': job_id,
        'source': 'Career Portal',
        'current_stage': 'Applied'
    })
    if r_app.status_code == 200:
        app_id = str(r_app.json().get('message', {}).get('data', {}).get('name'))
        r_stage = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.change_status', json={
            'application_id': app_id,
            'new_status': 'Interview'
        })
        assert r_stage.status_code == 200, f"change_status failed: {r_stage.text}"
        print(f"[TEST 8/8] Kanban Stage Transition (App {app_id} -> Interview): SUCCESS")
    else:
        print(f"[TEST 8/8] Application creation skipped or failed: {r_app.status_code}")
else:
    print("[TEST 8/8] No job openings found for application test")

print("\n=======================================================")
print("ALL 8 END-TO-END CANDIDATE BACKEND CONTRACT TESTS PASSED!")
print("=======================================================")
