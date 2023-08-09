"""Resource-Aware Data systems Tracker (radT) for automatically tracking and training machine learning software"""

__version__ = "0.1.5"

import argparse
import migedit
import numpy as np
import pandas as pd
import os
import sys
import time

from contextlib import ExitStack
from mlflow.tracking import MlflowClient
from pathlib import Path
from queue import Queue, Empty
from string import ascii_uppercase
from subprocess import Popen, PIPE, STDOUT
from threading import Thread

COLOURS = [31, 32, 34, 35, 36, 33]

MIG_OPTIONS = ["1g.10gb", "2g.20gb", "3g.40gb", "4g.40gb", "7g.80gb"]
SMIG_OPTIONS = ["1c.7g.40gb", "2c.7g.40gb", "3c.7g.40gb", "4c.7g.40gb", "7c.7g.40gb"]

HEADER = [
    "Experiment",
    "Workload",
    "Status",
    "Run",
    "Devices",
    "Collocation",
    "Listeners",
    "File",
    "Params",
]

CSV_FORMAT = np.dtype(
    [
        ("Experiment", int),
        ("Workload", int),
        ("Status", str),
        ("Run", str),
        ("Devices", str),
        ("Collocation", str),
        ("Listeners", str),
        ("File", str),
        ("Params", str),
    ]
)

COMMAND = (  #'CUDA_VISIBLE_DEVICES={Devices} '
    "mlflow run {Filepath} --env-manager=local "  # TODO: add env management as arg
    "-P letter={Letter} "
    "-P workload={Workload} "
    "-P listeners={Listeners} "
    "-P file={File} "
    '-P params="{Params}" '
)

COMMAND_NSYS = "nsys profile --capture-range nvtx --nvtx-capture profile --cuda-memory-usage=true --capture-range-end repeat -o nsys_{Experiment}_{Workload}_{Letter} -f true -w true -x true -t cuda,nvtx "
COMMAND_NSYS_RAW = "nsys profile --cuda-memory-usage true -o nsys_{Experiment}_{Workload}_{Letter} -f true -w true -x true -t cuda,nvtx "
COMMAND_NCU = (
    "ncu -o ncu_{Experiment}_{Workload}_{Letter} -f --nvtx --nvtx-include profile "
)
COMMAND_NCU_RAW = "ncu -o ncu_{Experiment}_{Workload}_{Letter} -f -c 100 "
COMMAND_NCU_ATTACH = "ncu --mode=launch "

# conda_env: conda.yaml
# <REPLACE_ENV>
MLPROJECT_CONTENTS = """name: radt



entry_points:
  main:
    parameters:
      letter: { type: string, default: ""}
      workload: { type: string, default: ""}
      listeners: { type: string, default: "smi+dcgmi+top" }
      params: { type: string, default: "-"}
      file: { type: string, default: "cifar10.py"}
      workload_listener: { type: string, default: ""}
    command: |
      <REPLACE_COMMAND>
"""

MLFLOW_COMMAND = (
    """{WorkloadListener}python -m radtrun -l {Listeners} -c {File} -p {Params}"""
)


def coloured(colour, string):
    return f"\033[{colour}m{string}\033[0m"


def sysprint(string):
    print(coloured(33, string))


def sourced(colour, letter, string):
    prefix = f"[RUN {letter}]:".ljust(20)
    if colour is None:
        return f"{prefix} {string}"
    return f"{coloured(colour, prefix)} {string}"


def format_params(line):
    if isinstance(line, str):
        line = " ".join(line.split())
        if "--" in line:
            line = line.replace("--", "")
            parts = line.split()
            statements = []
            while parts:
                statements.append(f"{parts[0]}={parts[1]}")
                parts = parts[2:]

            line = ",".join(statements)

        return line.replace(";", ",").replace(" ", "")
    return line


def execute_command(cmd, shell=False, vars={}):
    """
    Executes a (non-run) command.
    :param cmd -> Command to run.

    :return result -> Text printed by the command.
    """
    if isinstance(cmd, str):
        cmd = cmd.split()

    if vars:
        sysprint(f"Executing command - {cmd} - {vars}")
    else:
        sysprint(f"Executing command - {cmd}")

    env = os.environ.copy()
    for k, v in vars.items():
        env[k] = str(v)

    result = []
    with Popen(
        cmd, stdout=PIPE, bufsize=1, universal_newlines=True, shell=shell, env=env
    ) as p:
        result.extend(p.stdout)

        if p.returncode != 0:
            pass

    return result


def enqueue_output(out, queue):
    try:
        for line in iter(out.readline, b""):
            queue.put(line)
    except ValueError:
        pass
    out.close()


def execute_workload(cmds):
    """
    Executes a workload. Handles run halting and collecting of run status.
    :param cmd -> Command to run.

    :return run_id -> ID of run.
    :return status -> Status code of run.
    """

    # sysprint(f"Executing workload - {cmds}")

    # exit()
    run_ids = {}
    status = -1

    terminate = False

    log = []
    log_runs = {}
    popens = []
    returncodes = {}

    # # Clear MLproject TODO: set as var
    # (Path(filepath) / "MLproject").unlink()
    unlink_first = True

    with ExitStack() as stack:
        for id, colour, letter, vars, cmd, mlproject, filepath, _ in cmds:
            print(
                sourced(
                    colour,
                    letter,
                    f"context: {id}-{colour}-{letter}-{vars}-{cmd}-{filepath}",
                )
            )

            env = os.environ.copy()
            for k, v in vars.items():
                env[k] = str(v)

            stack.enter_context(
                p := Popen(
                    cmd,
                    stdout=PIPE,
                    stderr=STDOUT,
                    bufsize=1,
                    env=env,
                    universal_newlines=True,
                )
            )

            # TODO: conda yaml export

            while (Path(filepath) / "MLproject").is_file():
                # Wait for MLproject to be cleared
                sysprint("Waiting for MLproject to be cleared")
                time.sleep(1)

                if unlink_first:
                    (Path(filepath) / "MLproject").unlink()

                unlink_first = False

            with open(Path(filepath) / "MLproject", "w") as project_file:
                project_file.write(mlproject)

            time.sleep(1)

            q = Queue()
            t = Thread(target=enqueue_output, args=(p.stdout, q))
            t.daemon = True
            t.start()

            popens.append((colour, letter, p, q, t))
            log_runs[letter] = []
            run_ids[letter] = False

        try:
            while True:
                # Stop once all processes have finished
                for _, _, p, _, _ in popens:
                    # Check if process is alive
                    if p.poll() is None:
                        break
                else:
                    break

                # Process output text
                for colour, letter, p, q, _ in popens:
                    while p.poll() is None:
                        try:
                            l = q.get_nowait()
                            if not l.strip() and not "\n" in l:
                                continue
                        except Empty:
                            break
                        else:
                            log_runs[letter].append(l)
                            log.append(sourced(None, letter, l))
                            print(sourced(colour, letter, l), end="")

                            if run_ids[letter]:
                                continue
                            if "CAPTURED RUN ID " in l:
                                run_ids[letter] = (
                                    l.split("CAPTURED RUN ID [")[-1]
                                    .strip()[:-1]
                                    .strip()
                                )
                                print(
                                    sourced(
                                        colour, letter, f"MAPPED TO {run_ids[letter]}"
                                    )
                                )

        except KeyboardInterrupt:
            try:
                sysprint("Interrupting runs... Please wait")
                terminate = True

                time.sleep(1)
                for colour, letter, p, q, t in popens:
                    last_update = time.time()
                    while time.time() - last_update < 1.0 or p.poll() is None:
                        try:
                            l = q.get_nowait()
                            if not l.strip() and not "\n" in l:
                                continue
                        except Empty:
                            pass
                        else:
                            last_update = time.time()
                            log_runs[letter].append(l)
                            log.append(sourced(None, letter, l))
                            print(sourced(colour, letter, l), end="")
            except KeyboardInterrupt:
                pass

        for _, letter, p, _, _ in popens:
            returncodes[letter] = p.returncode

    sysprint("Sending logs to server.")
    results = []

    for id, _, letter, _, _, _, _, row in cmds:
        if run_id := run_ids[letter]:
            client = MlflowClient()
            if run := client.get_run(run_id):
                results.append(
                    (id, letter, returncodes[letter], run_id, run.info.status)
                )
                client.log_text(run_id, "".join(log_runs[letter]), f"log_{run_id}.txt")
                client.log_text(run_id, "".join(log), f"log_workload.txt")

                if row["WorkloadListener"]:
                    try:
                        for file in Path("").glob(
                            f"{row['WorkloadListener'].split('-o ')[1].split()[0]}*.*-rep"
                        ):
                            client.log_artifact(run_id, str(file))
                            file.unlink()
                    except IndexError:
                        pass

    if terminate:
        sys.exit()

    return results


def get_gpu_ids():
    gpus = {}
    for line in execute_command("nvidia-smi -L"):
        if "UUID: GPU" in line:
            gpu = line.split("GPU")[1].split(":")[0].strip()
            gpus[gpu] = line.split("UUID:")[1].split(")")[0].strip()
    return gpus


def make_dcgm_groups(dev_table):
    """
    Removes old DCGM groups and make a DCGM group with the required devices.
    :param dev_table -> Run to device mapping table.

    :return dcgmi_table -> Run to id mapping table.
    """

    # Grab existing groups
    result = [l for l in execute_command("dcgmi group -l") if "Group ID" in l]
    group_ids = [int(l.split("|")[-2]) for l in result]

    # Delete groups. First two are protected and shouldn't be deleted
    if len(group_ids) > 1:
        for i in group_ids:
            if i in (0, 1):
                continue

            result = "".join(execute_command(f"dcgmi group -d {i}")).lower()
            if "error" in result:
                raise ValueError("DCGMI group index not found. Could not be deleted")

    set_ids = {}
    for i, s in enumerate(dev_table.sort_values().unique()):
        # Create a new group
        result = "".join(execute_command(f"dcgmi group -c mldnn_{i}")).lower()
        if "error" in result:
            raise ValueError("DCGMI group could not be created.")
        group_id = int(result.split("group id of ")[1].split()[0])

        gpu_ids = ",".join(list(s))

        # Add the gpu ids to the new group
        result = "".join(
            execute_command(f"dcgmi group -g {group_id} -a {gpu_ids}")
        ).lower()
        if "error" in result:
            raise ValueError("DCGMI group could not be set up with required GPUs.")

        set_ids[s] = group_id

    dcgmi_table = {}
    for i, v in dev_table.items():
        dcgmi_table[i] = set_ids[v]

    return dcgmi_table


def make_mps(df_workload, gpu_uuids):
    gpu_ids = (
        df_workload[df_workload["Collocation"].str.strip().str.lower() == "mps"][
            "Devices"
        ]
        .sort_values()
        .unique()
    )

    for gpu in gpu_ids:
        result = "".join(
            execute_command(
                f"nvidia-cuda-mps-control -d",
                vars={"CUDA_VISIBLE_DEVICES": str(gpu_uuids[str(gpu)])},
            )
        ).lower()
        if "is already running" in result:
            raise Exception(
                f"MPS Error (did you try to run MPS on multiple groups?): {result}"
            )


def remove_mps():
    # Remove MPS
    result = "".join(
        execute_command(["echo quit | nvidia-cuda-mps-control"], shell=True)
    ).lower()


def split_arguments():
    sysargs = sys.argv[1:]

    for i, arg in enumerate(sysargs):
        if arg.strip()[-3:] == ".py" or arg.strip()[-4:] == ".csv":
            return sysargs[:i], Path(arg), sysargs[i + 1 :]
    else:
        print("Please supply a python or csv file.")
        exit()


AVAILABLE_LISTENERS = ["ps", "smi", "dcgmi", "top"]


def cli():
    # TODO: support specifying workload etc. in quick .py runs
    # make it so that this info is written down before the .py file itself

    args, file, args_passthrough = split_arguments()

    parser = argparse.ArgumentParser(description="Multi-Level DNN GPU Benchmark")

    parser.add_argument("-e", "--experiment", type=int, metavar="EXPERIMENT", default=0)
    parser.add_argument("-w", "--workload", type=int, metavar="WORKLOAD", default=0)
    parser.add_argument(
        "-d",
        "--devices",
        type=str,
        metavar="DEVICES",
        default="0",
    )
    parser.add_argument(
        "-c",
        "--collocation",
        type=str,
        metavar="COLLOCATION",
        default="-",
        help=f"collocation",
    )
    parser.add_argument(
        "-l",
        "--listeners",
        type=str,
        metavar="LISTENERS",
        default="smi+top+dcgmi",
        help=f"listeners, available: {' '.join(AVAILABLE_LISTENERS)}",
    )
    parser.add_argument(
        "-r",
        "--rerun",
        type=bool,
        metavar="RERUN",
        default=False,
    )

    parsed_args = parser.parse_args(args)

    rerun = parsed_args.rerun

    if file.suffix == ".py":
        df_raw = None
        df = pd.DataFrame(np.empty(0, dtype=CSV_FORMAT))

        if len(args_passthrough):
            params = " ".join(args_passthrough)
        else:
            params = ""

        df.loc[0] = pd.Series(
            {
                "Experiment": parsed_args.experiment,
                "Workload": parsed_args.workload,
                "Status": "",
                "Run": "",
                "Devices": parsed_args.devices,
                "Collocation": parsed_args.collocation,
                "Listeners": parsed_args.listeners,
                "File": str(file),
                "Params": params,
            }
        )

    elif file.suffix == ".csv":
        df_raw = pd.read_csv(file, delimiter=",", header=0, skipinitialspace=True)
        df_raw["Collocation"] = df_raw["Collocation"].astype(str)
        df = df_raw.copy()

    df["Params"] = df["Params"].apply(format_params)

    df["Workload_Unique"] = (
        df["Experiment"].astype(str) + "+" + df["Workload"].astype(str)
    )

    workloads = df["Workload_Unique"].unique()
    for workload in workloads:
        df_workload = df[df["Workload_Unique"] == workload].copy()

        df_workload["Letter"] = "-"
        df_workload["Number"] = -1

        for i, (id, row) in enumerate(df_workload.iterrows()):
            # Skip workloads that have been finished already
            # Reruns FAILED workloads when --rerun is specified
            if not (
                "FINISHED" in str(row["Status"]).strip()
                or ("FAILED" in str(row["Status"]).strip() and (not rerun))
            ):
                break
        else:
            sysprint(f"SKIPPING Workload: {workload}")
            continue

        assigned = []
        for i, row in df_workload.iterrows():
            if row["Devices"] not in assigned:
                assigned.append(row["Devices"])
            letter = row["Devices"]
            df_workload.loc[i, "Letter"] = letter
            df_workload.loc[i, "Number"] = ascii_uppercase[
                (df_workload["Letter"].value_counts()[letter] - 1)
            ]

        letter_quants = df_workload["Letter"].value_counts()
        for i, row in df_workload.iterrows():
            if letter_quants[row["Letter"]] > 1:
                df_workload.loc[i, "Letter"] = f'{row["Letter"]}_{row["Number"]}'
            if str(row["Collocation"]).strip() not in ("-", "", "nan"):
                df_workload.loc[
                    i, "Letter"
                ] = f'{df_workload.loc[i, "Letter"]}_{df_workload.loc[i, "Collocation"]}'

        # Set devices string and DCGMI group
        migedit.remove_mig_devices()
        dev_table = df_workload["Devices"].astype(str).str.split("+").apply(frozenset)
        mig_table, entity_table = dev_table.copy(), dev_table.copy()

        for i, row in df_workload.iterrows():
            remove_mps()

            if "g" in str(row["Collocation"]):  # TODO: fix
                result = migedit.make_mig_devices(
                    row["Devices"], [row["Collocation"]], remove_old=False
                )
                mig_table.loc[i] = frozenset([y for x in result for y in x[4]])
                entity_table.loc[i] = frozenset([x[3] for x in result])

        gpu_uuids = get_gpu_ids()
        for i, v in mig_table.items():
            s = set()
            for device in v:
                device = device.strip()
                if device in gpu_uuids:
                    device = gpu_uuids[device]
                s.add(device)
            mig_table[i] = frozenset(s)

        dcgmi_table = make_dcgm_groups(entity_table)

        make_mps(df_workload, gpu_uuids)

        commands = []

        for i, (id, row) in enumerate(df_workload.iterrows()):
            row = row.copy()
            row["Filepath"] = str(Path(row["File"]).parent.absolute())
            row["File"] = str(Path(row["File"]).name)

            # Workload Listener
            listeners = row["Listeners"].split("+")
            for listener in listeners:
                if listener.strip() == "nsys":
                    row["WorkloadListener"] = COMMAND_NSYS.format(**row)
                    listeners.remove(listener)
                elif listener.strip() == "nsysraw":
                    row["WorkloadListener"] = COMMAND_NSYS_RAW.format(**row)
                    listeners.remove(listener)
                elif listener.strip() == "ncu":
                    row["WorkloadListener"] = COMMAND_NCU.format(**row)
                    listeners.remove(listener)
                elif listener.strip() == "ncuattach":
                    row["WorkloadListener"] = COMMAND_NCU_ATTACH.format(**row)
                    listeners.remove(listener)
                elif listener.strip() == "ncuraw":
                    row["WorkloadListener"] = COMMAND_NCU_RAW.format(**row)
                    listeners.remove(listener)
                else:
                    row["WorkloadListener"] = ""
            listeners = "+".join(listeners)

            commands.append(
                (
                    id,
                    COLOURS[i % 6],
                    row["Letter"],
                    {
                        "MLFLOW_EXPERIMENT_ID": str(row["Experiment"]).strip(),
                        "CUDA_VISIBLE_DEVICES": ",".join(map(str, mig_table[id])),
                        "DNN_DCGMI_GROUP": str(dcgmi_table[id]),
                        "SMI_GPU_ID": str(row["Devices"]),
                    },
                    COMMAND.format(**row).split()
                    + ["-P", f"workload_listener={row['WorkloadListener']}"],
                    MLPROJECT_CONTENTS.replace(
                        "<REPLACE_COMMAND>",
                        MLFLOW_COMMAND.format(
                            WorkloadListener=row["WorkloadListener"],
                            Listeners=listeners,
                            File=row["File"],
                            Params=row["Params"] or '""',
                        ),
                    ),
                    row["Filepath"],
                    row,
                )
            )

        # Format and run the row
        sysprint(f"RUNNING WORKLOAD: {workload}")
        sysprint(commands)
        results = execute_workload(commands)
        remove_mps()

        # Write if .csv
        if isinstance(df_raw, pd.DataFrame):
            for id, letter, returncode, run_id, status in results:
                df_raw.loc[id, "Run"] = run_id
                if returncode == 0:
                    df_raw.loc[id, "Status"] = f"{status} ({letter})"
                else:
                    df_raw.loc[id, "Status"] = f"{status} - Failed ({letter})"

            # Write the result of the run to the csv
            target = Path("result.csv")
            df_raw.to_csv(target, index=False)
            p.unlink()
            target.rename(p)


if __name__ == "__main__":
    cli()
