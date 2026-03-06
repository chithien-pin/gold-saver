import { useState } from 'react'
import { useTransactions } from '../context/TransactionContext'
import { GOLD_TYPES } from '../constants'

const initialForm = {
  goldType: 'SJC',
  type: 'buy',
  quantity: '',
  pricePerChi: '',
  date: new Date().toISOString().slice(0, 10),
  note: '',
}

export default function AddTransaction() {
  const { addTransaction } = useTransactions()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  function validate() {
    const e = {}
    if (!form.goldType) e.goldType = 'Vui lòng chọn loại vàng'
    const q = Number(form.quantity)
    if (form.quantity === '' || Number.isNaN(q) || q <= 0)
      e.quantity = 'Số lượng phải là số dương'
    const p = Number(String(form.pricePerChi).replace(/\D/g, ''))
    if (!form.pricePerChi || p <= 0) e.pricePerChi = 'Đơn giá không hợp lệ'
    if (!form.date) e.date = 'Vui lòng chọn ngày'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  function handlePriceInput(value) {
    const digits = value.replace(/\D/g, '')
    handleChange('pricePerChi', digits ? parseInt(digits, 10).toLocaleString('vi-VN') : '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      const priceNum = Number(String(form.pricePerChi).replace(/\D/g, ''))
      await addTransaction({
        goldType: form.goldType,
        type: form.type,
        quantity: Number(form.quantity),
        pricePerChi: priceNum,
        date: form.date,
        note: form.note.trim() || undefined,
      })
      setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) })
      setErrors({})
    } catch (err) {
      setApiError(err.message || 'Không thể lưu. Kiểm tra kết nối hoặc quyền Sheet.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <section className="rounded-card bg-white shadow-soft overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Nhập Giao Dịch</h2>
            <p className="text-sm text-gray-500">Thêm giao dịch mua hoặc bán vàng vào danh mục</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Loại vàng <span className="text-red-400">*</span>
            </label>
            <select
              value={form.goldType}
              onChange={(e) => handleChange('goldType', e.target.value)}
              className="w-full rounded-xl bg-surface border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            >
              {GOLD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.goldType && (
              <p className="mt-1 text-sm text-red-400">{errors.goldType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Loại giao dịch <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="buy"
                  checked={form.type === 'buy'}
                  onChange={() => handleChange('type', 'buy')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-gray-900">Mua</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="sell"
                  checked={form.type === 'sell'}
                  onChange={() => handleChange('type', 'sell')}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-gray-900">Bán</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Số lượng (chỉ) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="w-full rounded-xl bg-surface border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="0.0"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-400">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Đơn giá (VNĐ/chỉ) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.pricePerChi}
                onChange={(e) => handlePriceInput(e.target.value)}
                className="w-full rounded-xl bg-surface border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder="18.820.000"
              />
              {errors.pricePerChi && (
                <p className="mt-1 text-sm text-red-400">{errors.pricePerChi}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Ngày giao dịch <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full rounded-xl bg-surface border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-400">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Ghi chú
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className="w-full rounded-xl bg-surface border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              placeholder="Tùy chọn"
            />
          </div>

          {apiError && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang lưu…' : 'Thêm Giao Dịch'}
          </button>
        </form>
      </section>
    </div>
  )
}
