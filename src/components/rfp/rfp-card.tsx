import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import {
  formatBudget,
  formatRelativeDate,
  type Rfp,
  type RfpStatus,
} from "@/lib/mock-rfps"

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

interface RfpCardProps {
  rfp: Rfp
}

export function RfpCard({ rfp }: RfpCardProps) {
  return (
    <Link
      to="/rfps/$rfpId"
      params={{ rfpId: rfp.id }}
      className="group block border-b border-border px-5 py-5 transition-colors last:border-0 hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left — title + description + meta */}
        <div className="min-w-0 flex-1 space-y-1.5">
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
            {rfp.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="truncate font-medium text-foreground group-hover:text-primary">
            {rfp.title}
          </h3>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {rfp.description}
          </p>

          <p className="text-xs text-muted-foreground">
            Posted {formatRelativeDate(rfp.postedAt)}
          </p>
        </div>

        {/* Right — budget + bid count */}
        <div className="flex shrink-0 flex-col items-end gap-2 text-right">
          <span className="text-base font-semibold tabular-nums text-foreground">
            {formatBudget(rfp.budget, rfp.currency)}
          </span>
          <span className="text-sm text-muted-foreground">
            {rfp.bidCount} {rfp.bidCount === 1 ? "bid" : "bids"}
          </span>
        </div>
      </div>
    </Link>
  )
}
