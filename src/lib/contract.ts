// ─── Contract config ─────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS = import.meta.env
  .VITE_MARKETPLACE_CONTRACT as string

const REST_URL = import.meta.env.VITE_XION_REST_URL as string

// ─── Primitive types ─────────────────────────────────────────────────────────

/** CosmWasm Uint128 is always a decimal string on the wire. */
export type Uint128 = string

export interface Coin {
  amount: Uint128
  denom: string
}

export type AskStatus =
  | "open"
  | "in_progress"
  | "work_submitted"
  | "completed"
  | "cancelled"

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface Ask {
  id: string
  creator: string
  budget: Coin
  status: AskStatus
  locked_funds: Coin | null
  selected_bid: string | null
}

export interface Bid {
  id: string
  ask_id: string
  provider: string
  price: Coin
  funds_recipient: string | null
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface AskResponse {
  ask: Ask
}

export interface BidResponse {
  bid: Bid
}

export interface ConfigResponse {
  config: {
    admin: string
  }
}

// ─── Generic smart query ─────────────────────────────────────────────────────

/**
 * Executes a CosmWasm smart query against the REST endpoint.
 * GET /cosmwasm/wasm/v1/contract/{address}/smart/{base64(queryJson)}
 */
export async function smartQuery<T>(
  contractAddress: string,
  query: object,
): Promise<T> {
  const encoded = btoa(JSON.stringify(query))
  const url = `${REST_URL}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encoded}`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Smart query failed (${res.status}): ${text}`)
  }
  const json = await res.json()
  // CosmWasm REST wraps the result in { data: <result> }
  return json.data as T
}

// ─── Query functions ──────────────────────────────────────────────────────────

export function getAsk(askId: string): Promise<AskResponse> {
  return smartQuery<AskResponse>(CONTRACT_ADDRESS, {
    get_ask: { ask_id: askId },
  })
}

export function getBid(bidId: string): Promise<BidResponse> {
  return smartQuery<BidResponse>(CONTRACT_ADDRESS, {
    get_bid: { bid_id: bidId },
  })
}

export function listAsks(opts?: {
  status?: AskStatus
  start_after?: string
  limit?: number
}): Promise<AskResponse[]> {
  return smartQuery<AskResponse[]>(CONTRACT_ADDRESS, {
    list_asks: {
      ...(opts?.status && { status: opts.status }),
      ...(opts?.start_after && { start_after: opts.start_after }),
      ...(opts?.limit && { limit: opts.limit }),
    },
  })
}

export function listBidsByAsk(
  askId: string,
  opts?: { start_after?: string; limit?: number },
): Promise<BidResponse[]> {
  return smartQuery<BidResponse[]>(CONTRACT_ADDRESS, {
    list_bids_by_ask: {
      ask_id: askId,
      ...(opts?.start_after && { start_after: opts.start_after }),
      ...(opts?.limit && { limit: opts.limit }),
    },
  })
}

export function getConfig(): Promise<ConfigResponse> {
  return smartQuery<ConfigResponse>(CONTRACT_ADDRESS, { get_config: {} })
}

// ─── Execute message builders ────────────────────────────────────────────────
//
// Usage with Abstraxion signingClient:
//   await signingClient.execute(senderAddress, CONTRACT_ADDRESS, msg.createAsk(...), "auto")
//
// For messages that require funds (selectBid), pass the funds array as the
// 5th argument to signingClient.execute().

export const msg = {
  /** Create a new ask (RFP). `budget` is informational — no funds sent. */
  createAsk(budget: Coin) {
    return { create_ask: { budget } }
  },

  /** Submit a bid on an open ask. No funds required at bid time. */
  submitBid(askId: string, price: Coin, fundsRecipient?: string) {
    return {
      submit_bid: {
        ask_id: askId,
        price,
        ...(fundsRecipient && { funds_recipient: fundsRecipient }),
      },
    }
  },

  /**
   * Select a winning bid and lock funds into escrow.
   * Caller must send funds equal to the bid price:
   *   signingClient.execute(sender, CONTRACT_ADDRESS, msg.selectBid(...), "auto", undefined, [bidPrice])
   */
  selectBid(askId: string, bidId: string) {
    return { select_bid: { ask_id: askId, bid_id: bidId } }
  },

  /** Provider marks their work as complete (InProgress → WorkSubmitted). */
  markComplete(askId: string) {
    return { mark_complete: { ask_id: askId } }
  },

  /** Client confirms work and releases remaining escrow to the provider. */
  confirmCompletion(askId: string) {
    return { confirm_completion: { ask_id: askId } }
  },

  /** Cancel an open ask (no escrow involved). */
  cancelAsk(askId: string) {
    return { cancel_ask: { ask_id: askId } }
  },

  /** Release a partial amount from escrow. Callable by ask creator or admin. */
  partialDisbursement(askId: string, amount: Coin, recipient: string) {
    return { partial_disbursement: { ask_id: askId, amount, recipient } }
  },

  // ── Admin-only ──

  adminCancel(askId: string, refundTo: string) {
    return { admin_cancel: { ask_id: askId, refund_to: refundTo } }
  },

  adminForceRelease(askId: string, recipient: string) {
    return { admin_force_release: { ask_id: askId, recipient } }
  },

  adminResolve(askId: string, amount: Coin, recipient: string) {
    return { admin_resolve: { ask_id: askId, amount, recipient } }
  },

  adminUpdateConfig(newAdmin: string) {
    return { admin_update_config: { new_admin: newAdmin } }
  },
}
