import os
import requests
import json
import re

BASE_URL = 'http://localhost:8000/api/method'

def test_backend_analytics():
    print("=" * 70)
    print("VERIFICATION SUITE FOR PHASE 22.2 - ANALYTICS REAL DATA RECONCILIATION")
    print("=" * 70)

    # 1. Login session
    s = requests.Session()
    login_res = s.post(f"{BASE_URL}/login", data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'})
    assert login_res.status_code == 200, "Login failed"
    print("TEST 01 - Authenticated session initialized: SUCCESS")

    # 2. Call get_analytics
    r = s.get(f"{BASE_URL}/recruitrain_employer.api.analytics.get_analytics")
    assert r.status_code == 200, f"get_analytics returned {r.status_code}"
    body = r.json()
    data = body.get('message', {}).get('data', {})
    assert data, "Empty data returned from get_analytics"
    print("TEST 02 - get_analytics endpoint returned 200: SUCCESS")

    # 3. Verify Overview fields
    ov = data.get('overview', {})
    assert ov.get('total_candidates') == 19, f"Expected 19 candidates, got {ov.get('total_candidates')}"
    assert ov.get('total_jobs') == 21, f"Expected 21 jobs, got {ov.get('total_jobs')}"
    assert ov.get('open_jobs') == 6, f"Expected 6 open jobs, got {ov.get('open_jobs')}"
    assert ov.get('total_applications') == 3, f"Expected 3 applications, got {ov.get('total_applications')}"
    assert ov.get('active_applications') == 3, f"Expected 3 active applications, got {ov.get('active_applications')}"
    assert ov.get('total_interviews') == 4, f"Expected 4 interviews, got {ov.get('total_interviews')}"
    assert ov.get('pending_offers') == 9, f"Expected 9 pending offers, got {ov.get('pending_offers')}"
    assert ov.get('accepted_offers') == 0, f"Expected 0 accepted offers, got {ov.get('accepted_offers')}"
    print("TEST 03 - Backend Overview metrics parity certified (19 candidates, 21 jobs, 6 open, 3 apps, 4 interviews, 9 offers, 0 accepted): SUCCESS")

    # 4. Verify Funnel fields
    fn = data.get('funnel', {})
    assert fn.get('total') == 3, f"Expected total funnel 3, got {fn.get('total')}"
    assert fn.get('funnel', {}).get('Interview') == 3, f"Expected Interview funnel 3, got {fn.get('funnel', {}).get('Interview')}"
    print("TEST 04 - Backend Funnel metrics parity certified: SUCCESS")

    # 5. Verify Trends fields
    tr = data.get('trends', [])
    assert len(tr) > 0, "Empty trends array"
    assert tr[0].get('period') == "2026-08", f"Expected trend period '2026-08', got {tr[0].get('period')}"
    assert tr[0].get('count') == 3, f"Expected trend count 3, got {tr[0].get('count')}"
    print("TEST 05 - Backend Trends time-series parity certified: SUCCESS")

    # 6. Verify Job Metrics fields
    jm = data.get('jobs', {})
    assert jm.get('total_jobs') == 21, f"Expected 21 total jobs, got {jm.get('total_jobs')}"
    assert jm.get('by_status', {}).get('Open') == 6, f"Expected 6 open jobs by status, got {jm.get('by_status', {}).get('Open')}"
    assert jm.get('by_status', {}).get('Draft') == 15, f"Expected 15 draft jobs by status, got {jm.get('by_status', {}).get('Draft')}"
    print("TEST 06 - Backend Job metrics parity certified: SUCCESS")

    # 7. Verify Offer Metrics fields
    om = data.get('offers', {})
    assert om.get('total_offers') == 9, f"Expected 9 total offers, got {om.get('total_offers')}"
    assert om.get('by_status', {}).get('Draft') == 5, f"Expected 5 draft offers, got {om.get('by_status', {}).get('Draft')}"
    assert om.get('by_status', {}).get('Sent') == 4, f"Expected 4 sent offers, got {om.get('by_status', {}).get('Sent')}"
    print("TEST 07 - Backend Offer metrics parity certified: SUCCESS")

    # 8. Verify Recent Activity fields
    r_act = s.post(f"{BASE_URL}/recruitrain_employer.api.analytics.get_recent_activity", json={'page': 1, 'page_size': 10})
    act_data = r_act.json().get('message', {})
    assert len(act_data.get('data', [])) == 10, f"Expected 10 recent activity items on page 1, got {len(act_data.get('data', []))}"
    print("TEST 08 - Backend Recent Activity endpoint parity certified: SUCCESS")

    # 9. Verify no mock keywords in analytics files
    analytics_files = [
        'src/services/analyticsApi.js',
        'src/utils/analyticsNormalizer.js',
        'src/store/slices/analyticsSlice.js',
        'src/hooks/useAnalytics.js',
        'src/pages/app/Analytics/AnalyticsPage.jsx',
    ]

    for fname in analytics_files:
        with open(fname, 'r', encoding='utf-8') as f:
            content = f.read()
            assert 'mock' not in content.lower(), f"Found 'mock' in {fname}"
            assert 'dummy' not in content.lower(), f"Found 'dummy' in {fname}"
            assert 'fake' not in content.lower(), f"Found 'fake' in {fname}"

    print("TEST 09 - Zero mock/dummy/fake values in frontend analytics pipeline: SUCCESS")

    print("\nALL BACKEND & NORMALIZER VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == '__main__':
    test_backend_analytics()
