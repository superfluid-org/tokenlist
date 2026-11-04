# Superfluid Token List Management

This repository manages the Superfluid token lists, fetching listed tokens from the CMS and generating default and extended lists.

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

To propose adding or updating a token, follow the steps below:

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
   - Users and token owners can propose corrections to listed token details through a pull request.

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

### Update the token lists

The CMS is the source for routine updates. Before fetching or editing, save both
last released lists outside the repository. Start from the last released data;
if your checkout already contains proposed changes, recover the lists from the
release commit instead of copying those proposed files as the baseline.

```sh
TOKENLIST_BASELINE_DIR=$(mktemp -d)
cp superfluid.tokenlist.json "$TOKENLIST_BASELINE_DIR/released-default.json"
cp superfluid.extended.tokenlist.json "$TOKENLIST_BASELINE_DIR/released-extended.json"
```

Keep this directory and shell variable through review. Baselines are local review
inputs, never tracked repository files. Fetching overwrites the unordered list;
ordering and filtering then overwrite the extended and default lists.

| Step | Input and effect |
| --- | --- |
| `pnpm run 1.fetch:cms` | Reads the live CMS, applies repository overrides and active-network filtering, validates the schema, and overwrites `superfluid.extended.tokenlist.unordered.json`. Its version initially comes from root `package.json`. |
| Manual: restore and add icons | In the unordered list, match tokens to the released extended baseline by chain ID and address (case insensitive). When CMS lacks a previously supplied `logoURI`, recover and reapply it from that baseline. Also add icons for new tokens, placing new files in `docs/icons/` and referencing their public URLs. Check retained icons on every update before ordering. |
| `pnpm run 2.order:tokenlist` | Reads the unordered list and writes `superfluid.extended.tokenlist.json`, preserving chain-group order and sorting each chain by descending `orderingScore`. |
| `pnpm run 3.filter:mainnet` | Reads the extended list and writes `superfluid.tokenlist.json`, excluding `testnet` tokens and retaining required underlying tokens. Inspect output: validation failures are logged without a failing exit status. |
| Manual: review and finalize version | Compare both proposed lists against the saved release baselines as below, including raw metadata diffs. Choose the highest appropriate release bump and synchronize versions before copying or building. |
| `pnpm run 4.copy:docs` | Copies the finalized default and extended lists to local GitHub Pages assets in `docs/`. |
| `pnpm run build` | Builds and checks the workspace package locally without publishing. |

Review the unordered, extended, default and `docs/` lists together. Fetching does
not download icon files. A refetch overwrites manual `logoURI` edits, so repeat
the icon recovery and review if one is necessary. Finalize versions locally
without refetching over those edits.

### Compare against the release baseline

The first argument is the released baseline; the second is the proposed list.
After ordering and filtering, run both comparisons in the same shell used above:

```sh
pnpm run diff:lists "$TOKENLIST_BASELINE_DIR/released-default.json" superfluid.tokenlist.json
pnpm run diff:lists "$TOKENLIST_BASELINE_DIR/released-extended.json" superfluid.extended.tokenlist.json
```

Both paths are required; relative paths resolve from the repository root and
absolute paths are accepted. Reports go to ignored `diff-output/` JSON files.
The command compares token entries, not list versions or timestamps.

`diff:lists` is only an aid. Its underlying library can miss removed metadata
fields, including `logoURI`, and report unchanged `extensions` as changed.
`--ignoreExtensions` suppresses extension-only reports but may also hide removed
logos when those reports are the only indication of a change. Always inspect raw
JSON/Git diffs for metadata review and version decisions, including retained
icons, rather than relying on this report or its optional flag alone:

```sh
git diff --no-index -- "$TOKENLIST_BASELINE_DIR/released-default.json" superfluid.tokenlist.json
git diff --no-index -- "$TOKENLIST_BASELINE_DIR/released-extended.json" superfluid.extended.tokenlist.json
```

`git diff --no-index` returns exit code 1 when files differ. Also inspect the
repository's `git diff` before submitting the update.

### Finalize the release version

After reviewing proposed changes against both released lists, use the highest
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
`packages/tokenlist/package.json`, and set the corresponding `version` object
in all three root list JSON files (unordered, extended and default). The initial
CMS version is provisional until this review. Edit these version fields locally,
then run `4.copy:docs` and `build`; there is no need to fetch again or lose manual
icons. Confirm manifests, root lists and copied lists all use the chosen version.

### Publishing

The manually dispatched [release workflow](.github/workflows/npm-publish.yml)
installs with the frozen lockfile, builds the workspace package, and publishes to
NPM through trusted publishing. NPM publishing writes externally and is not a
validation check.
