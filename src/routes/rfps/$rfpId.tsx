import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Dialog } from "@base-ui/react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  CONTRACT_ADDRESS,
  getAsk,
  listBidsByAsk,
  fetchAskMetadata,
  msg,
  type AskStatus,
} from "@/lib/contract"
import { cn } from "@/lib/utils"
import type { GranteeSignerClient } from "@burnt-labs/abstraxion-react"

export const Route = createFileRoute("/rfps/$rfpId")({
  component: RfpDetailPage,
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

type BidStatus = "idle" | "submitting" | "success" | "error"

function RfpDetailPage() {
  const { rfpId } = Route.useParams()
  const { isAuthenticated, login, address, signingClient } = useAuth()

  const { data: askData, isLoading: askLoading, error: askError } = useQuery({
    queryKey: ["ask", rfpId],
    queryFn: async () => {
      const result = await getAsk(rfpId)
      const metadata = await fetchAskMetadata(result.ask.metadata_url)
      return { ...result, metadata }
    },
  })

  const { data: bidsData, isLoading: bidsLoading, refetch: refetchBids } = useQuery({
    queryKey: ["bids", rfpId],
    queryFn: () => listBidsByAsk(rfpId),
    enabled: !!askData,
  })

  const [bidAmount, setBidAmount] = useState("")
  const [bidDenom, setBidDenom] = useState("uxion")
  const [bidStatus, setBidStatus] = useState<BidStatus>("idle")
  const [bidError, setBidError] = useState("")
  type ConfirmBid = { id: string; price: { amount: string; denom: string }; recipient: string }
  const [confirmBid, setConfirmBid] = useState<ConfirmBid | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState("")

  async function handleAcceptConfirmed() {
    if (!signingClient || !address || !confirmBid) return
    setAccepting(true)
    setAcceptError("")
    try {
      await (signingClient as unknown as GranteeSignerClient).execute(
        address,
        CONTRACT_ADDRESS,
        msg.selectBid(rfpId, confirmBid.id, confirmBid.price),
        "auto",
        undefined,
        [{ amount: confirmBid.price.amount, denom: confirmBid.price.denom }],
      )
      setConfirmBid(null)
      refetchBids()
    } catch (err) {
      setAcceptError(err instanceof Error ? err.message : "Transaction failed")
    } finally {
      setAccepting(false)
    }
  }

  async function handleSubmitBid(e: React.FormEvent) {
    e.preventDefault()
    if (!signingClient || !address) return

    setBidStatus("submitting")
    setBidError("")

    try {
      await (signingClient as unknown as GranteeSignerClient).execute(
        address,
        CONTRACT_ADDRESS,
        msg.submitBid(rfpId, { amount: String(Math.round(Number(bidAmount) * 1_000_000)), denom: bidDenom }),
        "auto",
      )
      setBidStatus("success")
      refetchBids()
    } catch (err) {
      setBidStatus("error")
      setBidError(err instanceof Error ? err.message : "Transaction failed")
    }
  }

  if (askLoading) {
    return (
      <div className="py-8 space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (askError || !askData) {
    return (
      <div className="py-8">
        <p className="text-sm text-destructive">
          {askError?.message ?? "Ask not found"}
        </p>
      </div>
    )
  }

  const { ask, metadata } = askData
  const bids = bidsData ?? []

  return (
    <div className="py-8">
      {/* Accept bid confirmation dialog */}
      <Dialog.Root
        open={confirmBid !== null}
        onOpenChange={(open) => { if (!open) { setConfirmBid(null); setAcceptError("") } }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl">
            <Dialog.Title className="text-base font-semibold">Accept bid?</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              This will lock funds in escrow and assign the work to the provider.
            </Dialog.Description>

            {confirmBid && (
              <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold tabular-nums">
                    {formatAmount(confirmBid.price.amount, confirmBid.price.denom)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Payment recipient</span>
                  <span className="font-mono text-xs">
                    {confirmBid.recipient.slice(0, 12)}…{confirmBid.recipient.slice(-6)}
                  </span>
                </div>
              </div>
            )}

            {acceptError && (
              <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {acceptError}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <Dialog.Close
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={accepting}
                  />
                }
              >
                Cancel
              </Dialog.Close>
              <Button
                className="flex-1"
                disabled={accepting}
                onClick={handleAcceptConfirmed}
              >
                {accepting ? "Accepting…" : "Accept Bid"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Link
        to="/rfps"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to RFPs
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLES[ask.status])}>
                {STATUS_LABEL[ask.status]}
              </span>
              {metadata?.category && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {metadata.category}
                </span>
              )}
              {metadata?.tags?.map((tag) => (
                <span key={tag} className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground/70">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-xl font-semibold">
              {metadata?.title ?? <span className="font-mono text-base">{ask.id}</span>}
            </h1>

            {metadata?.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {metadata.description}
              </p>
            )}

            <p className="text-xs text-muted-foreground/60">
              Posted by{" "}
              <span className="font-mono">
                {ask.creator.slice(0, 12)}…{ask.creator.slice(-6)}
              </span>
            </p>
          </div>

          {/* Skills & Deliverables */}
          {(metadata?.skills_required?.length || metadata?.deliverables?.length) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {metadata.skills_required?.length && (
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Skills Required</p>
                  <ul className="space-y-1">
                    {metadata.skills_required.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {metadata.deliverables?.length && (
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deliverables</p>
                  <ul className="space-y-1">
                    {metadata.deliverables.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-sm">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Bids list */}
          <div className="rounded-lg border border-border">
            <div className="border-b border-border px-5 py-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">
                Bids{" "}
                <span className="ml-1 text-muted-foreground">{bids.length}</span>
              </h2>
              {bidsLoading && (
                <span className="text-xs text-muted-foreground">Loading…</span>
              )}
            </div>

            {bids.length === 0 && !bidsLoading ? (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                No bids yet.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {bids.map(({ bid }) => {
                  const isMyBid = address && bid.provider === address
                  const isOwner = address && ask.creator === address
                  const canAccept = isOwner && ask.status === "open"
                  return (
                    <div key={bid.id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs text-muted-foreground">
                            {bid.provider.slice(0, 12)}…{bid.provider.slice(-6)}
                          </p>
                          {isMyBid && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20">
                              my bid
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-muted-foreground/60">
                          bid #{bid.id}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <p className="font-semibold tabular-nums text-sm">
                          {formatAmount(bid.price.amount, bid.price.denom)}
                        </p>
                        {canAccept && (
                          <Button
                            size="sm"
                            onClick={() => setConfirmBid({
                              id: bid.id,
                              price: bid.price,
                              recipient: bid.funds_recipient ?? bid.provider,
                            })}
                          >
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Budget</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatAmount(ask.budget.amount, ask.budget.denom)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {bids.length} {bids.length === 1 ? "bid" : "bids"} submitted
            </p>
            {ask.locked_funds && (
              <p className="mt-2 text-xs text-blue-400">
                {formatAmount(ask.locked_funds.amount, ask.locked_funds.denom)} in escrow
              </p>
            )}
          </div>

          {/* Timeline */}
          {metadata?.timeline && (
            <div className="rounded-lg border border-border p-5 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Timeline</p>
              {metadata.timeline.estimated_days && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated</span>
                  <span>{metadata.timeline.estimated_days} days</span>
                </div>
              )}
              {metadata.timeline.deadline && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deadline</span>
                  <span>{metadata.timeline.deadline}</span>
                </div>
              )}
            </div>
          )}

          {/* Attachments */}
          {metadata?.attachments?.length && (
            <div className="rounded-lg border border-border p-5 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Attachments</p>
              <ul className="space-y-2">
                {metadata.attachments.map((a) => (
                  <li key={a.url}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                        <path d="m21 3-9 9" /><path d="M15 3h6v6" />
                      </svg>
                      {a.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ask.status === "open" && (
            <div className="rounded-lg border border-border p-5">
              <h2 className="mb-4 font-medium">Submit a Bid</h2>

              {!isAuthenticated ? (
                <div className="space-y-3 text-center">
                  <p className="text-sm text-muted-foreground">Sign in to submit your proposal</p>
                  <Button className="w-full" onClick={() => login?.()}>Sign In to Bid</Button>
                </div>
              ) : bidStatus === "success" ? (
                <div className="space-y-2 text-center py-2">
                  <p className="text-sm font-medium text-emerald-400">Bid submitted!</p>
                  <Button variant="outline" className="w-full" onClick={() => setBidStatus("idle")}>
                    Submit another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Price</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.000001"
                        step="0.000001"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="10"
                        required
                        className="flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                      <select
                        value={bidDenom}
                        onChange={(e) => setBidDenom(e.target.value)}
                        className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                      >
                        <option value="uxion">XION</option>
                        <option value="ibc/57097251ED81A232CE3C9D899E7C8096D6D87EF84BA203E12E424AA4C9B57A64">USDC</option>
                      </select>
                    </div>
                  </div>

                  {bidStatus === "error" && (
                    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {bidError}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={bidStatus === "submitting" || !bidAmount}>
                    {bidStatus === "submitting" ? "Submitting…" : "Submit Bid"}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
