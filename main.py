# import tomllib

# with open("pyproject.toml", "rb") as f:
#     data = tomllib.load(f)
#     print(data['build']['req']['r'])
import tomllib

toml_str = """
python-version = "3.11.0"
python-implementation = "CPython"
"""

data = tomllib.loads(toml_str)
print(data['python-version'])