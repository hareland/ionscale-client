# Publishing `ionscale-client` to npm

This document describes how publishing `ionscale-client` to npm is set up and how to trigger a release.

This is a single, standalone package (not a monorepo) - there are no other workspace packages that consume it via
the `workspace:*` protocol, so `package.json`'s `"main"`/`"types"`/`"exports"` point unconditionally at the built
`./dist/*` files produced by the `build` script. Do **not** reintroduce a "dual-mode" setup (top-level fields
pointing at `./src/index.ts` with a `publishConfig` override pointing at `dist/`) - that pattern only makes sense
for monorepos where sibling packages need live TypeScript via `workspace:*`, and here it silently breaks any
install that doesn't go through a full `pnpm pack`/`npm publish` (e.g. a git dependency, `npm link`, or a local
`file:`/`link:` install), because `publishConfig` overrides are only merged into `package.json` at pack/publish
time.

## What gets published

- a `version`, `license` (`MIT`) and `repository` in `package.json`
- a `LICENSE` file (copied from the repo root) and a `README.md`, both of which npm always includes in the
  published tarball so they show up on the npmjs.com package page
- a `build` script (using [unbuild](https://github.com/unjs/unbuild)) that produces `dist/`
  (`.mjs`/`.cjs`/`.d.mts`/`.d.cts`/`.d.ts`)
- a `"files"` allowlist so only the public, built artifacts are published - never `tests/`, `src/`, or anything
  else not explicitly listed: `["dist", "README.md", "LICENSE"]`

## How releasing works

Releasing is manual, triggered by a maintainer from the [`release` workflow](../.github/workflows/release.yml) in
the Actions tab, picking **what kind of version bump** (patch/minor/major/pre-release) to apply.

The workflow uses [release-it](https://github.com/release-it/release-it) (configured via
[`.release-it.json`](../.release-it.json)) to:

1. bump the `version` in `package.json`
2. build it (`after:bump` hook runs `pnpm run build`, producing `dist/`)
3. commit the version bump, tag it (`ionscale-client<version>`), and push
4. create a GitHub release for the tag
5. publish to npm (`after:release` hook, see below)

### Why `scripts/npm-publish.sh` instead of release-it's built-in npm plugin

`.release-it.json` disables release-it's built-in npm publish step (`"npm": { "publish": false }`) and instead
publishes via the `after:release` hook, which runs [`scripts/npm-publish.sh`](../scripts/npm-publish.sh). That
script:

1. runs `pnpm pack`, so the tarball's `package.json` reflects exactly what will be installed by consumers
2. publishes the resulting tarball with `npm publish`, not `pnpm publish`

The second step matters: publishing is done with the `npm` CLI specifically because npm's
[Trusted Publishing (OIDC)](https://docs.npmjs.com/trusted-publishers) support is what lets this workflow publish
without a long-lived `NPM_TOKEN` secret. `pnpm publish` does not implement OIDC trusted publishing yet (see
[pnpm/pnpm#9812](https://github.com/pnpm/pnpm/issues/9812)), so `pnpm pack` + `npm publish` is used instead.

## Setting up npm Trusted Publishing (one-time)

This only needs to be done once, by someone with owner/admin access to the package on npmjs.com (after its first
manual `npm publish` - a trusted publisher can only be configured for a package that already exists on the
registry). Requires npm CLI v11.5.1+ / Node 22.14+, which the `release` workflow already uses (Node 24).

1. Go to the package's page on [npmjs.com](https://www.npmjs.com) → **Settings** → **Trusted Publisher**.
2. Add a new GitHub Actions trusted publisher with:
   - **Organization or user**: `hareland`
   - **Repository**: `ionscale-client`
   - **Workflow filename**: `release.yml`
   - **Environment**: leave empty, unless a dedicated GitHub Actions environment is introduced for releases later
3. Save. No npm token is required anywhere in this repo's CI configuration; `id-token: write` permission on the
   `release` job (already set in `release.yml`) is what lets GitHub mint the short-lived OIDC credential npm
   validates against the trusted publisher config.

If Trusted Publishing isn't configured yet, `npm publish` in the workflow will fail with an authentication error -
fall back to publishing that first version manually from a maintainer's machine (`npm publish --access public`
from the repo root, after building/packing it), then configure Trusted Publishing for subsequent releases.

### Gotcha: avoid token configuration for Trusted Publishing

The release workflow intentionally omits `registry-url` from `actions/setup-node`: npm already defaults to
`https://registry.npmjs.org/`. Setting it creates an `.npmrc` with `_authToken=${NODE_AUTH_TOKEN}`, even with
`actions/setup-node@v7`. Without a token secret, this leaves an unresolved placeholder credential.

npm attempts the OIDC exchange first, but if it fails, it falls back to that placeholder and the publish can return
an opaque `404 Not Found` rather than `ENEEDAUTH`. Removing the placeholder does not replace the Trusted Publisher
setup described above.

Both normal and recovery publishes use npm's `verbose` log level so the Actions logs include the OIDC exchange
failure reason. If authentication still fails, check the package's Trusted Publisher settings on npmjs.com against
the exact owner, repository, workflow filename and environment listed above. Those settings must be corrected on
npmjs.com by a package owner; a workflow change cannot grant npm publishing permission.

## Triggering a release

1. Go to **Actions → release → Run workflow** on GitHub.
2. Pick the `increment` (patch/minor/major/pre-release).
3. Run it. The workflow builds, tests, bumps the version, tags, pushes, creates a GitHub release, and publishes to
   npm.
