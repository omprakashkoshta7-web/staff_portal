import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronRight, AlertTriangle, RefreshCw } from "lucide-react";
const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function JobQueuePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [jobs, setJobs] = useState<any[]>([]);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      const mapped = (data || []).map((o: any) => ({
        id: o.orderId || o._id || o.id,
        type: o.title || o.type || (o.items && o.items[0] && o.items[0].name) || 'Order',
        specs: o.specs || (o.items && o.items.map((it:any) => `${it.qty} x ${it.name}`).join(' · ')) || '',
        store: o.store?.name || o.store || o.vendor || 'Unassigned',
        sla: o.sla || o.slaRemaining || '—',
        priority: o.priority || (o.isUrgent ? 'urgent' : 'normal'),
        status: o.status || 'pending',
      }));
      setJobs(mapped);
    } catch (e) {
      console.error(e);
      setJobs([]);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? jobs : jobs.filter(j => j.priority === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">Job Queue</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} assigned orders · Customer data masked</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition" title="Refresh">
            <RefreshCw size={15} className="text-gray-500" />
          </button>
          <div className="flex gap-1.5">
            {["all", "urgent", "high", "normal"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(job => (
          <div key={job.id} onClick={() => navigate(`/orders/${job.id}`, { state: { job } })}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:border-gray-300 hover:shadow-sm transition cursor-pointer">
            <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${job.priority === "urgent" ? "bg-red-500" : job.priority === "high" ? "bg-orange-400" : "bg-gray-200"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-gray-900 text-sm">{job.type}</p>
                <span className="text-xs text-gray-400 font-mono">{job.id}</span>
                {job.priority === "urgent" && (
                  <span className="flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle size={10} /> URGENT
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{job.specs}</p>
              <p className="text-xs text-gray-400 mt-0.5">Store: {job.store}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`flex items-center gap-1.5 text-sm font-bold mb-1 ${job.priority === "urgent" ? "text-red-600" : "text-gray-700"}`}>
                <Clock size={13} /> {job.sla}
              </div>
              <p className="text-xs text-gray-400">SLA remaining</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400 font-semibold">No jobs in queue</p>
            <p className="text-xs text-gray-300 mt-1">New jobs will appear here when assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}
