# Authentication

## Overview

Authentication is handled by the **[Abstraxion SDK](https://github.com/burnt-labs/abstraxion)** (`@burnt-labs/abstraxion`) from Burnt Labs — the same team behind the XION blockchain. All user accounts are **XION Meta Accounts**: smart contract accounts (SCAs) that live on-chain and support multiple login methods simultaneously.

This means users never manage private keys or seed phrases. Login is handled like a web2 app (email, Google, wallet), and all transactions are **gasless** via a Treasury contract — users never need to hold tokens to interact with the app.

---

## Login Methods

Users can sign in with any of the following:

| Method | Provider |
|---|---|
| Email / Passkey | XION's hosted auth server |
| Google | OAuth via XION's hosted auth server |
| Keplr | Cosmos browser wallet extension |
| MetaMask | EVM browser wallet extension |

All methods produce the same result: a XION Meta Account address (e.g. `xion1abc...`) and a signing client the app can use to submit transactions.

---

## How It Works

### 1. Provider Setup

`AbstraxionProvider` wraps the entire app in `src/routes/__root.tsx`. It holds the session state and connects to the XION testnet RPC. Configuration comes from environment variables:

```
VITE_ABSTRAXION_TREASURY_CONTRACT  — treasury contract that pays gas fees
VITE_XION_RPC_URL                  — XION chain RPC endpoint
VITE_XION_REST_URL                 — XION chain REST endpoint
VITE_XION_CHAIN_ID                 — xion-testnet-2
```

### 2. Login Flow

When a user clicks a login button on `/login`, Abstraxion redirects them to XION's hosted auth server. After the user authenticates (email link, Google OAuth, or wallet connect), they are redirected back to the app. The SDK stores the session locally (IndexedDB/localStorage) and marks the user as connected.

```
User clicks "Sign In"
  → Abstraxion redirects to XION auth server
  → User authenticates (email / Google / wallet)
  → Redirect back to app with ?granted=true
  → SDK resolves session → isConnected = true
  → useEffect in LoginPage detects auth → navigates to /
```

### 3. Session State

All components access auth state through a single hook:

```ts
import { useAuth } from "@/hooks/use-auth"

const { isAuthenticated, address, isLoading, login, logout, signingClient } = useAuth()
```

| Field | Type | Description |
|---|---|---|
| `isAuthenticated` | `boolean` | Whether the user is signed in |
| `address` | `string \| null` | XION bech32 address (`xion1...`) |
| `isLoading` | `boolean` | True while the SDK is resolving the session |
| `login` | `() => void` | Triggers the Abstraxion auth redirect |
| `logout` | `() => void` | Clears the local session |
| `signingClient` | `SigningCosmWasmClient \| null` | CosmWasm client for submitting transactions |

### 4. Route Protection

Protected routes live under `src/routes/_authenticated/`. The `_authenticated.tsx` layout route uses TanStack Router's `beforeLoad` to redirect unauthenticated users to `/login`:

```
/dashboard   →  _authenticated/dashboard.tsx  →  requires login
/login       →  login.tsx                      →  public (redirects away if already logged in)
/            →  index.tsx                      →  public
```

To add a new protected route, create a file at `src/routes/_authenticated/your-route.tsx`.

---

## Key Files

```
src/
├── lib/auth.ts                          # Abstraxion config + hook re-exports
├── hooks/use-auth.ts                    # useAuth() wrapper used by all components
├── routes/
│   ├── __root.tsx                       # AbstraxionProvider lives here
│   ├── login.tsx                        # Custom branded login page
│   ├── _authenticated.tsx               # Route guard layout
│   └── _authenticated/
│       └── dashboard.tsx                # Example protected route
└── components/
    └── layout/
        └── navbar.tsx                   # Auth state in the global header
```

---

## Gasless Transactions

The Treasury contract (configured via `VITE_ABSTRAXION_TREASURY_CONTRACT`) pays gas fees on behalf of users via two mechanisms:

- **Fee Grants** — Treasury covers the XION gas cost for allowed transaction types
- **Authz** — Users grant the Treasury permission to submit specific messages on their behalf

This means users can interact with the marketplace without ever needing to hold XION tokens. The Treasury is configured in the [XION Developer Portal](https://dev.burnt.com).

---

## Network

Currently targeting **XION Testnet (`xion-testnet-2`)**.

| | Testnet |
|---|---|
| Chain ID | `xion-testnet-2` |
| RPC | `https://rpc.xion-testnet-2.burnt.com:443` |
| REST | `https://api.xion-testnet-2.burnt.com` |
| Explorer | https://explorer.burnt.com/xion-testnet-2 |
