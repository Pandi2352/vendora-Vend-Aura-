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

Re-seed before every run (the run changes stock, credit balances and tenant status).

## Registration flow (OTP -> credentials -> login -> password change -> dashboard data)

Start the test server **without SMTP** so the OTP and welcome credentials are written to the log
instead of being emailed, and capture the log:

```bash
MONGO_URI=mongodb://localhost:27017/vendora_smoketest PORT=5055 SMTP_USER= SMTP_PASS= npm run start > /tmp/flow.log
node test/smoke/registration-flow.js /tmp/flow.log
```
