# We want to run the unified model runner instead.
# Go up one level to get to the unified runner.
import sys

sys.path.append("..")

# Run from there.
import modelrunner

modelrunner.main("tensorflow")
