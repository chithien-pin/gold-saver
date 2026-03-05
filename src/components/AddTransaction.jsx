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

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    const priceNum = Number(String(form.pricePerChi).replace(/\D/g, ''))
    addTransaction({
      goldType: form.goldType,
      type: form.type,
      quantity: Number(form.quantity),
      pricePerChi: priceNum,
      date: form.date,
      note: form.note.trim() || undefined,
    })
    setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) })
    setErrors({})
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <section className="rounded-xl bg-white border border-gray-200 shadow-card p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold text-gold-dark mb-6">
          Nhập Giao Dịch
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Loại vàng <span className="text-red-400">*</span>
            </label>
            <select
              value={form.goldType}
              onChange={(e) => handleChange('goldType', e.target.value)}
              className="w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition"
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
                  className="text-gold focus:ring-gold"
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
                  className="text-gold focus:ring-gold"
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
                className="w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition"
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
                className="w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition"
                placeholder="85.000.000"
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
              className="w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition"
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
              className="w-full rounded-lg bg-gray-50 border border-gray-200 text-gray-900 px-4 py-2.5 focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition"
              placeholder="Tùy chọn"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gold text-gray-900 font-semibold hover:bg-gold-light transition-colors shadow-gold-sm"
          >
            Thêm Giao Dịch
          </button>
        </form>
      </section>
    </div>
  )
}
