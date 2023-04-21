import os
import signal
import subprocess

from argparser import Parser


def main():
    """
    Access point for model running.
    Contains the calls to run the models themselves."""

    # Parse the arguments passed by the scheduler + MLFlow wrapper
    parser = Parser()
    parser.add_framework()
    args = parser.parser.parse_args()

    if args.data == "nan":
        data = ""
    else:
        data = args.data

    # TODO: This is duplicate code (modelrunner.py) and should be removed.
    # Clean passthrough arguments as they were concatenated to a single string
    if len(args.params) > 1 and args.params != '"nan"':  # skip if just "-"
        passthrough = args.params.strip()

        if (
            passthrough[0] == '"' and passthrough[-1] == '"'
        ):  # Clean if propagated via "
            passthrough = passthrough[1:-1].strip()

        passthrough = ("--" + passthrough.replace(",", " --")).replace("=", " ")

    else:
        passthrough = ""
    print("\n\n\nPASSTHROUGH PARAMETERS:", passthrough)

    # Get GPU information
    devices = os.getenv("CUDA_VISIBLE_DEVICES")
    device_count = len(devices.split(","))

    try:
        ############################################################
        ###                                                      ###
        ###                       Pytorch                        ###
        ###                                                      ###
        ############################################################

        if args.framework == "pytorch":

            ###############
            ### resnet_old
            ###############
            if args.model == "resnet_old":
                subprocess.run(
                    f"python resnet/main.py -a resnet18 {data} {passthrough}".split()
                )

            ###############
            ### timm
            ###############
            elif "timm." in args.model:
                # flexible access to timm models
                m = ".".join(args.model.split(".")[1:])

                if device_count > 1:  # Distributed
                    subprocess.run(
                        f"python -m torch.distributed.launch --nproc_per_node={device_count} pytorch_image_models/train.py --model {m} {data} {passthrough}".split(),
                        check=True,
                    )
                else:
                    subprocess.run(
                        f"python pytorch_image_models/train.py --model {m} {data} {passthrough}".split(),
                        check=True,
                    )

            ###############
            ### timmll
            ###############
            elif "timmll." in args.model:
                # flexible access to timm models
                m = ".".join(args.model.split(".")[1:])

                if device_count > 1:  # Distributed
                    raise NotImplementedError()
                    subprocess.run(
                        f"python -m torch.distributed.launch --nproc_per_node={device_count} pytorch_image_models/train.py --model {m} {data} {passthrough}".split(),
                        check=True,
                    )
                else:
                    subprocess.run(
                        f"python pytorch_image_models/train_lossy.py --model {m} {data} {passthrough}".split(),
                        check=True,
                    )

            ###############
            ### dlrm
            ###############
            elif "dlrm." in args.model:
                if device_count > 1:  # Distributed
                    raise NotImplementedError()
                    subprocess.run(
                        f"python -m torch.distributed.launch --nproc_per_node={device_count} pytorch_image_models/train.py --model {m} {data} {passthrough}".split(),
                        check=True,
                    )
                else:
                    # base test spec
                    # subprocess.run(
                    #     f'python dlrm/dlrm_s_pytorch_framework.py --arch-sparse-feature-size=64 --arch-mlp-bot=13-512-256-64 --arch-mlp-top=512-512-256-1 --max-ind-range=10000000 --data-generation=dataset --data-set=terabyte --raw-data-file=/raid/datasets/criteo/data/day --processed-data-file=./input/terabyte_processed.npz --loss-function=bce --round-targets=True --learning-rate=0.1 --mini-batch-size=2048 --print-freq=1024 --print-time --test-mini-batch-size=16384 --test-num-workers=16 --test-freq=102400 --memory-map --data-sub-sample-rate=0.875 --use-gpu'.split(),
                    #     check=True,
                    # )

                    # MLPERF spec without mlperf special settings (see github)
                    subprocess.run(
                        f'python dlrm/dlrm_s_pytorch_framework.py --arch-sparse-feature-size=128 --arch-mlp-bot=13-512-256-128 --arch-mlp-top=1024-1024-512-256-1 --max-ind-range=40000000 --data-generation=dataset --data-set=terabyte --raw-data-file=/raid/datasets/criteo/data/day --processed-data-file=./input/terabyte_processed.npz --loss-function=bce --round-targets=True --learning-rate=1.0 --mini-batch-size=2048 --print-freq=2048 --print-time --test-freq=102400 --test-mini-batch-size=16384 --test-num-workers=16 --memory-map --use-gpu'.split(),
                        check=True,
                    )
                    # subprocess.run(
                    #     f'bash dlrm/run_best_framework.sh'.split(),
                    #     check=True,
                    # )


            ###############
            ### detectron2
            ###############
            elif "det2." in args.model:
                # flexible access to detectron2 models
                m = ".".join(args.model.split(".")[1:])

                if device_count > 1:  # Distributed
                    print("Running DETECTRON distributed")
                    subprocess.run(
                        f"python detectron2/tools/train_net.py --config-file configs/Detectron1-Comparisons/mask_rcnn_R_50_FPN_noaug_1x.yaml --num-gpus {device_count}".split()
                    )
                else:
                    print("Running DETECTRON single")
                    subprocess.run(
                        f"python detectron2/tools/train_net.py --config-file configs/Detectron1-Comparisons/mask_rcnn_R_50_FPN_noaug_1x.yaml --num-gpus 1 SOLVER.IMS_PER_BATCH 2 SOLVER.BASE_LR 0.0025".split()
                    )

            ###############
            ### nnunet
            ###############
            elif args.model == "nnunet":
                subprocess.run("python nnunet/train.py".split())

            ###############
            ### fairseq
            ###############
            elif args.model == "fairseq":
                subprocess.run("python fairseq/main.py".split())

        ############################################################
        ###                                                      ###
        ###                      Tensorflow                      ###
        ###                                                      ###
        ############################################################

        elif args.framework == "tensorflow":

            ###############
            ### mnist_custom
            ###############
            if args.model == "mnist_custom":
                subprocess.run(f"python mnistcnn/main.py".split())
            else:
                subprocess.run(f"python {args.model} {data} {passthrough}".split())

        ############################################################
        ###                                                      ###
        ###                 Pytorch (Huggingface)                ###
        ###                                                      ###
        ############################################################

        elif args.framework == "hface_pytorch":

            ###############
            ### bert
            ###############
            if args.model == "bert":
                # subprocess.run(
                #     f"python bert-model/main.py /datasets/wikipedia_processed/".split()#{data}".split()
                # )

                subprocess.run(
                    f"python roberta/run_mlm.py --model_type roberta --config_name roberta-base --dataset_name wikipedia --dataset_config_name 20220301.en --per_device_train_batch_size 32 --per_device_eval_batch_size 32 --do_train --do_eval --output_dir /tmp/test-mlm2 --tokenizer_name=roberta-base --overwrite_output_dir".split()
                )

            elif args.model == "bert_tuning":
                subprocess.run(
                    f"python roberta/run_mlm.py --model_name_or_path roberta-base --dataset_name wikipedia --dataset_config_name 20220301.en --per_device_train_batch_size 32 --per_device_eval_batch_size 32 --do_train --do_eval --output_dir /tmp/test-mlm2 --tokenizer_name=roberta-base --overwrite_output_dir".split()
                )
    except subprocess.CalledProcessError as e:
        # raise KeyboardInterrupt("Run finished!")
        raise e

    # Terminate the runner
    # os.kill(os.getppid(), signal.SIGUSR1)
    # os.kill(os.getppid(), signal.SIGINT)
    raise KeyboardInterrupt("Run finished!")


if __name__ == "__main__":
    main()
