# Superfluid Token List Management

This repository contains scripts and utilities for managing the Superfluid token list(s). The scripts update or filter tokens based on various criteria, such as solvency categories or token types.

## Installation and Getting Started

```sh
[npm install | yarn add | pnpm add] @superfluid-finance/tokenlist
```

```typescript
import tokenlist, { 
 extendedSuperTokenList
} from "@superfluid-finance/tokenlist"

// ...later

const underlyingTokens = extendedTokenlist.tokens.filter((token) => token.tags.includes("underlying"))
```


## How to List a Token

If you'd like to have a token added to our token list or updated with regards to its solvency category, please follow the steps below:

### 1. **Prerequisites**:

   - Prepare all necessary token information, such as token contract address, token symbol, token name, decimals, logo URI, and other relevant data.

### 2. **Submit a Proposal**:
   - Fork the repository.
   - Add or update the token's details in the appropriate JSON file.
   - Create a pull request with a clear title and description detailing the changes and the reasons behind them.

### 3. **Review Process**:
   - Our team will review the proposal, which might include verifying the token's authenticity, its source code (if available), liquidity, market cap, and other essential metrics.
   - If further information is required, our team will comment on the pull request.

### 4. **Feedback and Updates**:
   - Based on the feedback, update the pull request if necessary. Respond to any comments and provide clarifications where needed.

### 5. **Approval & Merge**:
   - Once the review process is complete and the token meets all criteria, the pull request will be approved.
   - The changes will be merged, and the token will be listed, and a new package version will be released.

### 6. **Post-Listing**:
   - Once listed, the token's solvency category might be updated periodically based on ongoing assessments.
   - Users and token owners can provide feedback and request re-evaluation if they believe a token's category needs to be updated.

**Note**: Listing is not an endorsement. Always do your own research before interacting or investing in any token.

## Token Types

Tokens are classified into specific types:

- **Wrapper**: A supertoken that wraps a regular token (eg. USDC - USDCx).
- **Native Asset**: A supertoken related to the blockchain's native token (eg. ETH - ETHx).
- **Pure**: Supertokens that neither wrap other assets nor are they related to the native asset.
- **Underlying**: Regular (ERC20) tokens, which are the underlying tokens of some supertoken.

Underlying tokens always get included in the respective lists.

### Available Token Lists

- **`superfluid.tokenlist.json`**: The default Superfluid token list, excluding tokens tagged `testnet`.
- **`superfluid.extended.tokenlist.json`**: An extended list of all listed tokens, including testnet tokens.

### Tags Explanation

Tokens are categorized using tags for quicker identification:

- **`underlying`**: Marks a token as an underlying asset for another token.
- **`supertoken`**: Marks a token as a supertoken.
- **`testnet`**: Testnet tokens such as fUSDC & fUSDCx.

## Usage with Next.js
If you're using the token icons with Next.js' `<Image>` component then you might need to add this to your `next.config.js`:
```ts
images: {
    remotePatterns: [
        { hostname: "tokenlist.superfluid.org" }
    ]
}
```

  
## Development

Use Node.js 24 (matching the publishing workflow) and pnpm 8.6.1 (pinned in
`package.json`). From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

`build` builds the workspace package locally, including copying the two supported
lists into its `public/` and `dist/` directories. It does not publish anything.
There is no automated test suite. `typecheck` checks the root maintenance code
with its CommonJS configuration. The package has a separate ES module configuration
and its types are checked by the declaration build in `build`.

### Update the token lists

The CMS is the source for routine updates. Choose the release version and keep
`package.json` and `packages/tokenlist/package.json` in sync before fetching:
`fetch:cms` reads the root version into the generated list. Run each step from
the root and review its output before continuing.

```sh
pnpm run fetch:cms
pnpm run order:tokenlist
pnpm run filter:mainnet
pnpm run copy:docs
pnpm run build
```

| Command | Input and effect |
| --- | --- |
| `fetch:cms` | Reads the live CMS, applies repository overrides and active-network filtering, validates the Uniswap schema, and overwrites `superfluid.extended.tokenlist.unordered.json`. |
| `order:tokenlist` | Reads the unordered list and writes `superfluid.extended.tokenlist.json`, grouping chains in their existing order and sorting each chain by descending `orderingScore`. |
| `filter:mainnet` | Reads the extended list and overwrites `superfluid.tokenlist.json`, excluding `testnet` tokens and retaining required underlying tokens. This is not a solvency-tier split. |
| `copy:docs` | Copies only the default and extended lists to `docs/`, the GitHub Pages assets. This is a local copy, not a deployment. |

Review changes to the unordered, extended, default and `docs/` lists together.
Keep icons in `docs/icons/`; fetching does not download them. Preserve the
chain, name, icon and underlying-token overrides in `scripts/fetch-from-cms.ts`.
The older automatic version command was removed: it consumed `DRAFT.tokenlist.json`
and only bumped the root package version, which does not maintain this CMS workflow
or the workspace package version. Set both package versions explicitly instead.

### Compare and validate local changes

```sh
pnpm run diff:lists superfluid.extended.tokenlist.json superfluid.extended.tokenlist.unordered.json
pnpm run diff:lists --ignoreExtensions superfluid.extended.tokenlist.json superfluid.extended.tokenlist.unordered.json
```

`diff:lists` writes an ignored JSON report under `diff-output/`. Paths are relative
to the repository root. With no paths it compares the extended list against a
local `DRAFT.tokenlist.json`. `--ignoreExtensions` suppresses changes whose only
changed field is `extensions`, including ordering-score changes; additions and
removals are still reported. It compares token entries, not list versions or timestamps.

For code or command changes, run `typecheck` and `build`, then inspect `git diff`.
For list updates, also inspect the generated lists and diff reports. The CMS
fetch performs schema validation; `filter:mainnet` also uses the checks in
`utils/index.ts` for underlying-token presence and duplicate addresses per chain.
`filter:mainnet` and some legacy scripts log validation errors without a failing
exit status, so read their output as well as checking the exit code.

### Occasional maintenance

These commands are independent tools, not steps in the CMS update sequence:

| Command | Purpose and cautions |
| --- | --- |
| `editor` | Serves a JSON editor at `http://localhost:3000`, initially loading the default list. The Get content button displays JSON for manual copying; it does not save a file. |
| `codegen:subgraph` | Regenerates committed `subgraph/.graphclient/` from the GraphQL query/configuration. Requires access to the configured subgraph; use when changing those inputs. |
| `legacy:bootstrap` | Queries subgraphs and writes `DRAFT.tokenlist.json`. It bypasses CMS curation and overrides; use only for deliberate subgraph investigation, then compare manually. |
| `legacy:attach-solvency` | Rewrites extended-list solvency tags from `solvency-categories.csv`, assigning C when no row matches. The CSV is historical; verify it before use. This is not part of routine updates. |
| `ipfs:publish <list.json>` | Validates and pins a list to IPFS using `PINATA_API_KEY` and `PINATA_SECRET` from `.env`. This writes externally; run only for an explicitly requested publication. |

NPM publishing is separate: the manually dispatched
[release workflow](.github/workflows/npm-publish.yml) installs with the frozen
lockfile, builds the workspace package, and publishes using trusted publishing.
Do not run it as a validation check.
