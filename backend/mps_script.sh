export CUDA_VISIBLE_DEVICES=0

nvidia-smi -i 0 -c EXCLUSIVE_PROCESS
nvidia-cuda-mps-control -d

--- run models

nvidia-smi -i 0 -c DEFAULT
echo quit | nvidia-cuda-mps-control

