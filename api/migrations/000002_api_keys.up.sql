-- 000002_api_keys — personal access tokens for programmatic clients.
--
-- A browser session is a 15 minute JWT plus a refresh token that lives in an
-- httpOnly cookie, which an external agent or CLI cannot hold. An API key is a
-- long lived bearer credential for exactly that case.
--
-- Only the SHA-256 hash is stored. The raw key is shown to its owner once, at
-- creation, and is unrecoverable afterwards: a database leak must not hand out
-- working credentials.

CREATE TABLE api_keys (
    id           uuid PRIMARY KEY,
    user_id      uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name         text NOT NULL,
    token_hash   text NOT NULL UNIQUE,
    created_at   timestamptz NOT NULL DEFAULT now(),
    last_used_at timestamptz,
    expires_at   timestamptz,
    revoked_at   timestamptz
);

CREATE INDEX api_keys_user_idx ON api_keys (user_id, created_at DESC);
CREATE INDEX api_keys_expiry_idx ON api_keys (expires_at) WHERE revoked_at IS NULL;
