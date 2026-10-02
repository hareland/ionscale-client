# Publishing packages to npm

This document describes how publishing the `ionscale-client` to npm is set up, how to trigger a
release, and how to add a new package to the list of things that can be released.

## What gets published

- a `version`, `license` (`MIT`) and `repository` (pointing at this repo, with a `directory` field) in its
  `package.json`
- a `LICENSE` file (copied from the repo root) and a `README.md`, both of which npm always includes in the published
  tarball so they show up on the npmjs.com package page
- a `build` script (all six packages, using [unbuild](https://github.com/unjs/unbuild)) that produces `dist/`
  (`.mjs`/`.cjs`/`.d.mts`/`.d.cts`)
- `"publishConfig": { "access": "public", ... }`, required because these are scoped (`@scrape-admin/*`) packages
- a `"files"` allowlist so only the public, built artifacts are published - never `tests/`, source maps for internal
  use, or anything else not explicitly listed: `["dist", "LICENSE"]`

### Dual-mode `main`/`exports`: live TypeScript locally, built `dist/` when published

All six publishable packages are consumed inside the monorepo (by `apps/web`, `apps/coordinator`, other
`packages/**`, etc.) via the `workspace:*` protocol, which resolves straight to each package's own `package.json` -
there is no separate "workspace" vs "published" package.json. To get fast dev/HMR on live TypeScript sources locally
while still shipping proper `mjs`/`cjs`/`d.ts` output to npm, every publishable package relies on npm/pnpm's
`publishConfig` field overrides:

- the top-level `"main"`/`"exports"` point at `./src/index.ts` - this is what local workspace consumers (e.g.
  `apps/coordinator`) resolve, so they always get live TypeScript, no build step required on every change
- `"publishConfig"` sets its own `"main"`/`"exports"` pointing at the built `./dist/*` files - `pnpm pack` (used by
  [`scripts/npm-publish.sh`](../scripts/npm-publish.sh)) merges `publishConfig` over the top-level fields *only* in
  the packed tarball's `package.json`, so the published package resolves to `dist`, never `src`
- the package's own `build` script (`unbuild`, run via the `after:bump` release-it hook) still has to produce that
  `dist/` output before packing - see "How releasing works" below

## How releasing works

Releasing is manual and independent per package: a maintainer triggers the
[`release` workflow](../.github/workflows/release.yml) from the Actions tab, picking **which package** to release
and **what kind of version bump** (patch/minor/major/pre-release) to apply. There is no "release everything that
changed" automation - each package is versioned and tagged on its own (tags look like `schema@1.2.3`,
`client@0.4.0`, etc.), so unrelated packages are never bumped together.

The workflow uses [release-it](https://github.com/release-it/release-it) (configured per-package via each package's
`.release-it.json`) to:

1. bump the `version` in that package's `package.json`
2. build it (`after:bump` hook runs `unbuild`, producing `dist/`)
3. commit the version bump, tag it (`<package-folder>@<version>`), and push
4. create a GitHub release for the tag
5. publish to npm (`after:release` hook, see below)

### Why `scripts/npm-publish.sh` instead of release-it's built-in npm plugin

Each package's `.release-it.json` disables release-it's built-in npm publish step (`"npm": { "publish": false }`)
and instead publishes via the `after:release` hook, which runs [`scripts/npm-publish.sh`](../scripts/npm-publish.sh).
That script:

1. runs `pnpm pack`, so any `workspace:*` dependencies (e.g. `coordinator-sdk` depending on `coordinator-schema`)
   are rewritten to real published version ranges in the packed tarball, the way `pnpm publish` would
2. publishes the resulting tarball with `npm publish`, not `pnpm publish`

The second step matters: publishing is done with the `npm` CLI specifically because npm's
[Trusted Publishing (OIDC)](https://docs.npmjs.com/trusted-publishers) support is what lets this workflow publish
without a long-lived `NPM_TOKEN` secret. `pnpm publish` does not implement OIDC trusted publishing yet (see
[pnpm/pnpm#9812](https://github.com/pnpm/pnpm/issues/9812)), so `pnpm pack` + `npm publish` is used instead.

## Setting up npm Trusted Publishing (one-time, per package)

This only needs to be done once per package, by someone with owner/admin access to the package on npmjs.com (after
its first manual `npm publish` - a trusted publisher can only be configured for a package that already exists on
the registry). Requires npm CLI v11.5.1+ / Node 22.14+, which the `release` workflow already uses (Node 24).

1. Go to the package's page on [npmjs.com](https://www.npmjs.com) → **Settings** → **Trusted Publisher**.
2. Add a new GitHub Actions trusted publisher with:
   - **Organization or user**: `hareland`
   - **Repository**: `scrape-admin-standalone`
   - **Workflow filename**: `release.yml`
   - **Environment**: leave empty, unless a dedicated GitHub Actions environment is introduced for releases later
3. Save. No npm token is required anywhere in this repo's CI configuration; `id-token: write` permission on the
   `release` job (already set in `release.yml`) is what lets GitHub mint the short-lived OIDC credential npm
   validates against the trusted publisher config.

If Trusted Publishing isn't configured yet for a package, `npm publish` in the workflow will fail with an
authentication error - fall back to publishing that first version manually from a maintainer's machine
(`npm publish --access public` from the package's directory, after building/packing it), then configure Trusted
Publishing for subsequent releases.

### Gotcha: avoid token configuration for Trusted Publishing

The release workflow intentionally omits `registry-url` from `actions/setup-node`: npm already defaults to
`https://registry.npmjs.org/`. Setting it creates an `.npmrc` with `_authToken=${NODE_AUTH_TOKEN}`, even with
`actions/setup-node@v7`. Without a token secret, this leaves an unresolved placeholder credential.

npm attempts the OIDC exchange first, but if it fails, it falls back to that placeholder and the publish can return
an opaque `404 Not Found` rather than `ENEEDAUTH`. Removing the placeholder does not replace the per-package
Trusted Publisher setup described above.

Both normal and recovery publishes use npm's `verbose` log level so the Actions logs include the OIDC exchange
failure reason. If authentication still fails, check the package's Trusted Publisher settings on npmjs.com against
the exact owner, repository, workflow filename and environment listed above. Those settings must be corrected
on npmjs.com by a package owner; a workflow change cannot grant npm publishing permission.

## Adding a new package to the release list

To make an existing or new `packages/**` package publishable:

1. Add `"version"`, `"license": "MIT"`, `"repository": { "type": "git", "url": "git+https://github.com/hareland/scrape-admin-standalone.git", "directory": "packages/<name>" }`
   to its `package.json`, and remove `"private": true` if present. Set the top-level `"main"`/`"exports"` to point
   at the package's `./src/*.ts` entry file(s) (live TypeScript, for in-repo `workspace:*` consumers), and add a
   `"publishConfig"` with `"access": "public"` plus its own `"main"`/`"exports"` pointing at the equivalent built
   `./dist/*` files - see "Dual-mode `main`/`exports`" above.
2. Add a `"build"` script (`unbuild` - copy an existing package's setup) and set `"files"` to `["dist", "LICENSE"]` -
   never publish `tests/`, `src/`, `node_modules`, etc.
3. Copy the repo root [`LICENSE`](../LICENSE) into the package directory, and add a `README.md` if it doesn't have
   one yet.
4. Copy an existing package's `.release-it.json` (e.g. [`packages/webhook/.release-it.json`](../packages/webhook/.release-it.json))
   into the new package's directory, updating the `git.tagName`, `git.commitMessage` and `github.releaseName`
   fields to use the new package's folder/npm name.
5. Add the package's folder name to the `package` input's `options` list in
   [`.github/workflows/release.yml`](../.github/workflows/release.yml). If it depends on another workspace package,
   double check that dependency is covered by the "Build package dependencies" step (it is, as long as the
   dependency is declared as a regular `dependencies` entry - that step builds the whole upstream dependency graph
   automatically via pnpm's `^...` filter selector).
6. Set up Trusted Publishing for the package on npmjs.com once it has been published for the first time (see above).

## Triggering a release

1. Go to **Actions → release → Run workflow** on GitHub.
2. Pick the `package` (folder name under `packages/`) and the `increment` (patch/minor/major/pre-release).
3. Run it. The workflow builds, tests, bumps the version, tags, pushes, creates a GitHub release, and publishes to
   npm for that package only - no other package is touched.
