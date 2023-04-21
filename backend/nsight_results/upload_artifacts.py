import mlflow
from mlflow.tracking import MlflowClient
from pathlib import Path

mlflow.set_tracking_uri("https://res17.itu.dk")
client = MlflowClient()


root = Path("")

exts = (".qdrep", ".ncu-rep")

print("Starting artifact upload!")
c = [x for x in root.glob("*") if x.suffix in exts]
print("Candidates: ", c)
for file in c:
    print(f"Uploading: {file}")
    client.log_artifact(file.stem, str(file.resolve()))
    file.unlink()
    print(f"Upload completed: {file}\n")
