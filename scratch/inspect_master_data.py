import requests
import json

s = requests.Session()
login_res = s.post('http://localhost:8000/api/method/login', data={'usr': 'audit_tester@recruitrain.de', 'pwd': 'Password123!'})
print("Login status:", login_res.status_code)

# 1. Test get_list for Profession
r_prof = s.get('http://localhost:8000/api/method/recruitrain_employer.api.master.list_professions')
print("\n--- master.list_professions ---")
print("Status:", r_prof.status_code)
print("Response:", json.dumps(r_prof.json(), indent=2))

r_prof_doc = s.get('http://localhost:8000/api/method/frappe.client.get_list', params={
    'doctype': 'Profession',
    'fields': '["name"]',
    'limit_page_length': 100
})
print("\n--- frappe.client.get_list Profession ---")
print("Status:", r_prof_doc.status_code)
print("Response:", json.dumps(r_prof_doc.json(), indent=2))

# 2. Test Employment Type
r_emp = s.get('http://localhost:8000/api/method/recruitrain_employer.api.master.list_employment_types')
print("\n--- master.list_employment_types ---")
print("Status:", r_emp.status_code)
print("Response:", json.dumps(r_emp.json(), indent=2))

r_emp_doc = s.get('http://localhost:8000/api/method/frappe.client.get_list', params={
    'doctype': 'Employment Type',
    'fields': '["name"]',
    'limit_page_length': 100
})
print("\n--- frappe.client.get_list Employment Type ---")
print("Status:", r_emp_doc.status_code)
print("Response:", json.dumps(r_emp_doc.json(), indent=2))

# 3. Test Country
r_country = s.get('http://localhost:8000/api/method/frappe.client.get_list', params={
    'doctype': 'Country',
    'fields': '["name", "country_name"]',
    'limit_page_length': 300
})
print("\n--- frappe.client.get_list Country (first 10) ---")
print("Status:", r_country.status_code)
if r_country.status_code == 200:
    res = r_country.json()
    items = res.get('message', [])
    print(f"Total countries found: {len(items)}")
    print("Sample countries:", json.dumps(items[:10], indent=2))

# 4. Inspect Candidate DocType meta
r_meta = s.get('http://localhost:8000/api/method/frappe.desk.form.load.getdoctype', params={'doctype': 'Candidate'})
print("\n--- Candidate DocType meta status ---")
print("Status:", r_meta.status_code)
if r_meta.status_code == 200:
    docs = r_meta.json().get('docs', [])
    if docs:
        fields = docs[0].get('fields', [])
        link_fields = [f for f in fields if f.get('fieldtype') == 'Link']
        print("Link fields in Candidate DocType:")
        for lf in link_fields:
            print(f"  Field: {lf.get('fieldname')} | Label: {lf.get('label')} | Options: {lf.get('options')} | Req: {lf.get('reqd')}")
