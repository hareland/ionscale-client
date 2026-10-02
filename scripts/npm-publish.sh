#!/usr/bin/env bash
# Publishes the package in the current working directory to npm.
#
# Uses `pnpm pack` to build the tarball (which runs the `prepack` script,
# building `dist/*` before packing) and then publishes that tarball with the
# `npm` CLI, since `npm publish` is what supports npm's OIDC "trusted
# publishing" (pnpm does not implement it yet, see
# https://github.com/pnpm/pnpm/issues/9812).
#
# Intended to be run as a release-it `after:release` hook (see
# .release-it.json), and also used directly by the `publish` job in
# .github/workflows/release.yml to resume publishing an already-tagged
# release.
set -euo pipefail

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

pnpm pack --pack-destination "$tmp_dir"
npm publish "$tmp_dir"/*.tgz --access public
