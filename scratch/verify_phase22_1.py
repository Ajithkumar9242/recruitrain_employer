import requests
import json

BASE_URL = 'http://localhost:8000/api'

def test_analytics_integration():
    print("=" * 60)
    print("VERIFICATION OF PHASE 22.1 ANALYTICS REAL-DATA INTEGRATION")
    print("=" * 60)

    session = requests.Session()

    # 1. Login
    login_res = session.post(
        f"{BASE_URL}/method/login",
        data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'}
    )
    assert login_res.status_code == 200, "Login failed"
    print("1. Authentication: SUCCESS")

    # 2. Call certified get_analytics API
    res = session.get(f"{BASE_URL}/method/recruitrain_employer.api.analytics.get_analytics")
    assert res.status_code == 200, f"API failed with status {res.status_code}"
    body = res.json()

    assert 'message' in body, "Response envelope missing 'message'"
    assert 'data' in body['message'], "Response envelope missing 'data'"

    data = body['message']['data']
    print("2. get_analytics API Response: SUCCESS")

    # 3. Check keys in data
    required_keys = ['overview', 'funnel', 'trends', 'jobs', 'applications', 'interviews', 'offers', 'time_to_hire']
    for k in required_keys:
        assert k in data, f"Missing key '{k}' in data envelope"
    print(f"3. All 8 core analytics sections present: {required_keys}")

    # 4. Verify metric values against verified target values
    ov = data['overview']
    assert ov['total_candidates'] == 19, f"Expected total_candidates 19, got {ov['total_candidates']}"
    assert ov['total_jobs'] == 21, f"Expected total_jobs 21, got {ov['total_jobs']}"
    assert ov['open_jobs'] == 6, f"Expected open_jobs 6, got {ov['open_jobs']}"
    assert ov['total_applications'] == 3, f"Expected total_applications 3, got {ov['total_applications']}"
    assert ov['active_applications'] == 3, f"Expected active_applications 3, got {ov['active_applications']}"
    assert ov['total_interviews'] == 4, f"Expected total_interviews 4, got {ov['total_interviews']}"
    assert data['offers']['total_offers'] == 9, f"Expected total_offers 9, got {data['offers']['total_offers']}"
    assert ov['accepted_offers'] == 0, f"Expected accepted_offers 0, got {ov['accepted_offers']}"

    print("4. Verification metric parity checks:")
    print(f"   - Total Candidates: {ov['total_candidates']}")
    print(f"   - Total Jobs: {ov['total_jobs']}")
    print(f"   - Open Jobs: {ov['open_jobs']}")
    print(f"   - Total Applications: {ov['total_applications']}")
    print(f"   - Active Applications: {ov['active_applications']}")
    print(f"   - Total Interviews: {ov['total_interviews']}")
    print(f"   - Total Offers: {data['offers']['total_offers']}")
    print(f"   - Accepted Offers: {ov['accepted_offers']}")

    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    test_analytics_integration()
