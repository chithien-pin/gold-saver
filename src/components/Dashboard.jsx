import { useTransactions } from '../context/TransactionContext'
import { useGoldPrice } from '../hooks/useGoldPrice'
import { computePortfolioByType, computePortfolioTotals } from '../utils/pl'
import { GOLD_TYPES, getLabelForGoldType } from '../constants'
import { getPricePerChiForType, getSellPricePerChiForType } from '../utils/goldPrice'
import { formatVND, formatNumber, formatPercent } from '../utils/format'

function SectionIcon({ children, className = '' }) {
  return (
    <div className={`w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 ${className}`}>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { transactions, loading: transactionsLoading, error: transactionsError, refresh: refreshTransactions } = useTransactions()
  const { spotVndPerChi, pricesByCode, pricesByCodeSell, loading, lastUpdated, refresh } = useGoldPrice()
  const byType = spotVndPerChi != null ? computePortfolioByType(transactions, spotVndPerChi, pricesByCode) : []
  const totals = computePortfolioTotals(byType)

  const handleRefresh = () => refresh()
  const isLoading = transactionsLoading

  return (
    <div className="space-y-6 md:space-y-8">
      {transactionsError && (
        <div className="rounded-card bg-red-50 px-4 py-3 flex items-center justify-between gap-4 shadow-soft">
          <span className="text-sm text-red-700">Không tải được giao dịch: {transactionsError}</span>
          <button type="button" onClick={refreshTransactions} className="text-sm font-medium text-primary hover:underline">Thử lại</button>
        </div>
      )}
      {isLoading && (
        <div className="rounded-card bg-white px-4 py-3 text-gray-500 text-sm shadow-soft">
          Đang tải giao dịch…
        </div>
      )}

      {/* Giá vàng - card với icon tròn */}
      <section className="rounded-card bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <SectionIcon>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </SectionIcon>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Giá vàng (Mihong)</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Cập nhật lúc: {lastUpdated ? lastUpdated.toLocaleTimeString('vi-VN') + ' ' + lastUpdated.toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 shadow-soft"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin-slow' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới giá
          </button>
        </div>

        {loading && spotVndPerChi == null ? (
          <div className="mt-6 h-12 flex items-center text-gray-500 text-sm">Đang tải giá...</div>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {GOLD_TYPES.map((t) => {
              const priceBuy = getPricePerChiForType(spotVndPerChi, t.value, pricesByCode) ?? 0
              const priceSell = getSellPricePerChiForType(spotVndPerChi, t.value, pricesByCodeSell) ?? 0
              return (
                <div key={t.value} className="rounded-xl bg-surface py-3 px-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{t.label} / chỉ</p>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-sm">
                      <span className="text-gray-500">Mua: </span>
                      <span className="font-semibold text-primary">{formatVND(priceBuy)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Bán: </span>
                      <span className="font-semibold text-primary">{formatVND(priceSell)}</span>
                    </p>
                  </div>
                  {/* <p className="text-xs text-gray-500 mt-0.5">/ chỉ</p> */}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Thẻ thống kê - large number + label */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Tổng vốn đầu tư" value={formatVND(totals.totalCostBasis)} />
        <SummaryCard title="Giá trị hiện tại" value={formatVND(totals.totalCurrentValue)} />
        <SummaryCard
          title="Lợi nhuận / Lỗ"
          value={formatVND(totals.plVnd)}
          sub={formatPercent(totals.plPercent)}
          positive={totals.plVnd >= 0}
        />
        <SummaryCard title="Tổng số lượng vàng" value={`${formatNumber(totals.totalChi, 2)} chỉ`} />
      </section>

      {/* Bảng chi tiết theo loại vàng */}
      <section className="rounded-card bg-white overflow-hidden shadow-soft animate-slide-up">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
          <SectionIcon>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </SectionIcon>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chi tiết theo loại vàng</h2>
            <p className="text-sm text-gray-500">Tổng hợp theo từng loại vàng trong danh mục</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm bg-gray-50/80">
                <th className="px-6 py-3 font-medium whitespace-nowrap">Loại</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Vàng (chỉ)</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Giá mua</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Giá hiện tại</th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">Lời / Lỗ</th>
              </tr>
            </thead>
            <tbody>
              {byType.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                    Chưa có giao dịch. Thêm giao dịch tại mục Nhập Giao Dịch.
                  </td>
                </tr>
              ) : (
                byType.map((row) => (
                  <tr key={row.goldType} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{getLabelForGoldType(row.goldType)}</td>
                    <td className="px-6 py-3.5 text-gray-600">{formatNumber(row.netQty, 2)}</td>
                    <td className="px-6 py-3.5 text-gray-600 whitespace-nowrap">{formatVND(row.avgCost)}</td>
                    <td className="px-6 py-3.5 text-primary font-medium whitespace-nowrap">{formatVND(row.currentPricePerChi)}</td>
                    <td className="px-6 py-3.5">
                      <span className={row.plVnd >= 0 ? 'text-accent font-medium whitespace-nowrap' : 'text-red-500 font-medium whitespace-nowrap'}>
                        {row.plVnd >= 0 ? '▲ ' : '▼ '}
                        {formatVND(row.plVnd)} <br /> ({formatPercent(row.plPercent)})
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SummaryCard({ title, value, sub, positive }) {
  return (
    <div className="rounded-card bg-white p-5 shadow-soft">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-gray-900 mt-2">{value}</p>
      {sub != null && (
        <p className={`mt-1 text-sm font-medium ${positive ? 'text-accent' : 'text-red-500'}`}>
          {positive ? '▲ ' : '▼ '}
          {sub}
        </p>
      )}
    </div>
  )
}
