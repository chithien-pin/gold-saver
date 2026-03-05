import { useState, useMemo } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { GOLD_TYPES, getLabelForGoldType } from '../constants'
import { formatVND, formatNumber, formatDate } from '../utils/format'

export default function TransactionHistory() {
  const { transactions, deleteTransaction } = useTransactions()
  const [filterGoldType, setFilterGoldType] = useState('')
  const [filterType, setFilterType] = useState('') // buy | sell | ''
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (filterGoldType) {
      list = list.filter((t) => t.goldType === filterGoldType)
    }
    if (filterType) {
      list = list.filter((t) => t.type === filterType)
    }
    if (dateFrom) {
      list = list.filter((t) => t.date >= dateFrom)
    }
    if (dateTo) {
      list = list.filter((t) => t.date <= dateTo)
    }
    list.sort((a, b) => (b.date < a.date ? -1 : 1))
    return list
  }, [transactions, filterGoldType, filterType, dateFrom, dateTo])

  const handleDelete = (id) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteTransaction(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Filters */}
      <section className="rounded-xl bg-white border border-gray-200 shadow-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Loại vàng</label>
            <select
              value={filterGoldType}
              onChange={(e) => setFilterGoldType(e.target.value)}
              className="rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-3 py-2 text-sm focus:border-gold/50 outline-none"
            >
              <option value="">Tất cả</option>
              {GOLD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mua/Bán</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-3 py-2 text-sm focus:border-gold/50 outline-none"
            >
              <option value="">Tất cả</option>
              <option value="buy">Mua</option>
              <option value="sell">Bán</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-3 py-2 text-sm focus:border-gold/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-3 py-2 text-sm focus:border-gold/50 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-xl bg-white border border-gray-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600 text-sm border-b border-gray-200 bg-gray-50">
                <th className="px-4 md:px-6 py-3 font-medium">Ngày</th>
                <th className="px-4 md:px-6 py-3 font-medium">Loại Vàng</th>
                <th className="px-4 md:px-6 py-3 font-medium">Mua/Bán</th>
                <th className="px-4 md:px-6 py-3 font-medium">Số Lượng (chỉ)</th>
                <th className="px-4 md:px-6 py-3 font-medium">Đơn Giá</th>
                <th className="px-4 md:px-6 py-3 font-medium">Thành Tiền</th>
                <th className="px-4 md:px-6 py-3 font-medium hidden sm:table-cell">Ghi Chú</th>
                <th className="px-4 md:px-6 py-3 font-medium w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-600">
                      <svg
                        className="w-14 h-14 text-gold/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p>Chưa có giao dịch nào.</p>
                      <p className="text-sm">Thêm giao dịch tại mục Nhập Giao Dịch.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const total = tx.quantity * tx.pricePerChi
                  const isBuy = tx.type === 'buy'
                  return (
                    <tr
                      key={tx.id}
                      className={`border-b border-gray-200 transition-colors ${
                        isBuy
                          ? 'bg-amber-50 hover:bg-amber-100'
                          : 'bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      <td className="px-4 md:px-6 py-3 text-gray-900 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-900">
                        {getLabelForGoldType(tx.goldType)}
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <span
                          className={
                            isBuy
                              ? 'text-amber-400 font-medium'
                              : 'text-red-400 font-medium'
                          }
                        >
                          {isBuy ? 'Mua' : 'Bán'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-600">
                        {formatNumber(tx.quantity, 2)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-600">
                        {formatVND(tx.pricePerChi)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-900 font-medium">
                        {formatVND(total)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-600 hidden sm:table-cell max-w-[180px] truncate">
                        {tx.note || '—'}
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
                          className="text-red-400 hover:text-red-300 text-sm transition-colors"
                          aria-label="Xóa"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="rounded-xl bg-white border border-gray-200 shadow-card p-6 max-w-sm w-full animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-900 font-medium mb-4">
              Bạn có chắc muốn xóa giao dịch này?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
