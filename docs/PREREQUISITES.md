# Prerequisites

## Roles and permissions

### Admin Monitoring source

- A directly assigned **Fabric Administrator** should initialize and validate the Admin monitoring workspace.
- The extraction identity needs access to all four managed semantic models.
- The identity needs **Build/query permission** on each model. In Admin Monitoring, Build can appear as Read.
- If Privileged Identity Management is used, required roles must be active when the source refresh and scheduled extraction run.

Required managed models:

1. Content Sharing
2. Feature Usage and Adoption
3. OneLake Catalog - Governance for Admins
4. Purview Hub

### Target workspace

Use **Contributor or Admin** access for the deployment/execution identity. It must be able to:

- Create and run notebooks
- Run child notebooks
- Create or update the Lakehouse
- Write Delta tables
- Create or update semantic models and reports
- Create notebook schedules

## Capacity and licensing

- The target workspace must be assigned to an **active Fabric capacity**.
- The capacity must support Spark notebooks, Lakehouse, OneLake, Direct Lake, semantic models, and reports.
- F2 can be sufficient for a small proof of concept; production sizing depends on data volume, history, concurrency, and report usage.
- On capacity below F64, authors and consumers generally require Power BI Pro or PPU.
- F64 or higher normally permits free-user report consumption.

Monitor Spark queue time, notebook duration, throttling, Lakehouse growth, Direct Lake framing, and report latency.

## Tenant settings

Confirm:

- Dataset Execute Queries REST API is enabled for the extraction identity.
- XMLA connectivity is enabled when required.
- The identity can create Fabric and Power BI items.
- If using a service principal, the appropriate Fabric/Power BI API tenant settings and security-group scopes are enabled.
- Metadata scanning is enabled only when implementing the Scanner API alternative.

## Runtime and storage

- Run the notebooks in the target workspace, not in the protected Admin monitoring workspace.
- Use Fabric Spark 3.4+ with built-in Semantic Link, NotebookUtils, Delta Lake, and OneLake access.
- No notebook package installation should be required.
- The execution identity needs write access to the `admin_monitoring` and `admin_monitoring_control` Lakehouse schemas.

## Security

- Treat user activity and user identifiers as sensitive operational data.
- Apply least-privilege access to the workspace, Lakehouse, SQL endpoint, semantic model, and report.
- Restrict the user-detail report page audience.
- Confirm retention, privacy, legal, and employee-monitoring requirements before production use.

## Deployment checklist

- [ ] Admin monitoring workspace initialized and refreshed
- [ ] All four semantic models accessible
- [ ] Fabric Administrator role confirmed
- [ ] Build/query permissions confirmed
- [ ] Execute Queries tenant setting enabled
- [ ] Target workspace assigned to active Fabric capacity
- [ ] Contributor or Admin target role assigned
- [ ] Power BI licensing confirmed
- [ ] Lakehouse write and child-notebook permissions confirmed
- [ ] Retention and privacy review completed
- [ ] Notebook 00 passes before provisioning
