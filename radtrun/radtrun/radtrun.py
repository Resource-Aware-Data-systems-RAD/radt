"""Runner for Resource-Aware Data systems Tracker (radT) for automatically tracking and training machine learning software"""

import argparse
import mlflow
import os
import runpy
import sys
from pathlib import Path

from .mldgpu import MultiLevelDNNGPUBenchmark

try:
    RUN_ID = mlflow.start_run().info.run_id
except Exception:
    RUN_ID = mlflow.active_run().info.run_id

AVAILABLE_LISTENERS = ["ps", "smi", "dcgmi", "top"]


class Parser:
    """
    Argparser for MLDGPUB
    """

    parser = argparse.ArgumentParser(description="Multi-Level DNN GPU Benchmark")

    def __init__(self):
        self.parser.add_argument(
            "-l",
            "--listeners",
            metavar="LISTENERS",
            required=True,
            help=f"listeners, available: {' '.join(AVAILABLE_LISTENERS)}",
        )
        self.parser.add_argument(
            "-c",
            "--command",
            type=str,
            metavar="COMMAND",
            required=True,
        )
        self.parser.add_argument("-p", "--params", type=str, metavar="PARAMS")


def update_params_listing(command, params):
    # Log the parameters individually so they are filterable in MLFlow
    statements = {}

    # Clean passthrough arguments as they were concatenated to a single string
    if len(params) > 1 and params != '"nan"':  # skip if just "-"
        passthrough = params.strip()

        if (
            passthrough[0] == '"' and passthrough[-1] == '"'
        ):  # Clean if propagated via "
            passthrough = passthrough[1:-1].strip()

        for s in passthrough.split(","):
            if s.strip():  # Omit empty entries
                k, v = s.split("=")
                statements[k] = v

    else:
        passthrough = ""

    # Grab run id
    try:
        run = mlflow.start_run(RUN_ID)
    except Exception as e:
        print(e)
        run = mlflow.active_run()

    # Log parameter
    for k, v in statements.items():
        try:
            mlflow.log_param(k, v)
        except mlflow.exceptions.MlflowException as e:
            print("Failed to log parameter:", k, v)

        if "data" in k.lower():
            try:
                mlflow.log_param("data", v)
            except mlflow.exceptions.MlflowException as e:
                print("Failed to log parameter:", "data", v)

    try:
        mlflow.log_param("model", command)
    except mlflow.exceptions.MlflowException as e:
        print("Failed to log parameter:", "model", command)

    # return [argument for pair in statements.items() for argument in pair]

    return [
        argument
        for pair in statements.items()
        for argument in (f"--{pair[0]}", pair[1])
    ]  # TODO: improve this code to allow for more flexible args


def check_listeners(l):
    if len(l) == 1 and l[0] == "none":
        return
    for entry in l:
        if entry not in AVAILABLE_LISTENERS:
            raise Exception(f"Unavailable listener: {entry}")

    if "ncu" in l or "ncu_attach" in l:
        if len(l) > 1:
            raise Exception(
                "ncu and ncu_attach can't run together with other listeners!"
            )


def cli():
    parser = Parser().parser
    args = parser.parse_args()

    listeners = args.listeners.lower().split("+")

    # Sanity check listeners
    check_listeners(listeners)

    os.environ["DNN_RUN_ID"] = RUN_ID

    not_ncu = not ("ncu" in listeners or "ncu_attach" in listeners)
    os.environ["DNN_LISTENER_PS"] = (
        "True" if ("ps" in listeners and not_ncu) else "False"
    )
    os.environ["DNN_LISTENER_SMI"] = (
        "True" if ("smi" in listeners and not_ncu) else "False"
    )
    os.environ["DNN_LISTENER_DCGMI"] = (
        "True" if ("dcgmi" in listeners and not_ncu) else "False"
    )
    os.environ["DNN_LISTENER_TOP"] = (
        "True" if ("top" in listeners and not_ncu) else "False"
    )

    max_epoch = str(5)  # 5 epochs TODO: make this a nice parameter
    max_time = str(2 * 24 * 60 * 60)  # 2 days

    os.environ["DNN_MAX_EPOCH"] = max_epoch
    os.environ["DNN_MAX_TIME"] = max_time

    print("MAX EPOCH:", max_epoch, "MAX_TIME:", max_time)

    passthrough = update_params_listing(args.command, args.params)

    print(args.params, "passthrough:", passthrough)

    sys.argv = [sys.argv[0]] + passthrough

    # Clear MLproject file so next run may start
    Path("MLproject").unlink()

    with MultiLevelDNNGPUBenchmark() as run:
        code = "run_path(progname, run_name='__main__')"
        globs = {"run_path": runpy.run_path, "progname": args.command}

        try:
            exec(code, globs, None)
        except (SystemExit, KeyboardInterrupt):
            pass


if __name__ == "__main__":
    cli()
