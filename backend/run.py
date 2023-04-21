import argparse
import pandas as pd
import subprocess

from pathlib import Path

parser = argparse.ArgumentParser(description="MultiDNN CSV Scheduler")
parser.add_argument("experiment", metavar="EXPERIMENT", help="experiment id")
parser.add_argument("workload", metavar="WORKLOAD", help="workload id")
parser.add_argument("architecture", metavar="ARCHITECTURE", help="architecture")
parser.add_argument("model", metavar="MODEL", help="model command")
parser.add_argument("params", metavar="PARAMS", help="params", nargs=argparse.REMAINDER)

HEADER = [
    "Experiment",
    "Workload",
    "Status",
    "Run",
    "Devices",
    "Collocation",
    "Architecture",
    "Model",
    "Data",
    "Listeners",
    "Params",
]
COMMAND = (
    "mlflow run benchmark/{Architecture} "
    "-P model={Model} "
    "-P data={Data} "
    "-P listeners={Listeners} "
    '-P params="{Params}" '
    "-P workload={Workload} "
    "-P letter={Letter}"
)


def main(args):
    """
    Direct run for MultiLevelDNNGPUBenchmark
    """
    print(args)

    df = pd.DataFrame(columns=HEADER)

    params = " ".join(args.params)

    row = {
        "Experiment": args.experiment,
        "Workload": args.workload,
        "Status": "",
        "Run": "",
        "Devices": 0,
        "Collocation": "-",
        "Architecture": args.architecture,
        "Model": args.model,
        "Data": "",
        "Listeners": "smi+top+dcgmi",
        "Params": params,
    }

    df = df.append(row, ignore_index=True)

    file_csv = Path("_run_temp.csv")
    file_csv.unlink(missing_ok=True)
    df.to_csv(file_csv, index=False)

    subprocess.run("python run_csv.py _run_temp.csv".split(), check=True)
    file_csv.unlink()


if __name__ == "__main__":
    main(parser.parse_args())
