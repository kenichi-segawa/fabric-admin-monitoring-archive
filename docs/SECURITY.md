# Security and privacy

## Public repository content

This repository must not contain:

- Access tokens
- Client secrets
- Certificates
- Tenant IDs
- Workspace IDs
- Lakehouse IDs
- Semantic model IDs
- Report IDs
- User object IDs
- User principal names
- Customer screenshots
- Notebook outputs
- Lakehouse data
- `.pbi` caches

Use placeholders such as:

- `YOUR_TARGET_WORKSPACE`
- `YOUR_WORKSPACE_ID`
- `YOUR_LAKEHOUSE_ID`
- `YOUR_SEMANTIC_MODEL_ID`

## Deployment security

- Use least-privilege workspace roles.
- Restrict Lakehouse SQL endpoint access.
- Restrict Build permission on the semantic model.
- Restrict the user-detail report page audience.
- Review privacy and employee-monitoring requirements.
- Define retention and deletion policies.
- Consider hashing user identifiers in an API-based implementation.

## Reporting a security issue

Do not open a public issue containing credentials or tenant information.

Contact the repository owner privately through GitHub before disclosing a suspected security issue.
