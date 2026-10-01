# Lakehouse schema

## Schemas

| Schema | Purpose |
|---|---|
| `admin_monitoring` | Archived source data and helper tables |
| `admin_monitoring_control` | Manifest, audit, schema, and reconciliation evidence |

## Extraction manifest

### Content Sharing

| Source table | Lakehouse table |
|---|---|
| Refresh Stats | `content_sharing__refresh_stats` |
| Changelog | `content_sharing__changelog` |
| Workspace | `content_sharing__workspace` |
| User | `content_sharing__user` |
| Fabric Items | `content_sharing__fabric_items` |
| Capacity | `content_sharing__capacity` |
| Domain | `content_sharing__domain` |

### Feature Usage and Adoption

| Source table | Lakehouse table |
|---|---|
| Refresh Stats | `feature_usage_and_adoption__refresh_stats` |
| Date | `feature_usage_and_adoption__date` |
| Changelog | `feature_usage_and_adoption__changelog` |
| Workspace | `feature_usage_and_adoption__workspace` |
| Audit | `feature_usage_and_adoption__audit` |
| Capacity | `feature_usage_and_adoption__capacity` |
| User | `feature_usage_and_adoption__user` |
| Fabric Items | `feature_usage_and_adoption__fabric_items` |

### OneLake Catalog - Governance for Admins

| Source table | Lakehouse table |
|---|---|
| Workspace | `onelake_catalog_governance_for_admins__workspace` |
| User | `onelake_catalog_governance_for_admins__user` |
| Fabric Items | `onelake_catalog_governance_for_admins__fabric_items` |
| Capacity | `onelake_catalog_governance_for_admins__capacity` |
| Domain | `onelake_catalog_governance_for_admins__domain` |
| Refresh Stats | `onelake_catalog_governance_for_admins__refresh_stats` |
| Audit | `onelake_catalog_governance_for_admins__audit` |
| Sensitivity Labels | `onelake_catalog_governance_for_admins__sensitivity_labels` |
| Subdomain | `onelake_catalog_governance_for_admins__subdomain` |
| Workspace Tags | `onelake_catalog_governance_for_admins__workspace_tags` |
| Item Tags | `onelake_catalog_governance_for_admins__item_tags` |
| Tags | `onelake_catalog_governance_for_admins__tags` |

### Purview Hub

| Source table | Lakehouse table |
|---|---|
| Fabric Items | `purview_hub__fabric_items` |
| Workspace | `purview_hub__workspace` |
| User | `purview_hub__user` |
| Capacity | `purview_hub__capacity` |
| Domain | `purview_hub__domain` |

## Common archive columns

Each archived table includes some or all of:

| Column | Type | Meaning |
|---|---|---|
| `_row_hash` | string | Deterministic source-row signature |
| `_duplicate_count` | long | Number of identical source rows represented |
| `_source_model` | string | Managed semantic model |
| `_source_table` | string | Managed table |
| `_snapshot_date_utc` | date | Snapshot date |
| `_first_seen_date` | date | First observation |
| `_last_seen_date` | date | Most recent observation |
| `_is_current` | boolean | Present in latest source snapshot |
| `_extracted_at_utc` | timestamp | Extraction timestamp |

## Control tables

### `table_manifest`

| Column | Meaning |
|---|---|
| `semantic_model` | Managed source model |
| `source_table` | Managed source table |

### `run_audit`

| Column | Meaning |
|---|---|
| `run_id` | Extraction run identifier |
| `run_mode` | `baseline` or `daily` |
| `semantic_model` | Source model |
| `source_table` | Source table |
| `target_table` | Lakehouse table |
| `source_row_count` | DAX source count |
| `extracted_row_count` | Returned row count |
| `schema_hash` | Source metadata hash |
| `status` | Succeeded or Failed |
| `error_message` | Explicit failure detail |
| `started_utc` | Table-start timestamp |
| `ended_utc` | Table-end timestamp |

### `schema_history`

| Column | Meaning |
|---|---|
| `run_id` | Run identifier |
| `semantic_model` | Source model |
| `source_table` | Source table |
| `schema_hash` | SHA-256 metadata hash |
| `columns_json` | Source column metadata |
| `recorded_utc` | Observation timestamp |

### `reconciliation`

| Column | Meaning |
|---|---|
| `run_id` | Reconciled run |
| `check_name` | Quality check |
| `passed` | Boolean outcome |
| `details` | Evidence |
| `checked_utc` | Check timestamp |

## Direct Lake semantic model schema

| Model table | Lakehouse source |
|---|---|
| Usage Activity | `feature_usage_and_adoption__audit` |
| Date | `feature_usage_and_adoption__date` |
| Workspaces | `feature_usage_and_adoption__workspace` |
| Items | `feature_usage_and_adoption__fabric_items` |
| Users | `feature_usage_and_adoption__user` |
| Capacities | `feature_usage_and_adoption__capacity` |
| Governance Items | `onelake_catalog_governance_for_admins__fabric_items` |
| Sharing Items | `content_sharing__fabric_items` |
| Sensitivity Labels | `onelake_catalog_governance_for_admins__sensitivity_labels` |
| Dormancy Window | `dormancy_window` |
