import requests
import json

BASE_URL = 'http://localhost:8000/api/method'

def test_backend_analytics_params():
    s = requests.Session()
    login_res = s.post(f"{BASE_URL}/login", data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'})
    print("Login:", login_res.status_code)

    # 1. Plain get_analytics
    r1 = s.get(f"{BASE_URL}/recruitrain_employer.api.analytics.get_analytics")
    data1 = r1.json().get('message', {}).get('data', {})
    print("\n--- get_analytics (no params) ---")
    print("Overview:", json.dumps(data1.get('overview'), indent=2))
    print("Funnel:", json.dumps(data1.get('funnel'), indent=2))
    print("Trends:", json.dumps(data1.get('trends'), indent=2))

    # 2. get_analytics with granularity=monthly
    r2 = s.get(f"{BASE_URL}/recruitrain_employer.api.analytics.get_analytics", params={'granularity': 'monthly'})
    data2 = r2.json().get('message', {}).get('data', {})
    print("\n--- get_analytics (granularity=monthly) ---")
    print("Overview:", json.dumps(data2.get('overview'), indent=2))

    # 3. Test separate endpoints if any
    r3 = s.get(f"{BASE_URL}/recruitrain_employer.api.analytics.get_recent_activity")
    print("\n--- get_recent_activity ---")
    print("Recent activity status:", r3.status_code)
    print("Recent activity body:", json.dumps(r3.json(), indent=2))

if __name__ == '__main__':
    test_backend_analytics_params()
