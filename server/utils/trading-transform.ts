function pf(val: string | null): number | null {
  return val !== null ? parseFloat(val) : null
}

export function toStrategy(row: StrategyRow): Strategy {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    tags: row.tags ?? [],
    allocationUsd: pf(row.allocation_usd),
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export function toTrade(row: TradeRow): Trade {
  return {
    id: row.id,
    strategyId: row.strategy_id,
    pair: row.pair,
    direction: row.direction,
    entryPrice: pf(row.entry_price),
    exitPrice: pf(row.exit_price),
    quantity: pf(row.quantity),
    pnl: pf(row.pnl),
    fee: pf(row.fee),
    leverage: row.leverage,
    margin: pf(row.margin),
    fundingFee: pf(row.funding_fee),
    bingxPositionId: row.bingx_position_id,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
  }
}

export function toSnapshot(row: SnapshotRow): Snapshot {
  return {
    id: row.id,
    strategyId: row.strategy_id,
    date: row.date,
    balance: pf(row.balance),
    equity: pf(row.equity),
    pnl: pf(row.pnl),
    roi: pf(row.roi),
    drawdown: pf(row.drawdown),
    createdAt: row.created_at,
  }
}

export function toSyncLog(row: SyncLogRow): SyncLog {
  return {
    id: row.id,
    syncType: row.sync_type,
    status: row.status,
    recordsSynced: row.records_synced,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }
}
