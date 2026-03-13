// Database row types (snake_case, DECIMAL as string)
export interface StrategyRow {
  id: number
  name: string
  description: string | null
  tags: string[] | null
  allocation_usd: string | null
  is_active: boolean
  created_at: string
}

export interface TradeRow {
  id: number
  strategy_id: number | null
  pair: string
  direction: string
  entry_price: string | null
  exit_price: string | null
  quantity: string | null
  pnl: string | null
  fee: string | null
  leverage: number
  margin: string | null
  funding_fee: string | null
  bingx_position_id: string | null
  opened_at: string | null
  closed_at: string | null
  created_at: string
}

export interface SnapshotRow {
  id: number
  strategy_id: number | null
  date: string
  balance: string | null
  equity: string | null
  pnl: string | null
  roi: string | null
  drawdown: string | null
  created_at: string
}

export interface SyncLogRow {
  id: number
  sync_type: string
  status: string
  records_synced: number
  error_message: string | null
  started_at: string
  completed_at: string | null
}

// API types (camelCase, DECIMAL as number)
export interface Strategy {
  id: number
  name: string
  description: string | null
  tags: string[]
  allocationUsd: number | null
  isActive: boolean
  createdAt: string
}

export interface Trade {
  id: number
  strategyId: number | null
  pair: string
  direction: string
  entryPrice: number | null
  exitPrice: number | null
  quantity: number | null
  pnl: number | null
  fee: number | null
  leverage: number
  margin: number | null
  fundingFee: number | null
  bingxPositionId: string | null
  openedAt: string | null
  closedAt: string | null
  createdAt: string
}

export interface Snapshot {
  id: number
  strategyId: number | null
  date: string
  balance: number | null
  equity: number | null
  pnl: number | null
  roi: number | null
  drawdown: number | null
  createdAt: string
}

export interface SyncLog {
  id: number
  syncType: string
  status: string
  recordsSynced: number
  errorMessage: string | null
  startedAt: string
  completedAt: string | null
}

// Input types
export interface StrategyInput {
  name: string
  description?: string | null
  tags?: string[]
  allocationUsd?: number | null
  isActive?: boolean
}

// Stats type
export interface TradingStats {
  totalTrades: number
  winRate: number
  totalPnl: number
  pairBreakdown: { pair: string; trades: number; pnl: number; winRate: number }[]
  monthlyPnl: { month: string; pnl: number; trades: number }[]
}

// BingX response types
export interface BingXBalance {
  balance: string
  equity: string
  unrealizedProfit: string
  availableMargin: string
  usedMargin: string
}

export interface BingXPosition {
  symbol: string
  positionId: string
  positionSide: string
  isolated: boolean
  leverage: number
  avgPrice: string
  currentPrice: string
  unrealizedProfit: string
  positionAmt: string
  margin: string
}

export interface BingXPositionHistory {
  positionId: string
  symbol: string
  positionSide: string
  leverage: number
  openAvgPrice: string
  closeAvgPrice: string
  positionAmt: string
  profit: string
  commission: string
  fundingFee: string
  margin: string
  openTime: number
  closeTime: number
}
