import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const skus = ['Document Printing', 'Soft Binding', 'Spiral Binding', 'Thesis Binding', 'Business Cards', 'Flyers', 'Posters']

export default function CreateStorePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', locationId: '', openTime: '09:00', closeTime: '21:00', capacity: '50' })
  const [selectedSkus, setSelectedSkus] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const toggle = (s: string) => setSelectedSkus(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setDone(true)
    setTimeout(() => navigate('/stores'), 1500)
  }

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/stores')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition -ml-2">
        <ArrowLeft size={15} /> Back to Stores
      </button>
      <h1 className="text-xl font-black text-gray-900 mb-6">Create New Store</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm">Store Information</h2>
          {[
            { label: 'Store Name', key: 'name', placeholder: 'e.g. SpeedCopy Andheri Hub' },
            { label: 'Internal Location ID', key: 'locationId', placeholder: 'e.g. Internal-004 (never shown to customers)' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
              <input required value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'Opening Time', key: 'openTime', type: 'time' }, { label: 'Closing Time', key: 'closeTime', type: 'time' }, { label: 'Daily Capacity', key: 'capacity', type: 'number' }].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">Upper bound enforced by SpeedCopy</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 text-sm mb-1">Supported SKUs</h2>
          <p className="text-xs text-gray-400 mb-4">Must match SpeedCopy catalog</p>
          <div className="flex flex-wrap gap-2">
            {skus.map(s => (
              <button key={s} type="button" onClick={() => toggle(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${selectedSkus.includes(s) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button type="submit"
          className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition">
          {done ? 'Store Created!' : 'Create Store'}
        </button>
      </form>
    </div>
  )
}
