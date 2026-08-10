import { Dialog } from "@base-ui/react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { CONTRACT_ADDRESS, msg } from "@/lib/contract"
import type { GranteeSignerClient } from "@burnt-labs/abstraxion-react"
import { cn } from "@/lib/utils"

interface CreateAskModalProps {
  onCreated?: () => void
}

type Status = "idle" | "submitting" | "success" | "error"

export function CreateAskModal({ onCreated }: CreateAskModalProps) {
  const { isAuthenticated, login, address, signingClient } = useAuth()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [denom, setDenom] = useState("uxion")
  const [metadataUrl, setMetadataUrl] = useState("https://gist.githubusercontent.com/jburnt/f00c89cde01cc9dafb494191d8210b01/raw/9561ade6cb012577c488a740920e2453a21252c3/metadtada.json")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  function reset() {
    setAmount("")
    setDenom("uxion")
    setMetadataUrl("")
    setStatus("idle")
    setErrorMsg("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!signingClient || !address) return

    setStatus("submitting")
    setErrorMsg("")

    try {
      // GranteeSignerClient extends SigningCosmWasmClient which has execute().
      // The union type from useAbstraxionSigningClient hides it, so we cast.
      await (signingClient as unknown as GranteeSignerClient).execute(
        address,
        CONTRACT_ADDRESS,
        msg.createAsk({ amount: String(Math.round(Number(amount) * 1_000_000)), denom }, metadataUrl),
        "auto",
      )
      setStatus("success")
      onCreated?.()
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Transaction failed")
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) reset()
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger render={<Button>Post an Ask</Button>} />

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-border bg-card p-6 shadow-xl",
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-base font-semibold">
                Post an Ask
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                Describe the work and set a budget. Providers will submit bids.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-4 text-center py-4">
              <p className="text-sm text-muted-foreground">
                You need to be signed in to post an ask.
              </p>
              <Button className="w-full" onClick={() => login?.()}>
                Sign In
              </Button>
            </div>
          ) : status === "success" ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-400"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="font-medium">Ask posted!</p>
              <p className="text-sm text-muted-foreground">
                Your ask is now live. Providers can start submitting bids.
              </p>
              <Button className="w-full" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Budget</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.000001"
                    step="0.000001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10"
                    required
                    className="flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <select
                    value={denom}
                    onChange={(e) => setDenom(e.target.value)}
                    className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="uxion">XION</option>
                    <option value="ibc/57097251ED81A232CE3C9D899E7C8096D6D87EF84BA203E12E424AA4C9B57A64">USDC</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter amount in XION (e.g. 10 = 10 XION)
                </p>
              </div>

              {/* Metadata URL */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Metadata URL</label>
                <input
                  type="url"
                  value={metadataUrl}
                  onChange={(e) => setMetadataUrl(e.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
                <p className="text-xs text-muted-foreground">
                  Link to a JSON file describing the work (title, description, requirements).
                </p>
              </div>

              {/* Error */}
              {status === "error" && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMsg}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Dialog.Close
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={status === "submitting"}
                    />
                  }
                >
                  Cancel
                </Dialog.Close>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={status === "submitting" || !amount}
                >
                  {status === "submitting" ? "Submitting…" : "Post Ask"}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
