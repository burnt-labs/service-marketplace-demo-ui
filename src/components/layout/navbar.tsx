import { Link } from "@tanstack/react-router"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { isAuthenticated, isLoading, address, logout } = useAuth()

  const shortAddress = address
    ? `${address.slice(0, 8)}...${address.slice(-4)}`
    : null

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/rfps" className="font-semibold text-foreground">
          Service Marketplace
        </Link>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <Button variant="outline" size="sm" disabled>
              Connecting...
            </Button>
          ) : isAuthenticated && shortAddress ? (
            <>
              <span className="font-mono text-sm text-muted-foreground">
                {shortAddress}
              </span>
              <Button variant="outline" size="sm" onClick={() => logout?.()}>
                Disconnect
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
