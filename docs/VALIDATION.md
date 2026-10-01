# Fabric validation

The reference implementation was tested end to end in Microsoft Fabric.

Tenant-specific identifiers and metric values are intentionally omitted from this public repository.

## Validation matrix

| Validation | Result |
|---|---|
| Four managed models discovered | Passed |
| Minimal DAX query on every model | Passed |
| INFO.VIEW metadata on every model | Passed |
| Notebook JSON and Python syntax | Passed |
| Lakehouse provisioning | Passed |
| Full baseline extraction | Passed |
| Empty table handling | Passed |
| Exact duplicate handling | Passed |
| Source/extracted count parity | Passed |
| Reconciliation | Passed |
| Daily orchestration | Passed |
| Direct Lake model framing | Passed |
| Live model DAX | Passed |
| PBIR validation | Zero errors |
| Report/model binding comparison | Zero missing bindings |
| Report publication | Passed |
| Six-page Power BI Service render sweep | No visual errors |

## Issues found during testing

Testing identified and corrected:

- Protected workspace discovery differences
- Runtime OneLake endpoint normalization
- DAX BLANK count handling
- Ambiguous Delta merges from exact duplicate rows
- Long-running token expiration
- Direct Lake model framing requirement
- Cross-table visual relationship ambiguity
- Recency measure filter context

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
