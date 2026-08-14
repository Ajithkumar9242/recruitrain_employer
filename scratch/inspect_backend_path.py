import importlib.util
import os

spec = importlib.util.find_spec("recruitrain_employer")
if spec:
    print("recruitrain_employer path:", spec.origin or spec.submodule_search_locations)
else:
    print("recruitrain_employer not found via importlib")
