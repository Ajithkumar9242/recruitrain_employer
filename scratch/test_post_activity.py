import requests
import json

BASE_URL = 'http://localhost:8000/api/method'

def test_recent_activity_post():
    s = requests.Session()
    s.post(f"{BASE_URL}/login", data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'})

    # Test POST
    r_post = s.post(
        f"{BASE_URL}/recruitrain_employer.api.analytics.get_recent_activity",
        json={'page': 1, 'page_size': 10, 'entity': None}
    )
    print("POST status:", r_post.status_code)
    print("POST response:", json.dumps(r_post.json(), indent=2))

if __name__ == '__main__':
    test_recent_activity_post()
