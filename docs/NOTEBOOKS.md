# Notebook walkthrough

## 00 - Validate Admin Monitoring Access

Read-only prerequisite notebook.

### Checks

- Current and target workspace context
- Exact source model discovery
- Minimal DAX execution
- Table metadata
- Column metadata
- Sample data read

### When to rerun

- Permission changes
- Admin Monitoring reinitialization
- Tenant setting changes
- Managed model updates

## 01 - Provision Admin Monitoring Lakehouse

Idempotently creates or reuses:

- `AdminMonitoringArchive`
- `admin_monitoring` schema
- `admin_monitoring_control` schema

Initializes:

- `table_manifest`
- `run_audit`
- `schema_history`
- `reconciliation`
- `dormancy_window`

## 02 - Extract Admin Monitoring Models

Reusable extraction engine.

### Baseline mode

- Default mode
- Replaces each archive table with the current managed-model history
- Safe to rerun

### Daily mode

- Merges row signatures
- Updates `_last_seen_date`
- Marks signatures no longer present as noncurrent
- Preserves existing history

### Per-table workflow

1. Read column metadata.
2. Calculate source row count.
3. Validate query-size limits.
4. Extract rows.
5. Compare source and extracted counts.
6. Normalize names and data types.
7. Compute row hash.
8. Compact exact duplicates.
9. Merge to Delta.
10. Write schema evidence.
11. Write run-audit status.

## 03 - Daily Admin Monitoring Archive

The only notebook that should be scheduled.

```text
02 Extract in daily mode
  -> returns run_id
04 Reconcile exact run_id
```

The parent notebook fails if either child fails.

## 04 - Reconcile Admin Monitoring Archive

Validates:

- Manifest row count
- Manifest key coverage
- Table status
- Source/extracted row parity
- Target Delta existence
- Schema evidence
- Observed schema-version changes

Reconciliation results are appended to the control schema.
