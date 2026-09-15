import { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { getLabelForGoldType } from '../constants'
import { formatVND, formatNumber } from '../utils/format'

const CHART_COLORS = ['#5c67f2', '#f4a27e', '#5bb98c', '#c3c7f9', '#3d4494', '#e57373']

function shortLabel(goldType) {
  const label = getLabelForGoldType(goldType) || goldType
  if (label.length <= 18) return label
  return `${label.slice(0, 16)}…`
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-card border border-border px-3 py-2 shadow-soft text-sm">
      {label != null && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.dataKey || entry.name} className="text-muted-foreground">
          <span style={{ color: entry.color || entry.fill }}>{entry.name}: </span>
          <span className="font-semibold text-foreground">
            {typeof entry.value === 'number' ? formatVND(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  if (!item) return null
  return (
    <div className="rounded-xl bg-card border border-border px-3 py-2 shadow-soft text-sm">
      <p className="font-medium text-foreground mb-1">{item.fullName}</p>
      <p className="text-muted-foreground">
        Giá trị: <span className="font-semibold text-foreground">{formatVND(item.value)}</span>
      </p>
      <p className="text-muted-foreground">
        Số lượng: <span className="font-semibold text-foreground">{formatNumber(item.qty, 2)} chỉ</span>
      </p>
      <p className="text-muted-foreground">
        Tỷ trọng: <span className="font-semibold text-foreground">{item.percent}%</span>
      </p>
    </div>
  )
}

export default function PortfolioCharts({ byType, totals }) {
  const pieData = useMemo(() => {
    const total = totals?.totalCurrentValue || 0
    return (byType || [])
      .filter((row) => row.currentValue > 0)
      .map((row) => ({
        name: shortLabel(row.goldType),
        fullName: getLabelForGoldType(row.goldType) || row.goldType,
        value: row.currentValue,
        qty: row.netQty,
        percent: total > 0 ? ((row.currentValue / total) * 100).toFixed(1) : '0.0',
      }))
  }, [byType, totals])

  const barData = useMemo(
    () =>
      (byType || []).map((row) => ({
        name: shortLabel(row.goldType),
        fullName: getLabelForGoldType(row.goldType) || row.goldType,
        'Vốn đầu tư': Math.round(row.costBasis),
        'Giá trị hiện tại': Math.round(row.currentValue),
        'Lời / Lỗ': Math.round(row.plVnd),
      })),
    [byType]
  )

  if (!byType?.length) {
    return (
      <section className="rounded-card bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground">Biểu đồ danh mục</h2>
        <p className="text-sm text-muted-foreground mt-1">Thêm giao dịch để xem phân bổ và lời/lỗ</p>
        <div className="mt-8 h-40 flex items-center justify-center text-sm text-muted-foreground bg-muted rounded-xl">
          Chưa có dữ liệu biểu đồ
        </div>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-card bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground">Phân bổ giá trị</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Theo giá trị hiện tại từng loại vàng</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-card bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground">Vốn với giá trị hiện tại</h2>
        <p className="text-sm text-muted-foreground mt-0.5">So sánh vốn đầu tư và giá trị theo loại</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e7f4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8b90a8', fontSize: 11 }}
                axisLine={{ stroke: '#e4e7f4' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8b90a8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1_000_000)}tr`}
                width={42}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
              <Bar dataKey="Vốn đầu tư" fill="#c3c7f9" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Giá trị hiện tại" fill="#5c67f2" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
