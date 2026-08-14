import requests
import json

BASE_URL = 'http://localhost:8000/api'

def test_two_fixes():
    print("=" * 60)
    print("VERIFICATION OF TWO FRONTEND FIXES")
    print("=" * 60)

    session = requests.Session()

    # 1. Login
    login_res = session.post(
        f"{BASE_URL}/method/login",
        data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'}
    )
    assert login_res.status_code == 200, "Login failed"
    print("1. Authentication: SUCCESS")

    # 2. Verify Company Name from Profile API
    prof_res = session.get(f"{BASE_URL}/method/recruitrain_employer.api.profile.get_my_profile")
    assert prof_res.status_code == 200
    prof_data = prof_res.json()['message']['data']
    comp_name = prof_data['company']['company_name']
    assert comp_name == 'RecruiTrain', f"Expected RecruiTrain, got {comp_name}"
    print(f"2. Topbar Company Name Data Source: SUCCESS ('{comp_name}')")

    # 3. Verify Applications Current Stage
    app_res = session.post(
        f"{BASE_URL}/method/recruitrain_employer.api.job_application.list_applications",
        json={'page': 1, 'page_size': 20}
    )
    assert app_res.status_code == 200
    apps = app_res.json()['message']['data']
    print(f"3. Loaded Applications from Backend: {len(apps)} items")
    for a in apps:
        print(f"   - App #{a.get('name')}: stage='{a.get('current_stage')}', candidate='{a.get('candidate')}'")

    # Client-side filtering check simulating hook
    def filter_apps(items, stage):
        if not stage:
            return items
        target = stage.strip().lower()
        return [item for item in items if (item.get('current_stage') or '').strip().lower() == target]

    interview_apps = filter_apps(apps, 'Interview')
    screening_apps = filter_apps(apps, 'Screening')
    cleared_apps = filter_apps(apps, None)

    assert len(interview_apps) == 3, f"Expected 3 items for Interview stage, got {len(interview_apps)}"
    assert len(screening_apps) == 0, f"Expected 0 items for Screening stage, got {len(screening_apps)}"
    assert len(cleared_apps) == len(apps), "Clearing filter should restore all apps"

    print("4. Current Stage Filtering Logic: SUCCESS")
    print("   - 'Interview' stage count:", len(interview_apps))
    print("   - 'Screening' stage count:", len(screening_apps))
    print("   - Cleared filter count:", len(cleared_apps))

    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    test_two_fixes()
