# Tokenlist agent guide

## Setup and validation

Use Node.js 24, matching `.github/workflows/npm-publish.yml`, and the pinned
pnpm 8.6.1. Run commands from the repository root after
`pnpm install --frozen-lockfile`.

For code, command or configuration changes, run `pnpm run typecheck` and
`pnpm run build`, then review `git diff --check` and the final diff. There is no
automated test suite. Root TypeScript is CommonJS for maintenance scripts;
`packages/tokenlist/tsconfig.json` owns the ES module package, checked by the
package declaration build. Restore `packages/tokenlist/public/placeholder.txt`
if the existing build removes it.

## Ownership and generated files

- `scripts/` owns maintenance entry points; `utils/` and root `index.ts` provide
  their validation and types. `editor/` owns the optional local JSON editor.
- `packages/tokenlist/` owns the published API, exports, README and build config.
  Treat `public/*.tokenlist.json` and `dist/` there as local build outputs.
- Root token-list JSON files are tracked data artifacts. `docs/` owns GitHub
  Pages assets, including the copied lists and manually maintained `icons/`.
- `subgraph/` owns GraphQL queries and configuration. After changing them, use
  `pnpm run codegen:subgraph` and review the generated `.graphclient/` diff.
  This command contacts the configured subgraph.

## Token-list and release work

For token updates, read the Development section in `README.md` for the CMS
sequence, command inputs/outputs, and occasional maintenance tools. CMS fetches
apply network filtering and explicit token overrides in `scripts/fetch-from-cms.ts`;
preserve those when changing generation. Use the `legacy:*` tools only for
intentional historical maintenance, not routine CMS updates.

Keep both package versions in sync before fetching; the CMS fetch reads the root
version. Review changes across the unordered, extended, default and `docs/`
lists together. Keep command-only work free of token data, icon and generated
GraphQL changes. Copy only the default and extended lists to distribution assets.

`fetch:cms` reads the live CMS and overwrites a local tracked artifact. For local
command checks, use existing files or disposable fixtures instead. `filter:mainnet` and some legacy
scripts log validation failures without returning a nonzero exit code, so inspect
their output. Publishing requires an explicit request: `ipfs:publish` pins through
Pinata using `.env` credentials, and the manual GitHub workflow publishes to NPM.
Keep secrets in local `.env`; use local builds and diffs for validation.
