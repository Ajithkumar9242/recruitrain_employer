import requests
import json

BASE_URL = 'http://localhost:8000/api/method'

def test_live_analytics():
    s = requests.Session()
    login_res = s.post(f"{BASE_URL}/login", data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'})
    print("Login status:", login_res.status_code)

    r = s.get(f"{BASE_URL}/recruitrain_employer.api.analytics.get_analytics")
    print("get_analytics status:", r.status_code)
    print("get_analytics response:")
    print(json.dumps(r.json(), indent=2))

if __name__ == '__main__':
    test_live_analytics()
