import argparse
import os


AVAILABLE_LISTENERS = ["ps", "smi", "dcgmi", "top", "nsys", "ncu", "ncu_attach"]


class Parser:
    """
    Argparser for MLDGPUB
    """
    parser = argparse.ArgumentParser(description="Multi-Level DNN GPU Benchmark")

    def __init__(self):
        self.parser.add_argument("-m", "--model", metavar="MODEL", help="model name")
        self.parser.add_argument(
            "-d",
            "--data",
            metavar="DIR",
            help="path to dataset",
        )
        self.parser.add_argument(
            "-l",
            "--listeners",
            metavar="LISTENERS",
            help=f"listeners, available: {' '.join(AVAILABLE_LISTENERS)}",
        )
        self.parser.add_argument("-g", "--gpu", metavar="GPU")

        self.parser.add_argument("--params", type=str, metavar="PARAMS")

    def add_framework(self):
        self.parser.add_argument(
            "-f",
            "--framework",
            metavar="FRAMEWORK",
            help=f"framework",
        )
