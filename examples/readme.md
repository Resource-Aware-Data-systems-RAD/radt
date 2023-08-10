# RADT Training Examples

## Server configuration

[![preview](/media/dataflow-white.png)](#readme)

Running RADT requires some infrastructure to be set up, namely:

- **MLFlow instance** for workflow and experiment management. The current version of RADT is designed as an extension on [**MLFlow**](https://mlflow.org/).
- **Relational database** for experiment and metric storage. We recommend [**PostgreSQL**](https://www.postgresql.org/) with [**PostgREST**](https://postgrest.org/en/stable/) due to data scalability and ease of use.
- **S3 database** for artifact tracking, such as log files and traces. We recommend [**MinIO**](https://min.io/).
- **Visualisation server** for the visualisation front-end.

We provide two options for deploying these requirements:

### **1. Docker Compose (Recommended)**

The easiest way of deploying RADT, including the MLFlow instance and data storage, is via [Docker Compose](https://github.com/docker/compose). This deploys all the prerequisites as separate containers.

In order to deploy RADT using docker: 

1. Clone this repo to your server
2. Build the [frontend visualization container](/frontend/)
3. Run docker compose:

```bash
docker compose up
```

### **2. Docker containers**

The containers can also be deployed manually/individually if desired:

- [MLFlow](https://mlflow.org/docs/latest/docker.html)
- [MinIO](https://hub.docker.com/r/minio/minio/)
- [PostgreSQL](https://hub.docker.com/_/postgres)
- [PostgREST](https://hub.docker.com/r/postgrest/postgrest/)
- [RADT Visualisation](/frontend/)

### **3. From source**

If you do not want to use containers, you can deploy the software manually.
Clone this repository and follow the instructions in [visualization](/visualization) to build the visualization environment manually.

## Client configuration

Before running examples make sure you install the requirements. We recommend using Anaconda for environment management. Examples come bundled with a `conda.yaml` file which can be used to create the requisite environment:

```bash
conda env create -f conda.yaml
```

Furthermore, MLFlow requires a selection of environment variables to be set in the environment before operation:

```bash
conda env config vars set MLFLOW_TRACKING_USERNAME=
conda env config vars set MLFLOW_TRACKING_PASSWORD=
conda env config vars set MLFLOW_S3_ENDPOINT_URL=
conda env config vars set AWS_ACCESS_KEY_ID=
conda env config vars set AWS_SECRET_ACCESS_KEY=
conda env config vars set MLFLOW_TRACKING_URI=
```

The `MLFLOW_TRACKING_USERNAME` and `MLFLOW_TRACKING_PASSWORD` fields are only required when authorisation is enabled for MLFlow.

## Using Nsight
Nsight tracking can be enabled by using the respective listeners, e.g. `nsys` or `ncu`.
By default, these trackers will only track things that are within the `profile` NVTX range. This allows for targeted tracking, which is very helpful when using Nsight. 
It is critical that you use the official `nvtx` python library, as most other libraries (including PyTorch's native NVTX support) do not use `RegistredString` which is required for this kind of filtering.

Example:
```python
>>> import nvtx
>>> range_id = nvtx.start_range("profile")
>>> (... training loop ...)
>>> nvtx.end_range(range_id)
```

Note that for most projects, the amount of data collected will be extremely large. It is recommended to only mark **up to a couple of iterations** for tracing in order to reduce the quantity of data.

When using NCU, you can use the `ncuattach` to run an Nsight Compute live session instead. This is usually more practical than writing to a log file but requires an active connection to your server.


## Running Examples

All examples should run via `radt <script>.py` unless specified.
radT will automatically supply MLproject files for MLFlow to function correctly.

**Examples should work out of the box using the supplied conda environment!**

## Other Examples

Please feel free to contribute examples!
