import { useState, useMemo, useEffect } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { GOLD_TYPES, getLabelForGoldType } from '../constants'
import { useGoldPrice } from '../hooks/useGoldPrice'
import { formatVND, formatNumber, formatDateShort } from '../utils/format'

function formatPriceInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits ? parseInt(digits, 10).toLocaleString('vi-VN') : ''
}

export default function TransactionHistory({ onNavigateToAdd }) {
  const { transactions, updateTransaction, deleteTransaction, loading: transactionsLoading } = useTransactions()
  const { rateItems } = useGoldPrice()
  const [filterGoldType, setFilterGoldType] = useState('')
  const [filterType, setFilterType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [editingTx, setEditingTx] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editErrors, setEditErrors] = useState({})
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editApiError, setEditApiError] = useState(null)

  const goldTypeOptions = useMemo(() => {
    const mapped = (Array.isArray(rateItems) ? rateItems : [])
      .map((item) => {
        const code = String(item?.code || '').trim()
        const name = String(item?.name || '').trim()
        const value = code || name
        if (!value) return null
        return { value, label: name || code }
      })
      .filter(Boolean)

    const unique = new Map()
    for (const item of mapped) {
      if (!unique.has(item.value)) unique.set(item.value, item)
    }

    if (editingTx?.goldType && !unique.has(editingTx.goldType)) {
      unique.set(editingTx.goldType, {
        value: editingTx.goldType,
        label: getLabelForGoldType(editingTx.goldType) || editingTx.goldType,
      })
    }

    if (unique.size === 0) {
      return GOLD_TYPES.map((t) => ({ value: t.value, label: t.label }))
    }
    return Array.from(unique.values())
  }, [rateItems, editingTx])

  const filterGoldOptions = useMemo(() => {
    const values = new Map()
    for (const tx of transactions) {
      if (!tx.goldType || values.has(tx.goldType)) continue
      values.set(tx.goldType, {
        value: tx.goldType,
        label: getLabelForGoldType(tx.goldType) || tx.goldType,
      })
    }
    for (const opt of goldTypeOptions) {
      if (!values.has(opt.value)) values.set(opt.value, opt)
    }
    return Array.from(values.values())
  }, [transactions, goldTypeOptions])

  const filtered = useMemo(() => {
    let list = [...transactions]
    if (filterGoldType) list = list.filter((t) => t.goldType === filterGoldType)
    if (filterType) list = list.filter((t) => t.type === filterType)
    if (dateFrom) list = list.filter((t) => t.date >= dateFrom)
    if (dateTo) list = list.filter((t) => t.date <= dateTo)
    list.sort((a, b) => (b.date < a.date ? -1 : 1))
    return list
  }, [transactions, filterGoldType, filterType, dateFrom, dateTo])

  useEffect(() => {
    if (!editingTx) {
      setEditForm(null)
      return
    }
    setEditForm({
      goldType: editingTx.goldType || '',
      type: editingTx.type === 'sell' ? 'sell' : 'buy',
      quantity: String(editingTx.quantity ?? ''),
      pricePerChi: formatPriceInput(editingTx.pricePerChi),
      date: editingTx.date || '',
      note: editingTx.note || '',
    })
    setEditErrors({})
    setEditApiError(null)
  }, [editingTx])

  const handleDelete = (id) => setDeleteConfirm(id)

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

  function handleEditChange(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: null }))
  }

  function handleEditPriceInput(value) {
    handleEditChange('pricePerChi', formatPriceInput(value))
  }

  function validateEdit() {
    if (!editForm) return false
    const e = {}
    if (!editForm.goldType) e.goldType = 'Vui lòng chọn loại vàng'
    const q = Number(editForm.quantity)
    if (editForm.quantity === '' || Number.isNaN(q) || q <= 0) e.quantity = 'Số lượng phải là số dương'
    const p = Number(String(editForm.pricePerChi).replace(/\D/g, ''))
    if (!editForm.pricePerChi || p <= 0) e.pricePerChi = 'Đơn giá không hợp lệ'
    if (!editForm.date) e.date = 'Vui lòng chọn ngày'
    setEditErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    if (!editingTx || !editForm) return
    setEditApiError(null)
    if (!validateEdit()) return
    setEditSubmitting(true)
    try {
      await updateTransaction({
        id: editingTx.id,
        goldType: editForm.goldType,
        type: editForm.type,
        quantity: Number(editForm.quantity),
        pricePerChi: Number(String(editForm.pricePerChi).replace(/\D/g, '')),
        date: editForm.date,
        note: editForm.note.trim() || '',
      })
      setEditingTx(null)
    } catch (err) {
      setEditApiError(err.message || 'Không thể cập nhật giao dịch.')
    } finally {
      setEditSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-card bg-card shadow-soft p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Loại vàng</label>
            <select
              value={filterGoldType}
              onChange={(e) => setFilterGoldType(e.target.value)}
              className="rounded-xl bg-muted border border-border text-foreground px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Tất cả</option>
              {filterGoldOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Mua/Bán</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl bg-muted border border-border text-foreground px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Tất cả</option>
              <option value="buy">Mua</option>
              <option value="sell">Bán</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl bg-muted border border-border text-foreground px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl bg-muted border border-border text-foreground px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>
      </section>

      <section className="rounded-card bg-card shadow-soft overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Lịch sử giao dịch</h2>
            <p className="text-sm text-muted-foreground">Xem, lọc, sửa và quản lý các giao dịch đã thêm</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-muted-foreground text-sm border-b border-border bg-muted/80">
                <th className="px-4 md:px-6 py-3 font-medium whitespace-nowrap">Ngày</th>
                <th className="px-4 md:px-6 py-3 font-medium whitespace-nowrap">Loại</th>
                <th className="px-4 md:px-6 py-3 font-medium whitespace-nowrap">Vàng · Giá</th>
                <th className="px-4 md:px-6 py-3 font-medium whitespace-nowrap">Thành Tiền</th>
                <th className="px-4 md:px-6 py-3 font-medium hidden sm:table-cell whitespace-nowrap">Ghi Chú</th>
                <th className="px-4 md:px-6 py-3 font-medium whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transactionsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                    Đang tải giao dịch…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <svg className="w-14 h-14 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p>Chưa có giao dịch nào.</p>
                      <p className="text-sm">Thêm giao dịch tại mục Nhập Giao Dịch.</p>
                      {onNavigateToAdd && (
                        <button
                          type="button"
                          onClick={onNavigateToAdd}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary-dark transition-colors shadow-soft"
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
                      className={`border-b border-border transition-colors ${
                        isBuy ? 'bg-primary/5 hover:bg-primary/10' : 'bg-coral-soft hover:bg-coral-soft'
                      }`}
                    >
                      <td className="px-4 md:px-6 py-3 text-foreground whitespace-nowrap">
                        {formatDateShort(tx.date)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-foreground">
                        {getLabelForGoldType(tx.goldType) || tx.goldType}
                      </td>
                      <td className="px-4 md:px-6 py-3 align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className={isBuy ? 'text-success font-medium' : 'text-destructive font-medium'}>
                            {formatNumber(tx.quantity, 2)} chỉ
                          </span>
                          <span className="text-muted-foreground text-sm whitespace-nowrap">{formatVND(tx.pricePerChi)}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 text-foreground font-bold whitespace-nowrap">
                        {formatVND(total)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-muted-foreground hidden sm:table-cell max-w-[180px] truncate">
                        {tx.note || '—'}
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingTx(tx)}
                            className="text-primary hover:underline text-sm transition-colors"
                            aria-label="Sửa"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tx.id)}
                            className="text-destructive hover:underline text-sm transition-colors"
                            aria-label="Xóa"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editingTx && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
          onClick={() => !editSubmitting && setEditingTx(null)}
        >
          <div
            className="rounded-card bg-card shadow-soft-lg p-6 max-w-lg w-full animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">Sửa giao dịch</h3>
            <p className="text-sm text-muted-foreground mb-5">Cập nhật thông tin giao dịch đã lưu</p>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Loại vàng</label>
                <select
                  value={editForm.goldType}
                  onChange={(e) => handleEditChange('goldType', e.target.value)}
                  className="w-full rounded-xl bg-muted border border-border text-foreground px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {goldTypeOptions.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {editErrors.goldType && <p className="mt-1 text-sm text-destructive">{editErrors.goldType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Loại giao dịch</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-type"
                      checked={editForm.type === 'buy'}
                      onChange={() => handleEditChange('type', 'buy')}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-foreground">Mua</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-type"
                      checked={editForm.type === 'sell'}
                      onChange={() => handleEditChange('type', 'sell')}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-foreground">Bán</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Số lượng (chỉ)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editForm.quantity}
                    onChange={(e) => handleEditChange('quantity', e.target.value)}
                    className="w-full rounded-xl bg-muted border border-border text-foreground px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  {editErrors.quantity && <p className="mt-1 text-sm text-destructive">{editErrors.quantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Đơn giá (VNĐ/chỉ)</label>
                  <input
                    type="text"
                    value={editForm.pricePerChi}
                    onChange={(e) => handleEditPriceInput(e.target.value)}
                    className="w-full rounded-xl bg-muted border border-border text-foreground px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  {editErrors.pricePerChi && <p className="mt-1 text-sm text-destructive">{editErrors.pricePerChi}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Ngày giao dịch</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => handleEditChange('date', e.target.value)}
                  className="w-full rounded-xl bg-muted border border-border text-foreground px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
                {editErrors.date && <p className="mt-1 text-sm text-destructive">{editErrors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Ghi chú</label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => handleEditChange('note', e.target.value)}
                  className="w-full rounded-xl bg-muted border border-border text-foreground px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Tùy chọn"
                />
              </div>

              {editApiError && (
                <p className="text-sm text-destructive bg-coral-soft px-4 py-2.5 rounded-xl">{editApiError}</p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted"
                  disabled={editSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-dark disabled:opacity-60"
                >
                  {editSubmitting ? 'Đang lưu…' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="rounded-card bg-card shadow-soft-lg p-6 max-w-sm w-full animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-foreground font-medium mb-4">
              Bạn có chắc muốn xóa giao dịch này?
            </p>
            {deleteError && (
              <p className="text-sm text-destructive mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setDeleteConfirm(null); setDeleteError(null) }}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted"
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-destructive text-primary-foreground hover:bg-destructive/90 disabled:opacity-60"
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
