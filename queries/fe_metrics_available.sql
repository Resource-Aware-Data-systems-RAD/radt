CREATE OR REPLACE VIEW public.fe_metrics_available
AS WITH RECURSIVE t AS (
        ( SELECT metrics.key
           FROM metrics
          ORDER BY metrics.key
         LIMIT 1)
        UNION ALL
         SELECT ( SELECT metrics.key
                   FROM metrics
                  WHERE metrics.key::text > t_1.key::text
                  ORDER BY metrics.key
                 LIMIT 1) AS key
           FROM t t_1
          WHERE t_1.key IS NOT NULL
        )
 SELECT t.key
   FROM t
  WHERE t.key IS NOT NULL;
