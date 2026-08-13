import requests
import json

s = requests.Session()
login_res = s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})
print("Login status:", login_res.status_code)

# 1. List Candidates to get a valid candidate ID
r_cand = s.post('http://localhost:8000/api/method/recruitrain_employer.api.candidate.list_candidates', json={'page': 1, 'page_size': 5})
print("List Candidates:", r_cand.status_code)
cand_data = r_cand.json().get('message', {}).get('data', [])
print("Candidates sample:", cand_data[:1] if cand_data else "None")

# 2. List Job Openings to get a valid job_opening ID
r_jobs = s.post('http://localhost:8000/api/method/recruitrain_employer.api.jobs.list_jobs', json={'page': 1, 'page_size': 5})
print("List Jobs:", r_jobs.status_code)
jobs_data = r_jobs.json().get('message', {}).get('data', [])
print("Jobs sample:", jobs_data[:1] if jobs_data else "None")

# 3. List Applications
r_apps = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.list_applications', json={'page': 1, 'page_size': 5})
print("List Applications:", r_apps.status_code)
apps_data = r_apps.json().get('message', {})
print("Apps structure keys:", list(apps_data.keys()) if isinstance(apps_data, dict) else type(apps_data))
if isinstance(apps_data, dict):
    print("Apps meta:", apps_data.get('meta'))
    items = apps_data.get('data', [])
    print(f"Items count: {len(items)}")
    if items:
        print("First app sample:", json.dumps(items[0], indent=2))
