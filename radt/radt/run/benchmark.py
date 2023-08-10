import os
import sys
from time import time

import mlflow

from .listeners import dcgmi_listener, ps_listener, smi_listener, top_listener


class RADTBenchmark:
    def __init__(self):
        """
        Context manager for a run.
        Will track ML operations while active.
        """

        # Grab run id
        try:
            run = mlflow.start_run(run_id=os.getenv("RADT_RUN_ID"))
        except Exception as e:
            run = mlflow.active_run()
        self.run_id = run.info.run_id

        print("Starting benchmark!")
        print(f"CAPTURED RUN ID [{self.run_id}]")

    def __enter__(self):
        self.threads = []
        self.max_epoch = int(os.getenv("RADT_MAX_EPOCH"))
        self.max_time = time() + int(os.getenv("RADT_MAX_TIME"))

        # Spawn threads for listeners
        if os.getenv("RADT_LISTENER_PS") == "True":
            self.threads.append(ps_listener.PSThread(self.run_id))
        if os.getenv("RADT_LISTENER_SMI") == "True":
            self.threads.append(smi_listener.SMIThread(self.run_id))
        if os.getenv("RADT_LISTENER_DCGMI") == "True":
            self.threads.append(dcgmi_listener.DCGMIThread(self.run_id))
        if os.getenv("RADT_LISTENER_TOP") == "True":
            self.threads.append(top_listener.TOPThread(self.run_id))

        for thread in self.threads:
            thread.start()
        return self

    def __exit__(self, type, value, traceback):
        # Terminate listeners and run
        for thread in self.threads:
            thread.terminate()
        mlflow.end_run()

    def log_metric(self, name, value, step=0):
        """
        Log a metric. Terminates the run if epoch/time limit has been reached.

        :param name: Metric name (string). This string may only contain alphanumerics, underscores
                    (_), dashes (-), periods (.), spaces ( ), and slashes (/).
                    All backend stores will support keys up to length 250, but some may
                    support larger keys.
        :param value: Metric value (float).
        :param step: Integer training step (iteration) at which was the metric calculated.
                     Defaults to 0.
        """
        mlflow.log_metric(name, value, step)
        if step >= self.max_epoch or time() > self.max_time:
            print("Maximum epoch reached")
            sys.exit()

    def log_metrics(self, metrics, step=0):
        """
        Log multiple metrics. Terminates the run if epoch/time limit has been reached.

        :param name: Dict of metrics (string: float). Key-value pairs of metrics to be logged.
        :param step: Integer training step (iteration) at which was the metric calculated.
                     Defaults to 0.
        """
        mlflow.log_metrics(metrics, step)
        if step >= self.max_epoch or time() > self.max_time:
            print("Maximum epoch reached")
            sys.exit()
