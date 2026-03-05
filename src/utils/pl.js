import { getPricePerChiForType } from './goldPrice'

/**
 * Group transactions by goldType and compute net qty, cost basis, current value, P&L
 * @param {Array<{ goldType: string, type: 'buy'|'sell', quantity: number, pricePerChi: number }>} transactions
 * @param {number} spotVndPerChi - current spot price VNĐ per chỉ (base, e.g. 999)
 * @param {{ SJC?: number, '999'?: number }} [pricesByCode] - optional Mihong prices per chỉ
 */
export function computePortfolioByType(transactions, spotVndPerChi, pricesByCode = null) {
  const byType = {}

  for (const tx of transactions) {
    const key = tx.goldType
    if (!byType[key]) {
      byType[key] = {
        goldType: key,
        buyQty: 0,
        sellQty: 0,
        totalBuyCost: 0,
      }
    }
    const row = byType[key]
    if (tx.type === 'buy') {
      row.buyQty += tx.quantity
      row.totalBuyCost += tx.quantity * tx.pricePerChi
    } else {
      row.sellQty += tx.quantity
    }
  }

  const result = []
  for (const [goldType, row] of Object.entries(byType)) {
    const netQty = row.buyQty - row.sellQty
    const avgCost = row.buyQty > 0 ? row.totalBuyCost / row.buyQty : 0
    const currentPricePerChi = getPricePerChiForType(spotVndPerChi, goldType, pricesByCode)
    const currentValue = netQty * currentPricePerChi
    const costBasis = netQty * avgCost
    const plVnd = currentValue - costBasis
    const plPercent = costBasis > 0 ? (plVnd / costBasis) * 100 : 0

    result.push({
      goldType,
      netQty,
      buyQty: row.buyQty,
      sellQty: row.sellQty,
      avgCost,
      totalBuyCost: row.totalBuyCost,
      currentPricePerChi,
      currentValue,
      costBasis,
      plVnd,
      plPercent,
    })
  }

  return result.filter((r) => r.netQty > 0)
}

/**
 * Aggregate portfolio totals
 */
export function computePortfolioTotals(byTypeRows) {
  let totalCostBasis = 0
  let totalCurrentValue = 0
  let totalChi = 0

  for (const row of byTypeRows) {
    totalCostBasis += row.costBasis
    totalCurrentValue += row.currentValue
    totalChi += row.netQty
  }

  const plVnd = totalCurrentValue - totalCostBasis
  const plPercent = totalCostBasis > 0 ? (plVnd / totalCostBasis) * 100 : 0

  return {
    totalCostBasis,
    totalCurrentValue,
    totalChi,
    plVnd,
    plPercent,
  }
}
