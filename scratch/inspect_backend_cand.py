import importlib
import inspect
import recruitrain_employer.api.candidate as cand_api

print("Candidate API module file:", inspect.getfile(cand_api))
print("create_candidate source code:")
print(inspect.getsource(cand_api.create_candidate))
