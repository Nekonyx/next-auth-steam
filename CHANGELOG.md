Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- CHANGELOG.md is created.
- [Biome](https://biomejs.dev/) is used for linting and formatting.
- [.nvmrc](https://biomejs.dev/) file is created for keeping Node version in mind.
- All methods related to OpenID are moved to `utils/openid.ts`.
- `claimIdentity` method is created and called instead of `verifyAssertion` for better refactoring and more accurate naming.

### Changed

- License changed from WTFPL to Unlicense.
- README file is rewritten and updated.
- Examples are rewritten and updated.
- `verifyAssertion` method moved to `utils/openid.ts`.
- `verifyAssertion` now returns only a string and throws a `Claimed identity is invalid` error instead of returning `null`.
- Constant variables in `verifyAssertion` extracted to global scope to avoid re-creation on each call.
- `PROVIDER_ID`, `PROVIDER_NAME`, `EMAIL_DOMAIN`, `AUTHORIZATION_URL`, and `LOGO_URL` renamed with `STEAM_` prefix.
- Error message when no secret is passed to the provider slightly changed.
- `callbackUrl` property is no longer required. If not provided, the default value from `process.env.NEXTAUTH_URL` is used.
- Lockfile version upgraded from 6 to 9.
- `steam-icon-light.svg` renamed to `steam-icon.svg`.
- `SteamProfile` interface moved to `steam.ts` and is now extendable, as the `Steam` method is generic.
- Next.js 15 added as a peer dependency, supporting Next.js v13, v14, and v15.
- TypeScript updated to `^5.4.3`.

### Removed

- `types.ts` file removed.
