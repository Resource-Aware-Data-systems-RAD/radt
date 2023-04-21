# Data Management and Visualization for Benchmarking Deep Learning Training Systems Backend

Benchmarking for RAD. Runs operate in special Anaconda environments managed by MLFlow. Listeners (e.g. SMI) are added automatically.

## Architectures

Models are split over a host of architectures:

- [PyTorch](benchmark/pytorch)
- [HFace PyTorch](benchmark/hface_pytorch)
- [Tensorflow](benchmark/tensorflow)
- [MXNet](benchmark/mxnet)

## Usage

Before usage, create a conda environment that supports MLFlow (e.g. use the [PyTorch environment in the environments folder](environments/pytorch.yaml)). Activate the environment and set the required environment variables by running [environment.sh](environment.sh). You'll need to reactivate your environment to apply the changes.

Write a .csv experiment file (or use an [existing one](experiments)) that contains all of the required runs.
CSV files should be structured in the following way:

`Experiment,Workload,Status,Run,Devices,Collocation,Architecture,Model,Data,Listeners,Params`

Run the experiment via:
`python run_csv.py PATH_TO_CSV`

Runs terminate automatically after 5 epochs or 24 hours, whatever comes first.

## Results

Results are automatically uploaded to the MLFlow server. These results can be inspected interactively used the front-end framework.
