import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" })
    }
  }, [isAuthenticated, navigate])

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Service Marketplace
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        <Button
          className="w-full"
          disabled={isLoading}
          onClick={() => login?.()}
        >
          {isLoading ? "Connecting..." : "Sign In with XION"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Supports email, Google, Keplr, and MetaMask.
          <br />
          Powered by <span className="font-medium text-foreground">XION</span>{" "}
          — gasless, keyless transactions.
        </p>
      </div>
    </main>
  )
}
