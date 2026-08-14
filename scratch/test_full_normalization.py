import requests
import json

BASE_URL = 'http://localhost:8000/api/method'

def extractPayload(raw):
    if not raw:
        return {}
    # Handle response.data format or response.data.message format
    if isinstance(raw, dict):
        if raw.get('data') and isinstance(raw['data'], dict):
            if raw['data'].get('data'):
                return raw['data']['data']
            return raw['data']
        if raw.get('message') and isinstance(raw['message'], dict):
            if raw['message'].get('data'):
                return raw['message']['data']
            return raw['message']
    return raw

def normalizeOverview(raw):
    # If raw is passed from data.overview, extractPayload might be called on raw
    data = extractPayload(raw) if isinstance(raw, dict) else {}
    if not data and isinstance(raw, dict):
        data = raw
    return {
        'openJobs': int(data.get('open_jobs') or 0),
        'totalJobs': int(data.get('total_jobs') or 0),
        'totalCandidates': int(data.get('total_candidates') or 0),
        'totalApplications': int(data.get('total_applications') or 0),
        'activeApplications': int(data.get('active_applications') or 0),
        'todaysInterviews': int(data.get('todays_interviews') or 0),
        'totalInterviews': int(data.get('total_interviews') or 0),
        'pendingOffers': int(data.get('pending_offers') or 0),
        'acceptedOffers': int(data.get('accepted_offers') or 0),
        'totalHires': int(data.get('total_hires') or 0),
        'rejectedApplications': int(data.get('rejected_applications') or 0),
    }

def test():
    s = requests.Session()
    s.post(f"{BASE_URL}/login", data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'})

    # 1. get_analytics response
    res = s.get(f"{BASE_URL}/recruitrain_employer.api.analytics.get_analytics").json()
    print("Raw get_analytics response keys:", list(res.keys()))

    payload = extractPayload(res)
    print("Extracted get_analytics payload keys:", list(payload.keys()))

    overview = normalizeOverview(payload.get('overview'))
    print("\nNormalized Overview:")
    print(json.dumps(overview, indent=2))

    # 2. get_recent_activity response
    res_act = s.get(f"{BASE_URL}/recruitrain_employer.api.analytics.get_recent_activity").json()
    print("\nRaw recent activity keys:", list(res_act.keys()))
    payload_act = extractPayload(res_act)
    print("Extracted recent activity payload type:", type(payload_act))
    if isinstance(res_act.get('message'), dict):
        msg = res_act['message']
        print("res_act.message.total:", msg.get('total'))
        print("res_act.message.data count:", len(msg.get('data', [])))

if __name__ == '__main__':
    test()
