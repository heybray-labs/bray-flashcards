# Authentication

This app uses `@heybray/identity` for authentication — the same three-mode model as
Scenarios (local, OIDC, SAML). Configuration is via environment variables; there is no
app-specific auth code beyond wiring the platform router.

## Supported modes

| Mode | `AUTH_PROTOCOL` | Status in this repo |
|------|-----------------|---------------------|
| Local (email + password) | `local` (default) | **Wired and tested** |
| OIDC / SSO | `oidc` | Reachable via env vars; not exercised in CI |
| SAML / SSO | `saml` | Reachable via env vars; not exercised in CI |

Only one SSO protocol can be active per deployment.

## Environment variables

Copy `.env.example` to `.env`. Minimum for local development:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Session token signing secret |
| `APP_URL` | Recommended | Public SPA URL (default dev: `http://localhost:5175`) |
| `AUTH_PROTOCOL` | No | `local`, `oidc`, or `saml` (default `local`) |

**Local auth:** there is **no** `ADMIN_EMAIL` / `ADMIN_PASSWORD` seeding in this repo.
Create the first administrator via the **first-run setup UI** at `/login` after
`npm run db:init`.

**OIDC** (when `AUTH_PROTOCOL=oidc`): `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`,
`OIDC_ISSUER_URL`, plus optional `OIDC_PROVIDER_NAME`, `OIDC_SCOPES`,
`OIDC_REDIRECT_URI`.

**SAML** (when `AUTH_PROTOCOL=saml`): `SAML_IDP_METADATA`, plus optional
`SAML_PROVIDER_NAME`, `SAML_SP_ENTITY_ID`, `SAML_ACS_URL`, `SAML_SP_CERT_DIR`.

See `heybray-labs/bray-scenarios` `docs/AUTHENTICATION.md` for full IdP setup guides
(Okta, Entra ID, Google Workspace SAML) — the mechanism is identical; substitute this
app's ports (`5175` / `3102`) and URLs.

## Docker note

`docker-compose.yml` mounts a `saml_certs` volume for SP certificate storage when SAML is
enabled. The volume exists by default; SAML is not pre-configured.

## Testing

CI and `bin/test.sh` force `AUTH_PROTOCOL=local` with a fixed test `JWT_SECRET`. OIDC/SAML
routes are not covered by the API smoke suite.
