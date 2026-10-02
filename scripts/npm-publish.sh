#!/usr/bin/env bash
# Publishes the package in the current working directory to npm.
#
# Uses `pnpm pack` (not `npm publish` directly) so that `workspace:*`
# dependencies are rewritten to the real published version ranges in the
# packed tarball. The resulting tarball is then published with the `npm`
# CLI, since `npm publish` is what supports npm's OIDC "trusted publishing"
# (pnpm does not implement it yet, see https://github.com/pnpm/pnpm/issues/9812).
#
# Intended to be run as a release-it `after:release` hook from within a
# package directory (cwd = packages/<name>), see packages/*/.release-it.json.
set -euo pipefail

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

pnpm pack --pack-destination "$tmp_dir"
npm publish "$tmp_dir"/*.tgz --access public --loglevel verbose
