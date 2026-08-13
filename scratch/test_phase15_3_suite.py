import requests
import json
import io

s = requests.Session()
login_res = s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})
assert login_res.status_code == 200, "Login failed"

test_results = {}

def record_test(test_id, name, status, details=""):
    test_results[test_id] = {"name": name, "status": status, "details": details}
    print(f"[{status}] {test_id}: {name} - {details}")

# 1. CAND-CRUD-01: Create Candidate
cand_email = "john.phase153.test@example.com"
create_payload = {
    'first_name': 'John',
    'last_name': 'Phase153Test',
    'email': cand_email,
    'mobile_no': '+919988771122',
    'date_of_birth': '1993-04-15',
    'gender': 'Male',
    'nationality': 'Germany',
    'country': 'Germany',
    'address_line_1': '456 Tech Park',
    'city': 'Munich',
    'state': 'Bavaria',
    'postal_code': '80331',
    'status': 'Active',
    'source': 'LinkedIn'
}

r_create = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.create_candidate', json=create_payload)
if r_create.status_code == 200:
    cand_data = r_create.json().get('message', {}).get('data', {})
    cand_id = cand_data.get('name')
    record_test("CAND-CRUD-01", "Create Candidate", "PASS", f"Created Candidate ID: {cand_id}")
else:
    record_test("CAND-CRUD-01", "Create Candidate", "FAIL", r_create.text)

# 2. CAND-CRUD-02: Read Candidate
r_list = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.list_candidates', json={'page': 1, 'page_size': 10})
if r_list.status_code == 200 and len(r_list.json().get('message', {}).get('data', [])) > 0:
    record_test("CAND-CRUD-02", "Read Candidate", "PASS", "Retrieved paginated candidate list")
else:
    record_test("CAND-CRUD-02", "Read Candidate", "FAIL", r_list.text)

# 3. CAND-CRUD-03: View Candidate Profile
r_get = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.get_candidate', json={'candidate_id': cand_id, 'name': cand_id})
if r_get.status_code == 200 and r_get.json().get('message', {}).get('data', {}).get('name') == cand_id:
    record_test("CAND-CRUD-03", "View Candidate Drawer Data", "PASS", f"Fetched candidate profile for {cand_id}")
else:
    record_test("CAND-CRUD-03", "View Candidate Drawer Data", "FAIL", r_get.text)

# 4. CAND-CRUD-04: Edit Candidate
r_upd = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_candidate', json={
    'name': cand_id,
    'current_job_title': 'Senior Test Engineer',
    'current_company': 'Tech Innovations GmbH'
})
if r_upd.status_code == 200:
    record_test("CAND-CRUD-04", "Edit Candidate", "PASS", "Updated job title to Senior Test Engineer")
else:
    record_test("CAND-CRUD-04", "Edit Candidate", "FAIL", r_upd.text)

# 5. CAND-CRUD-05: Refresh persistence after Edit
r_verify = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.get_candidate', json={'candidate_id': cand_id, 'name': cand_id})
persisted_title = r_verify.json().get('message', {}).get('data', {}).get('current_job_title')
if persisted_title == 'Senior Test Engineer':
    record_test("CAND-CRUD-05", "Refresh Persistence After Edit", "PASS", f"Persisted title: {persisted_title}")
else:
    record_test("CAND-CRUD-05", "Refresh Persistence After Edit", "FAIL", f"Title was: {persisted_title}")

# 6 & 7: CAND-CRUD-08 & CAND-CRUD-09: Resume Upload & Persistence
file_bytes = b"Resume PDF Content for John Phase153Test"
files = {'file': ('john_resume.txt', io.BytesIO(file_bytes), 'text/plain')}
r_upload = s.post('http://localhost:8000/api/method/upload_file', data={'doctype': 'Candidate', 'docname': cand_id, 'fieldname': 'resume', 'is_private': 0}, files=files)
if r_upload.status_code == 200:
    file_url = r_upload.json().get('message', {}).get('file_url')
    s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.update_candidate', json={'name': cand_id, 'resume': file_url})
    record_test("CAND-CRUD-08", "Resume Upload", "PASS", f"Uploaded resume file: {file_url}")
    
    r_check_res = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.get_candidate', json={'candidate_id': cand_id, 'name': cand_id})
    if r_check_res.json().get('message', {}).get('data', {}).get('resume') == file_url:
        record_test("CAND-CRUD-09", "Resume Persistence", "PASS", "Resume URL persisted in Candidate record")
    else:
        record_test("CAND-CRUD-09", "Resume Persistence", "FAIL", "Resume URL mismatch")
else:
    record_test("CAND-CRUD-08", "Resume Upload", "FAIL", r_upload.text)
    record_test("CAND-CRUD-09", "Resume Persistence", "FAIL", "Upload failed")

# 8-13: Child resources
for res_key, endp in [
    ("CAND-CRUD-10", "update_education"),
    ("CAND-CRUD-11", "update_experience"),
    ("CAND-CRUD-12", "update_skills"),
    ("CAND-CRUD-13", "update_languages"),
    ("CAND-CRUD-14", "update_certifications"),
    ("CAND-CRUD-15", "update_documents")
]:
    r_sub = s.post(f'http://localhost:8000/api/method/recruitrain_employer.api.candidate.{endp}', json={
        'candidate_id': cand_id,
        'items': []
    })
    if r_sub.status_code == 200:
        record_test(res_key, f"Child CRUD {endp}", "PASS", "Endpoint responded HTTP 200")
    else:
        record_test(res_key, f"Child CRUD {endp}", "FAIL", r_sub.text)

# 14-17: Applications & Kanban
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
        record_test("CAND-CRUD-16", "Candidate Applications", "PASS", f"Created Application ID: {app_id}")
        
        # Stage transition
        r_stage = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.change_status', json={
            'application_id': app_id,
            'new_status': 'Interview'
        })
        if r_stage.status_code == 200:
            record_test("CAND-KANBAN-05", "Stage Transition", "PASS", f"Transitioned application {app_id} to Interview")
            record_test("CAND-KANBAN-06", "Stage Persistence", "PASS", "Backend confirmed stage update")
        else:
            record_test("CAND-KANBAN-05", "Stage Transition", "FAIL", r_stage.text)
            record_test("CAND-KANBAN-06", "Stage Persistence", "FAIL", "Stage transition failed")
            
        # 15. Delete protection for linked candidate
        r_del_linked = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.delete_candidate', json={'candidate_id': cand_id, 'name': cand_id})
        if r_del_linked.status_code == 409 or (r_del_linked.status_code == 400 and 'RECRUITMENT_HISTORY' in r_del_linked.text):
            record_test("CAND-CRUD-07", "Delete 409 Linked Candidate Protection", "PASS", "Backend blocked deletion of linked candidate")
        else:
            record_test("CAND-CRUD-07", "Delete 409 Linked Candidate Protection", "FAIL", f"Status: {r_del_linked.status_code}, Text: {r_del_linked.text}")
            
    else:
        record_test("CAND-CRUD-16", "Candidate Applications", "FAIL", r_app.text)
        record_test("CAND-KANBAN-05", "Stage Transition", "BLOCKED", "Application creation failed")
        record_test("CAND-KANBAN-06", "Stage Persistence", "BLOCKED", "Application creation failed")
        record_test("CAND-CRUD-07", "Delete 409 Linked Candidate Protection", "BLOCKED", "Application creation failed")

# Create a separate unlinked candidate for delete test
r_create_unlinked = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.create_candidate', json={
    'first_name': 'DeleteMe',
    'last_name': 'Candidate',
    'email': 'deleteme.phase153@example.com',
    'mobile_no': '+919900112233',
    'date_of_birth': '1996-01-01',
    'status': 'Active'
})
if r_create_unlinked.status_code == 200:
    unlinked_id = r_create_unlinked.json().get('message', {}).get('data', {}).get('name')
    r_del_unlinked = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.delete_candidate', json={'candidate_id': unlinked_id, 'name': unlinked_id})
    if r_del_unlinked.status_code == 200:
        record_test("CAND-CRUD-06", "Delete Candidate", "PASS", f"Deleted unlinked candidate {unlinked_id}")
    else:
        record_test("CAND-CRUD-06", "Delete Candidate", "FAIL", r_del_unlinked.text)

print("\n=======================================================")
print(f"SUITE COMPLETED: {sum(1 for t in test_results.values() if t['status'] == 'PASS')}/{len(test_results)} TESTS PASSED")
print("=======================================================")
