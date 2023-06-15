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

In order to deploy RADT using docker, clone this repo to your server and run:
```bash
docker compose up
```

### **2. Docker containers**

The containers can also be deployed manually/individually if desired:

- [MLFlow](https://mlflow.org/docs/latest/docker.html)
- [MinIO](https://hub.docker.com/r/minio/minio/)
- [PostgreSQL](https://hub.docker.com/_/postgres)
- [PostgREST](https://hub.docker.com/r/postgrest/postgrest/)
- [RADT Visualisation](https://LINK_MISSING)

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

## Running Examples

All examples should run via `radt <script>.py` unless specified.
radT will automatically supply MLproject files for MLFlow to function correctly.

**Examples should work out of the box using the supplied conda environment!**

## Other Examples

Please feel free to contribute examples!
