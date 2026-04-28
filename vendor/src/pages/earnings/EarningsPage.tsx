import { useState } from 'react'
import { TrendingUp, Store, AlertCircle } from 'lucide-react'

const stores = [
  { store: 'Downtown Hub', completed: 45, earnings: 12400, deductions: 200 },
  { store: 'North Station', completed: 28, earnings: 7800, deductions: 0 },
  { store: 'University Hub', completed: 12, earnings: 3200, deductions: 150 },
]

const deductions = [
  { date: '14 Apr', reason: 'QC Failure - Reprint', amount: 200, job: 'JOB-089' },
  { date: '10 Apr', reason: 'SLA Breach', amount: 150, job: 'JOB-071' },
]

export default function EarningsPage() {
  const [period, setPeriod] = useState('weekly')
  const total = stores.reduce((s, e) => s + e.earnings - e.deductions, 0)
  const totalDed = stores.reduce((s, e) => s + e.deductions, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">Earnings</h1>
          <p className="text-sm text-gray-500 mt-1">Owner view only · Read-only</p>
        </div>
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${period === p ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Earnings', value: `Rs.${total.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Total Deductions', value: `Rs.${totalDed}`, icon: AlertCircle, color: 'text-red-500' },
          { label: 'Net Payable', value: `Rs.${total.toLocaleString()}`, icon: Store, color: 'text-blue-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={15} className={c.color} />
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
            <p className="text-2xl font-black text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <h2 className="font-bold text-gray-900 text-sm mb-4">Store-wise Breakdown</h2>
        {stores.map(s => (
          <div key={s.store} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <Store size={14} className="text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.store}</p>
                <p className="text-xs text-gray-400">{s.completed} jobs completed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Rs.{s.earnings.toLocaleString()}</p>
              {s.deductions > 0 && <p className="text-xs text-red-500">-Rs.{s.deductions} deducted</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-sm mb-4">Deductions</h2>
        {deductions.map(d => (
          <div key={d.job} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-semibold text-gray-800">{d.reason}</p>
              <p className="text-xs text-gray-400">{d.date} · {d.job}</p>
            </div>
            <span className="text-sm font-bold text-red-500">Rs.{d.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
