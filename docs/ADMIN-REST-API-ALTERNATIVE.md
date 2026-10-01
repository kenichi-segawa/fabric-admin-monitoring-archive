# Recommended Admin REST API alternative

The managed-model extraction is a fast path to historical reporting. For a durable audit system of record, use Power BI Admin APIs.

## Activity Events API

Use for:

- Native event IDs
- User and artifact activity
- Report and dashboard views
- Consumption method
- Distribution method
- Request/activity IDs
- Operation-specific payloads

### Ingestion pattern

1. Request one UTC day at a time.
2. Follow continuation tokens until none remain.
3. Continue when a page is empty but still returns a token.
4. Store immutable raw JSON.
5. Reload the previous two completed days.
6. Deduplicate by event ID.
7. Normalize curated activity facts.

## Scanner APIs

Use for:

- Full workspace inventory
- Reports with zero activity
- Semantic models
- Lineage
- Sensitivity labels
- Endorsement
- Data sources
- Item lifecycle and deletion

Activity data cannot identify an inactive report that never generated an event. Scanner inventory is required for that use case.

## Migration recommendation

Run the managed-model archive and Admin API ingestion in parallel for 30 to 60 days.

Compare:

- Report views
- Users
- Workspaces
- Operations
- Item inventory
- Deleted items
- Governance coverage

After reconciliation:

- Make Activity Events the usage fact source.
- Make Scanner APIs the inventory source.
- Keep Admin Monitoring as a benchmark or retire its extraction.
