# Operations runbook

## Daily schedule

Schedule notebook `03_Daily_Admin_Monitoring_Archive` once per day.

Recommended pattern:

```text
06:00 local time
  -> 02 extraction, run_mode=daily
  -> 04 reconciliation, same run_id
```

Use a named local time zone so daylight-saving behavior is explicit.

## Daily success checks

1. Confirm notebook 03 completed.
2. Record the returned extraction `run_id`.
3. Inspect `admin_monitoring_control.run_audit`.
4. Confirm one row exists for every manifest entry.
5. Confirm Failed count is zero.
6. Confirm source and extracted counts match.
7. Inspect `admin_monitoring_control.reconciliation`.
8. Confirm all required checks passed.
9. Review new schema hashes.

## Failure recovery

1. Do not create another run while a run is active.
2. Identify the failed child notebook.
3. Review the failed table or reconciliation check.
4. Correct permissions, schema, API, or storage issues.
5. Rerun notebook 03 manually.
6. Confirm the new run ID passes reconciliation.

## Idempotency

- Baseline mode overwrites target tables.
- Daily mode merges by `_row_hash`.
- Exact duplicate multiplicity is preserved.
- Failed-run evidence is retained.
- Reconciliation always targets an explicit run ID.

## Token-safe monitoring

Long jobs can outlive an access token. Monitoring clients should:

1. Capture the job ID immediately.
2. Refresh the Fabric token before each poll.
3. Poll the same job.
4. Never retry the create/run POST after a 202 response.

## Capacity monitoring

As archive history grows, monitor:

- Spark queue time
- Extraction duration
- Execute Queries throttling
- Lakehouse table growth
- Direct Lake framing duration
- Report query performance
