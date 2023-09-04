import mlflow
import subprocess
import io

from multiprocessing import Process

class IOstatThread(Process):
    def __init__(self, run_id, experiment_id=88):
        super(IOstatThread, self).__init__()
        self.run_id = run_id
        self.experiment_id = experiment_id

    def run(self):
        ps = subprocess.Popen(
            "iostat 1 -m".split(),
            stdout=subprocess.PIPE,
        )

        for line in io.TextIOWrapper(ps.stdout, encoding="utf-8"):
            m = {}
            line = line.lstrip()

            if (
                line.startswith("nvme")
                or line.startswith("sd")
            ):
                word_vector = line.strip().split()

                device = word_vector[0]         # storage device
                mb_read_s = word_vector[2]      # MB read/s
                mb_written_s = word_vector[3]   # MB wrtn/s
                mb_discarded_s = word_vector[4] # MB dscd/s
                mb_read = word_vector[5]        # MB read since last sample
                mb_written = word_vector[6]     # MB written since last sample
                mb_discarded = word_vector[7]   # MB discarded since last sample

                m[f"{device} - MB read/s"] = float(mb_read_s)
                m[f"{device} - MB written/s"] = float(mb_written_s)
                # m[f"{device} - MB discarded/s"] = mb_discarded_s
                m[f"{device} - MB read"] = float(mb_read)
                m[f"{device} - MB written"] = float(mb_written)
                # m[f"{device} - MB discarded"] = mb_discarded_s

                mlflow.log_metrics(m)
