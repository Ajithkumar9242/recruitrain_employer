import requests
import json

BASE_URL = 'http://localhost:8000/api/method'

s = requests.Session()
s.post(f'{BASE_URL}/login', data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'})

url_upgrade = f"{BASE_URL}/recruitrain_employer.api.subscription.upgrade_preview"

# Test with new_plan_name
res = s.post(url_upgrade, json={'new_plan_name': 'Starter'})
print("=== upgrade_preview ('Starter') ===")
print(json.dumps(res.json(), indent=2))

res2 = s.post(url_upgrade, json={'new_plan_name': 'Audit Professional Plan'})
print("\n=== upgrade_preview ('Audit Professional Plan') ===")
print(json.dumps(res2.json(), indent=2))
