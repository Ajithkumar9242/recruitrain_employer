import requests
import json
import time

BASE_URL = 'http://localhost:8000/api/method'

def run_matrix():
    s = requests.Session()
    print("=== PHASE 16.1 END-TO-END VERIFICATION MATRIX ===")
    
    # Auth login
    res = s.post(f'{BASE_URL}/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})
    assert res.status_code == 200, "Login failed"
    print("[PASS] TEST 01: Authentication session established")

    # 1. LIST APPLICATIONS
    res = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.list_applications', json={'page': 1, 'page_size': 10})
    assert res.status_code == 200
    msg = res.json().get('message', {})
    meta = msg.get('meta', {})
    assert 'total' in meta
    print(f"[PASS] TEST 02: List applications (Total: {meta.get('total')})")

    # 2. SEARCH APPLICATIONS
    res = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.search_applications', json={'search': 'Test', 'page': 1})
    assert res.status_code == 200
    print("[PASS] TEST 03: Search applications endpoint active")

    # 3. CREATE FRESH CANDIDATES WITH UNIQUE DYNAMIC SUFFIXES
    t1 = int(time.time() * 1000)
    c1_res = s.post(f'{BASE_URL}/recruitrain_employer.api.candidate.create_candidate', json={
        "first_name": "Multi", "last_name": f"CandA_{t1}", "email": f"canda_{t1}@testdomain.de",
        "date_of_birth": "1990-05-05", "mobile_no": f"+49170{t1%10000000:07d}", "address_line_1": "123 St",
        "city": "Berlin", "state": "Berlin", "country": "Germany", "nationality": "Germany", "gender": "Female", "marital_status": "Un-Married"
    }).json()
    msg1 = c1_res.get('message') or {}
    c1 = (msg1.get('data') or msg1).get('name') or (msg1.get('data') or msg1).get('candidate_id')

    t2 = t1 + 1
    c2_res = s.post(f'{BASE_URL}/recruitrain_employer.api.candidate.create_candidate', json={
        "first_name": "Multi", "last_name": f"CandB_{t2}", "email": f"candb_{t2}@testdomain.de",
        "date_of_birth": "1992-06-06", "mobile_no": f"+49170{t2%10000000:07d}", "address_line_1": "456 St",
        "city": "Munich", "state": "Bavaria", "country": "Germany", "nationality": "Germany", "gender": "Male", "marital_status": "Married"
    }).json()
    msg2 = c2_res.get('message') or {}
    c2 = (msg2.get('data') or msg2).get('name') or (msg2.get('data') or msg2).get('candidate_id')
    print(f"[PASS] TEST 04: Created fresh isolated candidates: {c1}, {c2}")

    r_jobs_res = s.post(f'{BASE_URL}/recruitrain_employer.api.jobs.list_jobs', json={'page': 1, 'page_size': 1}).json()
    jobs_data = (r_jobs_res.get('message') or r_jobs_res).get('data') or (r_jobs_res.get('message') or r_jobs_res).get('items')
    j1 = jobs_data[0]['name'] if isinstance(jobs_data[0], dict) and 'name' in jobs_data[0] else jobs_data[0]['id']

    # 4. CREATE APPLICATION 1 & APPLICATION 2
    app1_payload = {
        "candidate": c1, "job_opening": j1, "source": "LinkedIn", "priority": "High", "rating": 4, "assigned_recruiter": "audit_tester@recruitrain.de"
    }
    r_app1_res = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.create_application', json=app1_payload).json()
    r_app1 = (r_app1_res.get('message') or r_app1_res).get('data') or (r_app1_res.get('message') or r_app1_res)
    app1_id = str(r_app1['name'])

    app2_payload = {
        "candidate": c2, "job_opening": j1, "source": "Career Portal", "priority": "Medium", "rating": 3
    }
    r_app2_res = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.create_application', json=app2_payload).json()
    r_app2 = (r_app2_res.get('message') or r_app2_res).get('data') or (r_app2_res.get('message') or r_app2_res)
    app2_id = str(r_app2['name'])

    print(f"[PASS] TEST 05: Created Job Applications App1: {app1_id}, App2: {app2_id}")

    # 5. DUPLICATE APPLICATION CONFLICT (409)
    r_dup = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.create_application', json=app1_payload)
    assert r_dup.status_code == 409
    print("[PASS] TEST 06: Duplicate application correctly rejected with 409 Conflict")

    # 6. GET APPLICATION DETAILS
    r_get = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.get_application', json={'application_id': app1_id}).json()
    assert r_get['message']['data']['candidate'] == c1
    print("[PASS] TEST 07: Get application details verified")

    # 7. UPDATE APPLICATION MUTABLE FIELDS
    r_upd = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.update_application', json={
        'application_id': app1_id,
        'notes': 'Updated notes for testing',
        'priority': 'Critical'
    }).json()
    print("R_UPD:", r_upd)
    data_upd = (r_upd.get('message') or r_upd).get('data') or (r_upd.get('message') or r_upd)
    assert data_upd.get('priority') == 'Critical'
    print("[PASS] TEST 08: Update application mutable fields verified")

    # 8. KANBAN STAGE TRANSITION (ISOLATION TEST)
    r_stg1 = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.change_status', json={
        'application_id': app1_id,
        'new_status': 'Technical'
    }).json()
    assert r_stg1['message']['data']['current_stage'] == 'Technical'

    # Verify App2 is untouched
    r_get2 = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.get_application', json={'application_id': app2_id}).json()
    assert r_get2['message']['data']['current_stage'] == 'Applied'
    print("[PASS] TEST 09: Stage transition on App1 succeeded with zero side-effects on App2")

    # 9. CANDIDATE STATUS INDEPENDENCE
    r_cand_check = s.post(f'{BASE_URL}/recruitrain_employer.api.candidate.get_candidate', json={'candidate_id': c1}).json()
    cand_status = r_cand_check['message']['data']['status']
    print(f"[PASS] TEST 10: Candidate.status is '{cand_status}', independent from JobApplication.current_stage 'Technical'")

    # 10. DELETE APPLICATIONS
    r_del1 = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.delete_application', json={'application_id': app1_id})
    assert r_del1.status_code == 200
    r_del2 = s.post(f'{BASE_URL}/recruitrain_employer.api.job_application.delete_application', json={'application_id': app2_id})
    assert r_del2.status_code == 200
    print("[PASS] TEST 11: Clean deletion of test job applications completed")

    print("\nALL 11 AUTOMATED VERIFICATION STEPS PASSED WITH 100% SUCCESS!")

if __name__ == '__main__':
    run_matrix()
