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
# `actions/setup-node`'s `registry-url` input would write a
# `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}` line to the npmrc
# even when `NODE_AUTH_TOKEN` is never set, which is why
# .github/workflows/release.yml omits it entirely (see AGENTS.md). As a
# defensive fallback in case this script is ever run in an environment where
# that placeholder line does exist without a real token (e.g. a stray
# npmrc), strip it here so npm attempts OIDC trusted publishing instead of
# sending an empty token; leave it alone if a real token is configured.
# See https://github.com/actions/setup-node/issues/1551.
#
# Trusted publishing via OIDC requires the package to be registered with a
# matching trusted publisher on npmjs.com - an account-side setting this
# script cannot configure, see https://docs.npmjs.com/trusted-publishers and
# AGENTS.md's "Setting up npm Trusted Publishing" section.
set -euo pipefail

npmrc="${NPM_CONFIG_USERCONFIG:-$HOME/.npmrc}"
if [ -f "$npmrc" ] && [ -z "${NODE_AUTH_TOKEN:-}" ]; then
  sed -i.bak '/^\/\/registry\.npmjs\.org\/:_authToken=/d' "$npmrc"
  rm -f "$npmrc.bak"
fi

tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

pnpm pack --pack-destination "$tmp_dir"
# `--loglevel verbose` so CI logs include the reason for any OIDC exchange
# failure, instead of just an opaque auth error.
npm publish "$tmp_dir"/*.tgz --access public --loglevel verbose
