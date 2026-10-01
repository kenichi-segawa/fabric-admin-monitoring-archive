# Architecture

## Overview

The implementation uses the Microsoft-managed Admin Monitoring semantic models as an initial gold-layer source and copies selected tables into a durable Fabric Lakehouse.

## Source models

1. Content Sharing
2. Feature Usage and Adoption
3. OneLake Catalog - Governance for Admins
4. Purview Hub

The Admin Monitoring workspace is protected and read-only. Standard Fabric Core and SemPy discovery can return incomplete results even when Power BI DAX queries are permitted.

The notebooks therefore use:

- Power BI REST workspace and dataset discovery
- Execute Queries for DAX
- `INFO.VIEW.TABLES()` and `INFO.VIEW.COLUMNS()` for read-oriented metadata
- Fabric REST only for target workspace and Lakehouse lifecycle

## Processing layers

### Managed gold source

Microsoft owns refresh, schema, and the rolling history window.

### Durable Delta archive

The `admin_monitoring` schema stores selected source tables. Each archived row contains provenance and observation-history columns.

### Control layer

The `admin_monitoring_control` schema stores:

- Expected extraction manifest
- Per-table run results
- Schema versions
- Reconciliation checks

### Direct Lake semantic model

The model exposes:

- Usage Activity
- Date
- Workspaces
- Items
- Users
- Capacities
- Governance Items
- Sharing Items
- Sensitivity Labels
- Dormancy Window

### Power BI report

The report contains executive, analytical, comparative, governance, and restricted drillthrough pages.

## Why row-hash history is used

The managed Audit table does not expose the original Activity Events `Id`.

The extractor therefore:

1. Normalizes source values.
2. Hashes all source columns.
3. Groups identical source rows.
4. Stores their count in `_duplicate_count`.
5. Merges one signature into Delta history.

This makes reruns idempotent while preserving activity totals.

## Scale guardrails

The Power BI Execute Queries API has response limits. The implementation uses conservative preflight limits:

- 90,000 rows
- 900,000 values

If the Audit table exceeds the full-table limit, the extractor partitions it by `Creation date`.

If a single date exceeds the guardrail, the notebook fails and instructs operators to switch that source to the Activity Events API.
