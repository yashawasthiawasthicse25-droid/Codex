# Demo Government Portal

This is a separate simulated external system for ApprovalGuard demonstrations. It is not a real government service.

## Start

From this folder:

```powershell
npm install
npm start
```

The portal runs at `http://localhost:6060` and uses MongoDB database `fake_government`.

Start ApprovalGuard separately from `Backend`:

```powershell
npm start
```

ApprovalGuard runs at `http://localhost:5000`.

## Demo flow

1. Open ApprovalGuard Information Vault at `http://localhost:5000/information-vault.html`.
2. Review the loaded vault values, enter an approval, and submit through the demo portal.
3. Open `http://localhost:6000` and open the submitted application.
4. Use the manual status buttons to change `SUBMITTED` to `UNDER_SCRUTINY` or another status.
5. Wait for ApprovalGuard's configured polling interval, default 30 seconds, or refresh the Information Vault.
6. ApprovalGuard records the status change and creates an in-app/console notification.

Email and SMS delivery are optional adapters configured through the existing ApprovalGuard environment variables. The demo continues to work without external providers.
