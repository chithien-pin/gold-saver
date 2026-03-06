import { useState, useMemo } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { GOLD_TYPES, getLabelForGoldType } from '../constants'
import { formatVND, formatNumber, formatDateShort } from '../utils/format'

export default function TransactionHistory({ onNavigateToAdd }) {
  const { transactions, deleteTransaction, loading: transactionsLoading } = useTransactions()
  const [filterGoldType, setFilterGoldType] = useState('')
  const [filterType, setFilterType] = useState('') // buy | sell | ''
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

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

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    setDeleteError(null)
    setDeleting(true)
    try {
      await deleteTransaction(deleteConfirm)
      setDeleteConfirm(null)
    } catch (err) {
      setDeleteError(err.message || 'Không thể xóa.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <section className="rounded-card bg-white shadow-soft p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Loại vàng</label>
            <select
              value={filterGoldType}
              onChange={(e) => setFilterGoldType(e.target.value)}
              className="rounded-xl bg-surface border border-gray-200 text-gray-900 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
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
              className="rounded-xl bg-surface border border-gray-200 text-gray-900 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
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
              className="rounded-xl bg-surface border border-gray-200 text-gray-900 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl bg-surface border border-gray-200 text-gray-900 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-card bg-white shadow-soft overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h2>
            <p className="text-sm text-gray-500">Xem, lọc và quản lý các giao dịch đã thêm</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm border-b border-gray-100 bg-gray-50/80">
                <th className="px-4 md:px-6 py-3 font-medium whitespace-nowrap">Ngày</th>
                <th className="px-4 md:px-6 py-3 font-medium whitespace-nowrap">Loại</th>
                <th className="px-4 md:px-6 py-3 font-medium whitespace-nowrap">Vàng · Giá</th>
                <th className="px-4 md:px-6 py-3 font-medium whitespace-nowrap">Thành Tiền</th>
                <th className="px-4 md:px-6 py-3 font-medium hidden sm:table-cell whitespace-nowrap">Ghi Chú</th>
                <th className="px-4 md:px-6 py-3 font-medium w-20 whitespace-nowrap">—</th>
              </tr>
            </thead>
            <tbody>
              {transactionsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-600">
                    Đang tải giao dịch…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-600">
                      <svg
                        className="w-14 h-14 text-gray-300"
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
                      {onNavigateToAdd && (
                        <button
                          type="button"
                          onClick={onNavigateToAdd}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors shadow-soft"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Thêm giao dịch
                        </button>
                      )}
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
                      className={`border-b border-gray-100 transition-colors ${
                        isBuy
                          ? 'bg-primary/5 hover:bg-primary/10'
                          : 'bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      <td className="px-4 md:px-6 py-3 text-gray-900 whitespace-nowrap">
                        {formatDateShort(tx.date)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-900">
                        {getLabelForGoldType(tx.goldType)}
                      </td>
                      <td className="px-4 md:px-6 py-3 align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className={isBuy ? 'text-accent font-medium' : 'text-red-500 font-medium'}>
                            {formatNumber(tx.quantity, 2)} chỉ
                          </span>
                          <span className="text-gray-500 text-sm whitespace-nowrap">{formatVND(tx.pricePerChi)}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-900 font-bold whitespace-nowrap">
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
            className="rounded-card bg-white shadow-soft-lg p-6 max-w-sm w-full animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-900 font-medium mb-4">
              Bạn có chắc muốn xóa giao dịch này?
            </p>
            {deleteError && (
              <p className="text-sm text-red-500 mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setDeleteConfirm(null); setDeleteError(null) }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-50"
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? 'Đang xóa…' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
