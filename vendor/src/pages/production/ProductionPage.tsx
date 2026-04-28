import { useEffect, useState } from 'react'
import { Printer, Upload, CheckCircle } from 'lucide-react'

const statusCfg: Record<string, { label: string; cls: string }> = {
  in_production: { label: 'In Production', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  qc: { label: 'QC Review', cls: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  ready: { label: 'Ready for Pickup', cls: 'bg-green-50 text-green-700 border-green-100' },
}

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function ProductionPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [uploads, setUploads] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      const mapped = (data || []).filter((o:any) => ['in_production','qc','ready'].includes(o.status || o.stage)).map((o:any) => ({
        id: o.orderId || o._id || o.id,
        type: o.title || (o.items && o.items[0] && o.items[0].name) || 'Order',
        specs: o.specs || (o.items && o.items.map((it:any)=>`${it.qty} x ${it.name}`).join(' · ')) || '',
        store: o.store?.name || o.store || o.vendor || 'Unassigned',
        status: o.status || o.stage || 'in_production',
      }));
      setJobs(mapped);
    } catch (e) {
      console.error(e);
      setJobs([]);
    }
  }

  useEffect(() => { load(); }, [])

  const next = async (id: string, to: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: to }), credentials: 'include' });
      if (!res.ok) throw new Error('Failed to update job status');
      setJobs(p => p.map(j => j.id === id ? { ...j, status: to } : j));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-gray-900">Production</h1>
        <p className="text-sm text-gray-500 mt-1">Track jobs through production to handover</p>
      </div>

      <div className="space-y-4">
        {jobs.map(job => {
          const cfg = statusCfg[job.status]
          return (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Printer size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{job.id} · {job.type}</p>
                    <p className="text-xs text-gray-400">{job.specs} · {job.store}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${cfg.cls}`}>{cfg.label}</span>
              </div>

              <div className="flex items-center gap-3">
                {job.status === 'in_production' && (
                  <>
                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-50 transition">
                      <Upload size={13} /> Upload QC Proof
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) setUploads(p => ({ ...p, [job.id]: f.name }))
                      }} />
                    </label>
                    {uploads[job.id] && <span className="text-xs text-green-600 font-semibold">{uploads[job.id]}</span>}
                    <button onClick={() => next(job.id, 'qc')}
                      className="ml-auto px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition">
                      Move to QC
                    </button>
                  </>
                )}
                {job.status === 'qc' && (
                  <button onClick={() => next(job.id, 'ready')}
                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition">
                    <CheckCircle size={13} /> Mark Ready for Pickup
                  </button>
                )}
                {job.status === 'ready' && (
                  <div className="ml-auto flex items-center gap-2 text-xs font-bold text-green-700">
                    <CheckCircle size={14} /> Awaiting pickup · Timestamped
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
