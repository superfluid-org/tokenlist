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

Use Node.js 24 (matching CI) and pnpm 8.6.1 (pinned in `package.json`). From the
repository root, install and validate code or command changes:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

`typecheck` checks CommonJS maintenance code; `build` copies the supported lists
and builds the ES module package with its own configuration and declaration check.
There is no automated test suite.

### Choose the release version

Compare the proposed lists with the last released lists and use the highest
applicable bump across the default and extended lists:

| Change | Bump | Example from `5.48.0` |
| --- | --- | --- |
| Remove a token, or change its address or chain ID | Major | `6.0.0` |
| Add tokens without removing any | Minor | `5.49.0` |
| Change existing token metadata, such as name, symbol, decimals or `logoURI`, without additions or removals | Patch | `5.48.1` |

These follow the [Token Lists versioning rules](https://github.com/Uniswap/token-lists#semantic-versioning).
Reset lower components on major/minor bumps. For mixed changes, major takes
precedence over minor, then patch. If there are no list changes, no list-version
bump is needed.

Set the chosen version in both `package.json` and
`packages/tokenlist/package.json`. CMS fetching embeds the root version in the
unordered list; ordering and filtering preserve it. If you choose a different
version after generating the lists, synchronize both manifests and the three root
list JSON `version` fields, then copy to docs and build again. This avoids
refetching over manual icon edits.

### Update the token lists

The CMS is the source for routine updates. Set the same release version in
`package.json` and `packages/tokenlist/package.json` before fetching; `1.fetch:cms`
reads the root version. Follow the steps below in order, including the manual icon
step between fetching and ordering, then build the package:

| Command | Input and effect |
| --- | --- |
| `pnpm run 1.fetch:cms` | Reads the live CMS, applies repository overrides and active-network filtering, validates the schema, and overwrites `superfluid.extended.tokenlist.unordered.json`. |
| Manual: add icons for new tokens | Edit `superfluid.extended.tokenlist.unordered.json` to add `logoURI` values for new tokens. Add any new icon files to `docs/icons/` and reference their public URLs. Complete this before ordering the list. |
| `pnpm run 2.order:tokenlist` | Reads the unordered list and writes `superfluid.extended.tokenlist.json`, preserving chain-group order and sorting each chain by descending `orderingScore`. |
| `pnpm run 3.filter:mainnet` | Reads the extended list and writes `superfluid.tokenlist.json`, excluding `testnet` tokens and retaining required underlying tokens. |
| `pnpm run 4.copy:docs` | Copies the default and extended lists to local GitHub Pages assets in `docs/`. |
| `pnpm run build` | Builds the workspace package locally without publishing. |

Review the unordered, extended, default and `docs/` lists together. Icons are
maintained manually in `docs/icons/`; fetching does not download them. Fetching
again overwrites the unordered list, so recheck manual icon edits after a refetch.
`3.filter:mainnet` checks schema, underlying-token presence and duplicates per chain,
but logs validation failures without a failing exit status, so inspect its output.

### Compare lists

```sh
pnpm run diff:lists superfluid.extended.tokenlist.json superfluid.extended.tokenlist.unordered.json
pnpm run diff:lists --ignoreExtensions superfluid.extended.tokenlist.json superfluid.extended.tokenlist.unordered.json
```

Both paths are required and relative to the repository root. Reports go to ignored
`diff-output/` JSON files. `--ignoreExtensions` suppresses changes whose only changed
field is `extensions`; additions and removals remain. List versions and timestamps
are not compared.

### Occasional maintenance and publishing

| Command | Purpose |
| --- | --- |
| `pnpm run codegen:subgraph` | Regenerates committed `subgraph/.graphclient/` from its query/configuration, contacting the configured subgraph. |

The manually dispatched [release workflow](.github/workflows/npm-publish.yml)
installs with the frozen lockfile, builds the workspace package, and publishes to
NPM through trusted publishing. NPM publishing writes externally and is not a
validation check.
