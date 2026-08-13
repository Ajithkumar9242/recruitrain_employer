import requests
import json

s = requests.Session()
s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})

# 1. List applications
r_apps = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.list_applications', json={'page': 1, 'page_size': 10})
print("List Applications status:", r_apps.status_code)
print("List Applications envelope:", json.dumps(r_apps.json(), indent=2)[:500])

apps = r_apps.json().get('message', {}).get('data', [])
if apps:
    app_id = apps[0].get('name') or apps[0].get('id')
    curr_stage = apps[0].get('current_stage')
    print(f"Testing changeStage on application {app_id} (current stage: {curr_stage})...")
    target_stage = 'Screening' if curr_stage != 'Screening' else 'Applied'
    r_stage = s.post('http://localhost:8000/api/method/recruitrain_employer.api.job_application.change_stage', json={
        'application_id': app_id,
        'new_stage': target_stage
    })
    print("Change stage status:", r_stage.status_code)
    print("Change stage response:", json.dumps(r_stage.json(), indent=2)[:500])
