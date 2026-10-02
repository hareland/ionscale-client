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
#
# `actions/setup-node`'s `registry-url` input always writes a
# `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}` line to the npmrc,
# even when `NODE_AUTH_TOKEN` is never set (this project never sets it, since
# it relies solely on OIDC trusted publishing). npm resolves the unset env
# var reference to an empty token, which makes it think token auth is
# configured (just missing a token) instead of falling back to OIDC, so
# `npm publish` fails with a misleading 404 instead of exchanging the job's
# OIDC token. Strip that `_authToken` entry here so npm actually attempts
# OIDC auth. See https://github.com/actions/setup-node/issues/1551.
set -euo pipefail

npmrc="${NPM_CONFIG_USERCONFIG:-$HOME/.npmrc}"
if [ -f "$npmrc" ]; then
  sed -i.bak '/^\/\/registry\.npmjs\.org\/:_authToken=/d' "$npmrc"
  rm -f "$npmrc.bak"
fi

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

pnpm pack --pack-destination "$tmp_dir"
npm publish "$tmp_dir"/*.tgz --access public
