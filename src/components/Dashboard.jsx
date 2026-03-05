import { useTransactions } from '../context/TransactionContext'
import { useGoldPrice } from '../hooks/useGoldPrice'
import { computePortfolioByType, computePortfolioTotals } from '../utils/pl'
import { GOLD_TYPES, getLabelForGoldType } from '../constants'
import { getPricePerChiForType } from '../utils/goldPrice'
import { formatVND, formatNumber, formatPercent } from '../utils/format'

export default function Dashboard() {
  const { transactions } = useTransactions()
  const { spotVndPerChi, pricesByCode, loading, lastUpdated, refresh } = useGoldPrice()
  const byType = spotVndPerChi != null ? computePortfolioByType(transactions, spotVndPerChi, pricesByCode) : []
  const totals = computePortfolioTotals(byType)

  const handleRefresh = () => refresh()

  return (
    <div className="animate-fade-in space-y-8">
      {/* Live gold price ticker */}
      <section className="rounded-xl bg-white border border-gray-200 shadow-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-gold-dark mb-1">
              Giá vàng (Mihong)
            </h2>
            <p className="text-sm text-gray-500">
              Cập nhật lúc: {lastUpdated ? lastUpdated.toLocaleTimeString('vi-VN') : '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-colors disabled:opacity-60"
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin-slow' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Làm mới giá
          </button>
        </div>

        {loading && spotVndPerChi == null ? (
          <div className="mt-4 h-12 flex items-center text-gray-500">Đang tải giá...</div>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {GOLD_TYPES.map((t) => {
              const price = getPricePerChiForType(spotVndPerChi, t.value, pricesByCode) ?? 0
              return (
                <div
                  key={t.value}
                  className="rounded-lg bg-gray-50 py-3 px-4 border border-gray-200"
                >
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{t.label}</p>
                  <p className="font-display text-gold-dark font-semibold mt-1">
                    {formatVND(price)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">/ chỉ</p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Portfolio summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Tổng vốn đầu tư"
          value={formatVND(totals.totalCostBasis)}
          className="border-gold/20"
        />
        <SummaryCard
          title="Giá trị hiện tại"
          value={formatVND(totals.totalCurrentValue)}
          className="border-gold/20"
        />
        <SummaryCard
          title="Lợi nhuận / Lỗ"
          value={formatVND(totals.plVnd)}
          sub={formatPercent(totals.plPercent)}
          positive={totals.plVnd >= 0}
          className={totals.plVnd >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}
        />
        <SummaryCard
          title="Tổng số lượng vàng"
          value={`${formatNumber(totals.totalChi, 2)} chỉ`}
          className="border-gold/20"
        />
      </section>

      {/* Breakdown table */}
      <section className="rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden animate-slide-up">
        <h2 className="font-display text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200">
          Chi tiết theo loại vàng
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Loại vàng</th>
                <th className="px-6 py-3 font-medium">Số lượng (chỉ)</th>
                <th className="px-6 py-3 font-medium">Đơn giá TB mua</th>
                <th className="px-6 py-3 font-medium">Giá hiện tại</th>
                <th className="px-6 py-3 font-medium">Lợi nhuận / Lỗ</th>
              </tr>
            </thead>
            <tbody>
              {byType.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Chưa có giao dịch. Thêm giao dịch tại mục Nhập Giao Dịch.
                  </td>
                </tr>
              ) : (
                byType.map((row) => (
                  <tr
                    key={row.goldType}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {getLabelForGoldType(row.goldType)}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{formatNumber(row.netQty, 2)}</td>
                    <td className="px-6 py-3 text-gray-600">{formatVND(row.avgCost)}</td>
                    <td className="px-6 py-3 text-gold-dark">{formatVND(row.currentPricePerChi)}</td>
                    <td className="px-6 py-3">
                      <span
                        className={
                          row.plVnd >= 0
                            ? 'text-emerald-400 font-medium'
                            : 'text-red-400 font-medium'
                        }
                      >
                        {row.plVnd >= 0 ? '▲ ' : '▼ '}
                        {formatVND(row.plVnd)} ({formatPercent(row.plPercent)})
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

function SummaryCard({ title, value, sub, positive, className = '' }) {
  return (
    <div
      className={`rounded-xl bg-white border border-gray-200 shadow-card p-5 ${className}`}
    >
      <p className="text-sm text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="font-display text-xl font-semibold text-gray-900 mt-2">{value}</p>
      {sub != null && (
        <p
          className={`mt-1 text-sm font-medium ${
            positive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {positive ? '▲ ' : '▼ '}
          {sub}
        </p>
      )}
    </div>
  )
}
