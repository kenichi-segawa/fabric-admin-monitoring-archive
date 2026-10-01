# Troubleshooting

## Admin Monitoring models are not listed by SemPy

Use Power BI REST discovery and `INFO.VIEW` metadata. The protected workspace does not behave like a normal Fabric workspace through every API.

## ABFSS endpoint reports `https:` as an invalid host

Obtain the endpoint dynamically, remove `https://` or `http://`, remove a trailing slash, then construct the ABFSS URI.

## Empty table count cannot be converted to integer

DAX can return BLANK for an empty table. Treat BLANK as zero.

## Delta merge reports multiple source rows matching one target row

Group source rows by `_row_hash` and store `COUNT(*)` as `_duplicate_count`.

## Polling receives 401 while the Fabric job continues

Refresh the token and continue polling the captured job ID. Do not submit another run.

## Direct Lake model has no visible tables

After deployment, trigger an enhanced `Automatic` refresh to frame the Direct Lake model.

## Report visual says it cannot determine relationships

Do not mix columns from disconnected fact-like snapshot tables in one visual. Use a conformed dimension or fields from one snapshot table.

## Report inactivity is always zero

Ensure the archive-through measure removes item, workspace, user, capacity, and date filters before calculating the global maximum activity date.
