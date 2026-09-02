# Source snapshots

Normalized responses captured from a live public API, committed so the
retrieval path is reproducible offline.

These files are **generated only**, by:

```bash
npm run capture:snapshot -- "<query term>"
```

which requires a successful live response. Never hand-write or hand-edit a file
here: a snapshot is the record that a retrieval actually happened, and editing
one would turn it into fabricated evidence. Every record is re-validated against
the domain schema when it is loaded, and a record marked as verified must carry
the `retrievedAt` stamp proving when it was fetched.

This directory is empty until someone with network access runs the capture
command. The application does not require any snapshot to run.
