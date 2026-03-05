/**
 * Demo transactions for first load
 */
export function getSeedTransactions() {
  const now = new Date()
  const d = (daysAgo) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString().slice(0, 10)
  }
  return [
    {
      id: 'seed-1',
      type: 'buy',
      goldType: 'SJC',
      quantity: 2,
      pricePerChi: 78500000,
      date: d(45),
      note: 'Mua vàng SJC tại PNJ',
    },
    {
      id: 'seed-2',
      type: 'buy',
      goldType: '999',
      quantity: 1.5,
      pricePerChi: 72500000,
      date: d(30),
      note: 'Vàng 24K',
    },
    {
      id: 'seed-3',
      type: 'buy',
      goldType: 'Nhan18K',
      quantity: 0.5,
      pricePerChi: 58000000,
      date: d(14),
      note: 'Nhẫn cưới',
    },
    {
      id: 'seed-4',
      type: 'sell',
      goldType: '999',
      quantity: 0.5,
      pricePerChi: 74200000,
      date: d(7),
      note: 'Bán một phần',
    },
  ]
}
