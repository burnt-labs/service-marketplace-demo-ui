import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion"

export const abstraxionConfig = {
  treasury: import.meta.env.VITE_ABSTRAXION_TREASURY_CONTRACT as string,
  rpcUrl: import.meta.env.VITE_XION_RPC_URL as string,
  restUrl: import.meta.env.VITE_XION_REST_URL as string,
  chainId: (import.meta.env.VITE_XION_CHAIN_ID as string) ?? "xion-testnet-2",
  // Opens XION's auth UI in a popup instead of navigating the page away.
  // The user picks their login method (email, Google, Keplr, MetaMask) inside that popup.
  authentication: { type: "popup" as const },
}

export { useAbstraxionAccount, useAbstraxionSigningClient }
