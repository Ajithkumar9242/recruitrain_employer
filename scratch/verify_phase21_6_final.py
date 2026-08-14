import requests
import json

BASE_URL = 'http://localhost:8000/api'

def test_profile_api():
    print("=" * 60)
    print("PHASE 21.6 FINAL EMERGENCY FIX VERIFICATION")
    print("=" * 60)

    session = requests.Session()

    # Step 1: Authenticate as emp1@gmail.com
    login_res = session.post(
        f"{BASE_URL}/method/login",
        data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'}
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    print("1. Authentication: SUCCESS for emp1@gmail.com")

    # Step 2: Call get_my_profile API
    profile_res = session.get(f"{BASE_URL}/method/recruitrain_employer.api.profile.get_my_profile")
    assert profile_res.status_code == 200, f"get_my_profile failed: {profile_res.text}"
    
    body = profile_res.json()
    assert body.get('message', {}).get('success') is True, "API success flag is False"

    data = body['message']['data']
    user = data['user']
    company = data['company']

    print("2. Backend API Response Envelope: SUCCESS")
    print(f"   Email:       {user.get('email')}")
    print(f"   First Name:  {user.get('first_name')}")
    print(f"   Last Name:   {user.get('last_name')}")
    print(f"   Full Name:   {user.get('full_name')}")
    print(f"   Phone:       {user.get('phone')}")
    print(f"   Bio:         {user.get('bio')}")
    print(f"   Role:        {user.get('role')}")
    print(f"   Status:      {user.get('status')}")
    print(f"   Login Count: {user.get('login_count')}")
    print(f"   Company:     {company.get('company_name')}")

    # Assertions for exact target values
    assert user.get('email') == 'emp1@gmail.com', f"Expected emp1@gmail.com, got {user.get('email')}"
    assert user.get('first_name') == 'abc', f"Expected abc, got {user.get('first_name')}"
    assert user.get('last_name') == 'abc', f"Expected abc, got {user.get('last_name')}"
    assert user.get('full_name') == 'abcdef', f"Expected abcdef, got {user.get('full_name')}"
    assert user.get('phone') == '8787878787', f"Expected 8787878787, got {user.get('phone')}"
    assert user.get('bio') == 'fesdvfs', f"Expected fesdvfs, got {user.get('bio')}"
    assert user.get('role') == 'Administrator', f"Expected Administrator, got {user.get('role')}"
    assert user.get('status') == 'Active', f"Expected Active, got {user.get('status')}"
    assert company.get('company_name') == 'RecruiTrain', f"Expected RecruiTrain, got {company.get('company_name')}"

    # Verify no demo terms present
    forbidden = ['Alexander Pierce', 'admin@example.com', 'Director of Talent Acquisition']
    raw_text = json.dumps(body)
    for f in forbidden:
        assert f not in raw_text, f"Forbidden demo term '{f}' found in API response!"

    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    test_profile_api()
