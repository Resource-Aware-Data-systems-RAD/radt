import mlflow
import os
import psutil
import signal
import subprocess
import sys

from multiprocessing import Process, Event

from argparser import Parser, AVAILABLE_LISTENERS


RUN_ID = mlflow.start_run().info.run_id


# TODO: set nsys gpu device to use env variable  --gpu-metrics-device 1
COMMAND_NSYS = f"nsys profile -o ../../nsight_results/{RUN_ID} -f true -w true"  # -t cuda,osrt,nvtx,cudnn,cublas
COMMAND_NCU = f"ncu -o ../../nsight_results/{RUN_ID} "
COMMAND_NCU_ATTACH = f"ncu --mode=launch ../../nsight_results/{RUN_ID} "


def update_params_listing(params):
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
            k, v = s.split("=")
            statements[k] = v

    else:
        passthrough = ""

    mlflow.set_tracking_uri("https://res17.itu.dk")

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


def main(framework):
    parser = Parser().parser
    args = parser.parse_args()

    listeners = args.listeners.lower().split("+")

    # Sanity check listeners
    check_listeners(listeners)

    pass_args = " ".join(sys.argv[1:])
    command = f"python ../model.py -f {framework} {pass_args}"

    os.environ["DNN_RUN_ID"] = RUN_ID

    if "ncu" in listeners:
        command = f"{COMMAND_NCU}{command}"
    elif "ncu_attach" in listeners:
        command = f"{COMMAND_NCU_ATTACH}{command}"
    elif "nsys" in listeners:
        command = f"{COMMAND_NSYS}{command}"

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

    max_epoch = str(5) # 5 epochs
    max_time = str(2 * 24 * 60 * 60) # 2 days

    os.environ["DNN_MAX_EPOCH"] = max_epoch
    os.environ["DNN_MAX_TIME"] = max_time

    print("MAX EPOCH:", max_epoch, "MAX_TIME:", max_time)

    print("\n" * 5, "ARGS_GPU", args.gpu)
    if args.gpu:
        os.environ["CUDA_VISIBLE_DEVICES"] = args.gpu

    update_params_listing(args.params)
    process = subprocess.Popen(command.split())

    while process.poll() is None:
        pass

    try:
        children = psutil.Process(process.pid).children(recursive=True)
        print("Clearing children")
        process.kill()
        process.wait()

        for p in children:
            try:
                p.send_signal(signal.SIGKILL)
            except psutil.NoSuchProcess:
                pass
        psutil.wait_procs(children)
    except psutil.NoSuchProcess:
        pass

    exit(
        process.returncode != -2
    )  # Return 1 if not a KeyboardInterrupt (natural model ending)
