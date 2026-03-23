export type RfpStatus = "open" | "in_review" | "closed"

export type RfpCategory =
  | "Smart Contract"
  | "Frontend"
  | "Backend"
  | "Audit"
  | "Design"
  | "DevOps"

export interface Bid {
  id: string
  bidderAddress: string
  amount: number
  currency: string
  proposal: string
  submittedAt: string
}

export interface Rfp {
  id: string
  title: string
  description: string
  fullDescription: string
  budget: number
  currency: string
  category: RfpCategory
  tags: string[]
  status: RfpStatus
  postedAt: string
  clientAddress: string
  bidCount: number
  bids: Bid[]
}

export const MOCK_RFPS: Rfp[] = [
  {
    id: "rfp-001",
    title: "CosmWasm Staking Contract with Unbonding Period",
    description:
      "Need an audited, production-ready staking contract for our XION-based token. Must support custom unbonding periods, slashing conditions, and reward distribution.",
    fullDescription: `We are looking for an experienced CosmWasm developer to build a production-ready staking contract for our protocol.

**Requirements:**
- Custom unbonding period configuration (7, 14, 28 days)
- Slashing conditions for misbehaving validators
- Proportional reward distribution based on stake weight
- Emergency pause mechanism (multisig controlled)
- Full test suite with >90% coverage
- Security audit report from a recognized firm

**Deliverables:**
- Rust/CosmWasm source code
- Deployment scripts for XION testnet and mainnet
- Test suite
- Documentation`,
    budget: 5000,
    currency: "USDC",
    category: "Smart Contract",
    tags: ["CosmWasm", "Rust", "Staking", "DeFi"],
    status: "open",
    postedAt: "2026-03-19T10:00:00Z",
    clientAddress: "xion1abc...def",
    bidCount: 12,
    bids: [
      {
        id: "bid-001",
        bidderAddress: "xion1prov...xyz",
        amount: 4800,
        currency: "USDC",
        proposal:
          "I have built 5+ CosmWasm contracts in production. I can deliver this in 3 weeks with a full audit.",
        submittedAt: "2026-03-20T14:00:00Z",
      },
      {
        id: "bid-002",
        bidderAddress: "xion1dev...abc",
        amount: 5000,
        currency: "USDC",
        proposal:
          "Core contributor to CosmWasm ecosystem. Will include security audit from Oak Security.",
        submittedAt: "2026-03-20T16:30:00Z",
      },
    ],
  },
  {
    id: "rfp-002",
    title: "DEX Frontend with Order Book UI",
    description:
      "React-based trading interface for our decentralized exchange. Needs real-time order book, price charts (TradingView), and wallet integration via Abstraxion.",
    fullDescription: `We need a high-performance trading frontend for our DEX protocol running on XION.

**Requirements:**
- Real-time order book (WebSocket updates)
- TradingView Lightweight Charts integration
- Market and limit order placement
- Portfolio / position tracking
- Abstraxion wallet integration (already built — just needs to connect)
- Mobile-responsive design
- Sub-100ms UI update latency

**Tech stack preference:**
- React 19 + TypeScript
- TanStack Query for data fetching
- Tailwind CSS`,
    budget: 2500,
    currency: "USDC",
    category: "Frontend",
    tags: ["React", "TypeScript", "TanStack", "DEX", "WebSocket"],
    status: "open",
    postedAt: "2026-03-17T08:00:00Z",
    clientAddress: "xion1xyz...ghi",
    bidCount: 4,
    bids: [],
  },
  {
    id: "rfp-003",
    title: "Smart Contract Security Audit — NFT Marketplace",
    description:
      "Security audit for a CosmWasm NFT marketplace. Covers minting, royalties, escrow, and secondary market logic. ~1,800 lines of Rust.",
    fullDescription: `We are looking for a security researcher or firm to audit our NFT marketplace contracts before mainnet deployment.

**Scope:**
- \`marketplace.rs\` — listing, bidding, and sale finalization
- \`royalties.rs\` — creator fee distribution
- \`escrow.rs\` — fund holding during active bids
- \`minter.rs\` — NFT minting and metadata management

~1,800 lines of Rust total.

**Deliverables:**
- Findings report (critical / high / medium / low / info)
- Proof-of-concept exploits for critical findings
- Remediation guidance
- Re-audit of fixes (1 round included)

**Timeline:** Must start within 2 weeks.`,
    budget: 8000,
    currency: "USDC",
    category: "Audit",
    tags: ["Security", "Audit", "CosmWasm", "NFT", "Rust"],
    status: "in_review",
    postedAt: "2026-03-14T12:00:00Z",
    clientAddress: "xion1jkl...mno",
    bidCount: 7,
    bids: [],
  },
  {
    id: "rfp-004",
    title: "Indexer API for On-Chain Event Tracking",
    description:
      "Build a GraphQL indexer that tracks contract events from our XION smart contracts and exposes them via a queryable API for our frontend.",
    fullDescription: `We need an indexer service that listens to XION chain events and exposes data via GraphQL.

**Requirements:**
- Subscribe to XION node WebSocket for contract events
- Parse and store events in PostgreSQL
- GraphQL API (Apollo or Hasura)
- Historical re-indexing support
- Docker + docker-compose setup for local dev
- Deployment guide for VPS (Ubuntu 22.04)

**Events to index:**
- \`wasm-contract-event\` for our marketplace contract
- Token transfers related to escrow
- Bid submitted / accepted / rejected events`,
    budget: 3500,
    currency: "USDC",
    category: "Backend",
    tags: ["GraphQL", "PostgreSQL", "Indexer", "Node.js", "Docker"],
    status: "open",
    postedAt: "2026-03-20T09:00:00Z",
    clientAddress: "xion1pqr...stu",
    bidCount: 2,
    bids: [],
  },
  {
    id: "rfp-005",
    title: "Mobile Wallet UI/UX Design System",
    description:
      "Design a complete UI/UX system for a React Native crypto wallet. Needs Figma components, design tokens, and dark/light mode specs.",
    fullDescription: `We need a senior product designer to create a full design system for our React Native wallet app.

**Deliverables:**
- Figma component library (atoms → organisms)
- Design tokens (colors, spacing, typography) exported as JSON
- Dark and light mode variants
- Onboarding flow (5 screens)
- Portfolio / asset list screens
- Send / receive flow
- Transaction history

**Constraints:**
- Must follow WCAG AA accessibility guidelines
- Fonts: Geist or Inter
- Color system must work on both iOS and Android`,
    budget: 4000,
    currency: "USDC",
    category: "Design",
    tags: ["Figma", "Mobile", "React Native", "Design System", "UX"],
    status: "open",
    postedAt: "2026-03-18T15:00:00Z",
    clientAddress: "xion1vwx...yza",
    bidCount: 9,
    bids: [],
  },
]

export function getRfpById(id: string): Rfp | undefined {
  return MOCK_RFPS.find((rfp) => rfp.id === id)
}

export function formatBudget(amount: number, currency: string): string {
  return `$${amount.toLocaleString()} ${currency}`
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  return `${diffDays} days ago`
}
