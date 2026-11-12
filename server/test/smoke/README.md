# API smoke tests

End-to-end checks of auth, tenant isolation, billing, returns, shifts, reports and
super-admin against a running server and a **throwaway** database.

```bash
# 1. Seed the throwaway DB (drops and recreates `vendora_smoketest` only)
node test/smoke/seed.js > test/smoke/.ids.json

# 2. Start a server on that DB (separate terminal)
MONGO_URI=mongodb://localhost:27017/vendora_smoketest PORT=5055 \
PLATFORM_ADMIN_USERNAME=padmin PLATFORM_ADMIN_PASSWORD=ptest123 npm run start

# 3. Run the checks
node test/smoke/smoke.js "$(cat test/smoke/.ids.json)"
```

Re-seed before every run (the run changes stock, credit balances, a password and tenant status).

### Password reset checks

`smoke.js` also covers `POST /auth/forgot-password` and `POST /auth/reset-password`:

- the forgot-password response is identical for an unknown shop, an unknown user and a real user
  (no account enumeration), and only a SHA-256 hash + 30-minute expiry is stored on the user;
- a bad token, an expired token, a weak password and a reused token are rejected with 400;
- a valid token resets the password once, clears the token and the refresh token (other sessions are
  signed out), the old password stops working and the new one logs in.

The raw token is only ever emailed, so these checks connect to the same database with mongoose and plant
the hash of a token they generate. Start the server **without SMTP** (`SMTP_USER= SMTP_PASS=`) so no real
email is sent; the reset link is then written to the server log instead (never in production).

To run against a different throwaway database or port (the name must start with `vendora_smoketest`):

```bash
SMOKE_DB_NAME=vendora_smoketest_reset node test/smoke/seed.js > test/smoke/.ids.json
MONGO_URI=mongodb://localhost:27017/vendora_smoketest_reset PORT=5056 SMTP_USER= SMTP_PASS= PLATFORM_ADMIN_USERNAME=padmin PLATFORM_ADMIN_PASSWORD=ptest123 npm run start
SMOKE_API_URL=http://localhost:5056/api/v1 SMOKE_DB_NAME=vendora_smoketest_reset node test/smoke/smoke.js "$(cat test/smoke/.ids.json)"
```

Rate limits apply (forgot-password 5/min, reset-password 10/min, login 10/min), so wait a minute
between back-to-back runs against the same server.

## Registration flow (OTP -> credentials -> login -> password change -> dashboard data)

Start the test server **without SMTP** so the OTP and welcome credentials are written to the log
instead of being emailed, and capture the log:

```bash
MONGO_URI=mongodb://localhost:27017/vendora_smoketest PORT=5055 SMTP_USER= SMTP_PASS= npm run start > /tmp/flow.log
node test/smoke/registration-flow.js /tmp/flow.log
```
