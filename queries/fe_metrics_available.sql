CREATE OR REPLACE VIEW public.fe_metrics_available AS
SELECT DISTINCT latest_metrics.key,
  latest_metrics.run_uuid
FROM latest_metrics;
