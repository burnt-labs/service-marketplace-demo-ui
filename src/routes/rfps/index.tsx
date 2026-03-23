import { createFileRoute } from "@tanstack/react-router"
import { RfpCard } from "@/components/rfp/rfp-card"
import { MOCK_RFPS } from "@/lib/mock-rfps"

export const Route = createFileRoute("/rfps/")({
  component: RfpsPage,
})

function RfpsPage() {
  const openRfps = MOCK_RFPS.filter((r) => r.status === "open")
  const otherRfps = MOCK_RFPS.filter((r) => r.status !== "open")

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Requests for Proposal</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse open work and submit your bid
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {openRfps.length} open
        </span>
      </div>

      <div className="rounded-lg border border-border">
        {openRfps.map((rfp) => (
          <RfpCard key={rfp.id} rfp={rfp} />
        ))}

        {otherRfps.length > 0 && (
          <>
            <div className="border-t border-border px-1 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Closed / In Review
              </span>
            </div>
            {otherRfps.map((rfp) => (
              <RfpCard key={rfp.id} rfp={rfp} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
