import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@/lib/auth"

export function useAuth() {
  const {
    data: account,
    isConnected,
    isConnecting,
    login,
    logout,
  } = useAbstraxionAccount()
  const { client: signingClient } = useAbstraxionSigningClient()

  return {
    account,
    address: account?.bech32Address ?? null,
    isAuthenticated: isConnected,
    isLoading: isConnecting,
    login,
    logout,
    signingClient,
  }
}
