import requests
import json

s = requests.Session()

# First check if there is an active session or if we need to inspect cookies / test login with emp1@gmail.com or check current frappe session user
# Let's test calling get_my_profile with session or cookie if available, or test logging in as emp1@gmail.com
print("Testing direct login as emp1@gmail.com...")
login_res = s.post('http://localhost:8000/api/method/login', data={'usr': 'emp1@gmail.com', 'pwd': 'Password123!'})
print("Login status:", login_res.status_code)
print("Login response:", login_res.json())

# Call get_my_profile
prof_res = s.get('http://localhost:8000/api/method/recruitrain_employer.api.profile.get_my_profile')
print("get_my_profile status:", prof_res.status_code)
print("get_my_profile response:", json.dumps(prof_res.json(), indent=2))
