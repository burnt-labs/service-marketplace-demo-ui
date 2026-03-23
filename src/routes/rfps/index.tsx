import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { listAsks } from "@/lib/contract"
import { CreateAskModal } from "@/components/ask/create-ask-modal"
import { cn } from "@/lib/utils"
import type { AskStatus } from "@/lib/contract"

export const Route = createFileRoute("/rfps/")({
  component: RfpsPage,
})

const STATUS_STYLES: Record<AskStatus, string> = {
  open: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
  work_submitted: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  completed: "bg-muted text-muted-foreground ring-1 ring-border",
  cancelled: "bg-muted text-muted-foreground ring-1 ring-border",
}

const STATUS_LABEL: Record<AskStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  work_submitted: "Work Submitted",
  completed: "Completed",
  cancelled: "Cancelled",
}

function formatAmount(amount: string, denom: string) {
  if (denom === "uxion") {
    return `${(Number(amount) / 1_000_000).toLocaleString()} XION`
  }
  return `${Number(amount).toLocaleString()} ${denom}`
}

function RfpsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["asks"],
    queryFn: () => listAsks(),
  })

  const asks = data ?? []
  const openCount = asks.filter((r) => r.ask.status === "open").length

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Requests for Proposal</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse open work and submit your bid
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <span className="text-sm text-muted-foreground">
              {openCount} open
            </span>
          )}
          <CreateAskModal onCreated={() => refetch()} />
        </div>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-border px-5 py-5 last:border-0">
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          Failed to load asks: {error.message}
        </div>
      )}

      {!isLoading && !error && asks.length === 0 && (
        <div className="rounded-lg border border-border px-5 py-12 text-center text-sm text-muted-foreground">
          No asks yet. Be the first to post one.
        </div>
      )}

      {!isLoading && asks.length > 0 && (
        <div className="rounded-lg border border-border">
          {asks.map(({ ask }) => (
            <Link
              key={ask.id}
              to="/rfps/$rfpId"
              params={{ rfpId: ask.id }}
              className="group flex items-center justify-between gap-4 border-b border-border px-5 py-5 transition-colors last:border-0 hover:bg-muted/30"
            >
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      STATUS_STYLES[ask.status],
                    )}
                  >
                    {STATUS_LABEL[ask.status]}
                  </span>
                </div>
                <p className="font-mono text-sm text-foreground">
                  {ask.id}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {ask.creator.slice(0, 12)}…{ask.creator.slice(-6)}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="font-semibold tabular-nums">
                  {formatAmount(ask.budget.amount, ask.budget.denom)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
