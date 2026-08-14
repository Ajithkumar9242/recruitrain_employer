import requests
import json

BASE_URL = 'http://localhost:8000/api/method'

s = requests.Session()
login_res = s.post(f'{BASE_URL}/login', data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'})
print("Login status:", login_res.status_code)

endpoints = [
    ('get_billing_overview', 'GET', {}),
    ('get_current_subscription', 'GET', {}),
    ('get_usage', 'GET', {}),
    ('get_available_plans', 'GET', {}),
    ('get_invoices', 'GET', {}),
    ('get_payment_history', 'GET', {}),
]

for name, method, params in endpoints:
    url = f"{BASE_URL}/recruitrain_employer.api.subscription.{name}"
    res = s.get(url, params=params) if method == 'GET' else s.post(url, json=params)
    print(f"\n=== Endpoint: {name} ({res.status_code}) ===")
    try:
        print(json.dumps(res.json(), indent=2))
    except Exception as e:
        print("Raw text:", res.text)

# Also test upgrade_preview if possible
url_upgrade = f"{BASE_URL}/recruitrain_employer.api.subscription.upgrade_preview"
res_up = s.post(url_upgrade, json={'new_plan_id': 'NON_EXISTENT'})
print("\n=== Endpoint: upgrade_preview NON_EXISTENT ===")
try:
    print(json.dumps(res_up.json(), indent=2))
except Exception as e:
    print("Raw text:", res_up.text)
