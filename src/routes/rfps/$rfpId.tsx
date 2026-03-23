import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  formatBudget,
  formatRelativeDate,
  getRfpById,
  type RfpStatus,
} from "@/lib/mock-rfps"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/rfps/$rfpId")({
  loader: ({ params }) => {
    const rfp = getRfpById(params.rfpId)
    if (!rfp) throw notFound()
    return rfp
  },
  component: RfpDetailPage,
})

const STATUS_STYLES: Record<RfpStatus, string> = {
  open: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  in_review: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  closed: "bg-muted text-muted-foreground ring-1 ring-border",
}

const STATUS_LABEL: Record<RfpStatus, string> = {
  open: "Open",
  in_review: "In Review",
  closed: "Closed",
}

function RfpDetailPage() {
  const rfp = Route.useLoaderData()
  const { isAuthenticated, login } = useAuth()
  const [amount, setAmount] = useState("")
  const [proposal, setProposal] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmitBid(e: React.FormEvent) {
    e.preventDefault()
    // TODO: submit bid transaction via signingClient
    setSubmitted(true)
  }

  return (
    <div className="py-8">
      {/* Back */}
      <Link
        to="/rfps"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to RFPs
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  STATUS_STYLES[rfp.status],
                )}
              >
                {STATUS_LABEL[rfp.status]}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {rfp.category}
              </span>
              {rfp.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-2xl font-semibold">{rfp.title}</h1>

            <p className="text-sm text-muted-foreground">
              Posted {formatRelativeDate(rfp.postedAt)} by{" "}
              <span className="font-mono">
                {rfp.clientAddress.slice(0, 10)}...
                {rfp.clientAddress.slice(-4)}
              </span>
            </p>
          </div>

          {/* Full description */}
          <div className="rounded-lg border border-border p-5">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </h2>
            <div className="prose prose-sm prose-invert max-w-none">
              {rfp.fullDescription.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p key={i} className="mt-4 font-semibold first:mt-0">
                      {line.replace(/\*\*/g, "")}
                    </p>
                  )
                }
                if (line.startsWith("- ")) {
                  return (
                    <p
                      key={i}
                      className="ml-4 text-sm text-muted-foreground before:mr-2 before:content-['·']"
                    >
                      {line.slice(2)}
                    </p>
                  )
                }
                if (line.startsWith("`") || line === "") {
                  return <br key={i} />
                }
                return (
                  <p key={i} className="text-sm text-foreground">
                    {line}
                  </p>
                )
              })}
            </div>
          </div>
          {/* Bids list */}
          {rfp.bids.length > 0 && (
            <div className="rounded-lg border border-border">
              <div className="border-b border-border px-5 py-3">
                <h2 className="text-sm font-medium">
                  Bids{" "}
                  <span className="ml-1 text-muted-foreground">
                    {rfp.bids.length}
                  </span>
                </h2>
              </div>
              <div className="divide-y divide-border">
                {rfp.bids.map((bid) => (
                  <div key={bid.id} className="px-5 py-4 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-mono text-xs text-muted-foreground">
                        {bid.bidderAddress.slice(0, 10)}...
                        {bid.bidderAddress.slice(-4)}
                      </span>
                      <span className="tabular-nums font-semibold text-sm">
                        {formatBudget(bid.amount, bid.currency)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {bid.proposal}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(bid.submittedAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Budget card */}
          <div className="rounded-lg border border-border p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Budget
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatBudget(rfp.budget, rfp.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {rfp.bidCount} {rfp.bidCount === 1 ? "bid" : "bids"} submitted
            </p>
          </div>

          {/* Bid form */}
          {rfp.status === "open" && (
            <div className="rounded-lg border border-border p-5">
              <h2 className="mb-4 font-medium">Submit a Bid</h2>

              {!isAuthenticated ? (
                <div className="space-y-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sign in to submit your proposal
                  </p>
                  <Button className="w-full" onClick={() => login?.()}>
                    Sign In to Bid
                  </Button>
                </div>
              ) : submitted ? (
                <div className="space-y-2 text-center">
                  <p className="text-sm font-medium text-emerald-400">
                    Bid submitted!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The client will review your proposal.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Your bid ({rfp.currency})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        min="1"
                        max={rfp.budget * 2}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={String(rfp.budget)}
                        required
                        className="w-full rounded-md border border-border bg-muted/40 py-2 pl-7 pr-3 text-sm placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Proposal
                    </label>
                    <textarea
                      rows={5}
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      placeholder="Describe your approach, timeline, and relevant experience..."
                      required
                      className="w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!amount || !proposal}
                  >
                    Submit Bid
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
