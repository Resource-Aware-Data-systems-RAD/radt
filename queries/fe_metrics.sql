CREATE OR REPLACE VIEW public.fe_metrics
AS SELECT metrics.run_uuid,
    metrics.key,
    metrics.value,
    metrics."timestamp",
    metrics.step
   FROM metrics;
