filepath = 'apps/recruitrain_employer/recruitrain_employer/services/job_application_service.py'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('ALLOWED_SORT_FIELDS: frozenset[str] = frozenset(\n    [\n        "creation",\n        "modified",\n        "candidate",\n        "job_opening",\n        "company",\n        "status",\n        "application_date",\n        "applied_on",\n    ]\n)', 'ALLOWED_SORT_FIELDS: frozenset[str] = frozenset(\n    [\n        "creation",\n        "modified",\n        "candidate",\n        "job_opening",\n        "company",\n        "status",\n        "applied_on",\n    ]\n)')

content = content.replace('_LIST_FIELDS: list[str] = [\n    "name",\n    "candidate",\n    "job_opening",\n    "company",\n    "status",\n    "current_stage",\n    "application_date",\n    "applied_on",\n]', '_LIST_FIELDS: list[str] = [\n    "name",\n    "candidate",\n    "job_opening",\n    "company",\n    "status",\n    "current_stage",\n    "applied_on",\n]')

with open(filepath, 'w') as f:
    f.write(content)

print("Successfully updated job_application_service.py")
