def extractPayload(raw):
    if not raw:
        return {}
    if raw.get('data') and isinstance(raw['data'], dict):
        if raw['data'].get('data'):
            return raw['data']['data']
        return raw['data']
    if raw.get('message') and isinstance(raw['message'], dict):
        if raw['message'].get('data'):
            return raw['message']['data']
        return raw['message']
    return raw

def test_recent_activity_normalization():
    raw_api_response = {
      "message": {
        "success": True,
        "data": [
          {"doctype": "Offer", "name": "OFF-00029", "title": "Offer: OFF-00029", "action": "Status: Sent", "modified": "2026-08-14 04:00:32.965706"}
        ],
        "total": 35,
        "page": 1,
        "page_size": 20,
        "total_pages": 2
      }
    }

    payload = extractPayload(raw_api_response)
    print("extractPayload output type:", type(payload))
    print("extractPayload output:", payload)

    # Old logic
    items = payload.get('data') if isinstance(payload, dict) else payload if isinstance(payload, list) else []
    print("Old items count:", len(items) if isinstance(items, list) else 0)

if __name__ == '__main__':
    test_recent_activity_normalization()
