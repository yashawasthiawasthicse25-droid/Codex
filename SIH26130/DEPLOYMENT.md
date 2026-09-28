# Deployment

Deploy the two services separately.

## ApprovalGuard

Backend environment variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
FAKE_GOVERNMENT_PORTAL_URL=https://your-demo-portal.example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=your-gmail-address@gmail.com
APPROVAL_POLL_INTERVAL_MS=30000
```

Set the deployed fake portal URL in `frontend/html/JS/runtime-config.js`:

```js
window.DEMO_PORTAL_URL = "https://your-demo-portal.example.com";
```

The ApprovalGuard frontend is served by its backend, so `APPROVAL_GUARD_URL` defaults to the current site origin.

## Fake Government Portal

Backend environment variables:

```env
PORT=6060
MONGO_URI=mongodb+srv://...
```

Set the deployed ApprovalGuard URL in `fake-government-portal/frontend/runtime-config.js`:

```js
window.APPROVAL_GUARD_URL = "https://your-approvalguard.example.com";
```

Use HTTPS for both deployed services and configure CORS/reverse-proxy rules to allow browser requests between the two domains.

Never commit `.env` files or Gmail, Twilio, or database credentials.
