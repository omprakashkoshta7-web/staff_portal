import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'

const skus = ['Document Printing', 'Soft Binding', 'Spiral Binding', 'Business Cards']
const reasons = ['Machine maintenance', 'Staff shortage', 'Holiday', 'Capacity full', 'Other']

export default function StoreDetailPage() {
  const navigate = useNavigate()
  const [available, setAvailable] = useState(true)
  const [reason, setReason] = useState('')
  const [capacity, setCapacity] = useState('80')
  const [saved, setSaved] = useState(false)

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/stores')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition -ml-2">
        <ArrowLeft size={15} /> Back to Stores
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">SpeedCopy Downtown Hub</h1>
          <p className="text-xs text-gray-400 mt-1">Internal-001 · 9AM–9PM</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-bold ${available ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500'}`}>
          {available ? 'Active' : 'Offline'}
        </span>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Store Availability</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Accept new orders</p>
              <p className="text-xs text-gray-400">Toggle affects order routing automatically. Logged.</p>
            </div>
            <button onClick={() => setAvailable(a => !a)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {available ? 'Online' : 'Offline'}
            </button>
          </div>
          {!available && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Reason (required)</label>
              <select value={reason} onChange={e => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none">
                <option value="">Select reason</option>
                {reasons.map(r => <option key={r}>{r}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Reason is logged and reviewed by SpeedCopy</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Daily Capacity</h2>
          <div className="flex items-center gap-4">
            <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)}
              className="w-28 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:border-gray-900 transition" />
            <span className="text-sm text-gray-500">orders / day</span>
            <button onClick={() => setSaved(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition">
              <Save size={14} /> {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Upper bound enforced by SpeedCopy admin</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Supported SKUs</h2>
          <div className="flex flex-wrap gap-2">
            {skus.map(s => <span key={s} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-900 text-white">{s}</span>)}
          </div>
          <p className="text-xs text-gray-400 mt-3">Contact SpeedCopy to update SKU capabilities</p>
        </div>
      </div>
    </div>
  )
}
