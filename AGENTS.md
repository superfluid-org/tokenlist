# Tokenlist agent guide

For setup, supported commands, validation, token updates or publishing, read
[Development in README.md](README.md#development). Follow its checks for code
and command changes, then run `git diff --check` and inspect the final diff.

## Ownership and generated files

- `scripts/` owns maintenance entry points; `utils/` and root `index.ts` provide
  their validation and types.
- `packages/tokenlist/` owns the published API and build. Its `public/*.tokenlist.json`
  and `dist/` are local build outputs. Restore tracked `public/placeholder.txt`
  if the existing build removes it.
- Root token-list JSON files are tracked artifacts. `docs/` owns GitHub Pages
  assets, including copied lists and manually maintained `icons/`.
- `subgraph/` owns GraphQL query/configuration and committed `.graphclient/`
  generated files; review generated diffs when changing those inputs.

## Change boundaries

Preserve the network filtering and explicit token overrides in
`scripts/fetch-from-cms.ts` when changing generation. Keep command-only work free
of token data, icon and generated GraphQL changes. Use existing files or disposable
fixtures for local command checks so validation does not regenerate tracked lists
from live services. Publishing requires an explicit request.
