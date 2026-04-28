import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Plus, MapPin, Clock, ChevronRight, X } from "lucide-react";
const offlineReasons = ["Machine maintenance", "Staff shortage", "Holiday", "Capacity full", "Other"];
const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function StoreListPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<any[]>([]);
  const [showReason, setShowReason] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vendor/stores`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch stores');
      const data = await res.json();
      const mapped = (data || []).map((s: any) => ({
        id: s._id || s.id,
        name: s.name,
        loc: s.code || s.location || s.loc || '',
        hours: s.workingHours || s.hours || '—',
        active: s.isActive ?? true,
        orders: s.activeOrders ?? s.orders ?? 0,
        capacity: s.maxOrdersPerDay ?? s.capacity ?? 0,
      }));
      setStores(mapped);
    } catch (e) {
      console.error(e);
      setStores([]);
    }
  };

  useEffect(() => { load(); }, []);

  const goOffline = async (id: string) => {
    if (!reason) return;
    try {
      const res = await fetch(`${API_BASE}/api/vendor/stores/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: false, reason }), credentials: 'include' });
      if (!res.ok) throw new Error('Failed to set offline');
      setStores(p => p.map(s => s.id === id ? { ...s, active: false } : s));
      setShowReason(null);
      setReason("");
    } catch (e) {
      console.error(e);
    }
  };

  const goOnline = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/vendor/stores/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: true }), credentials: 'include' });
      if (!res.ok) throw new Error('Failed to set online');
      setStores(p => p.map(s => s.id === id ? { ...s, active: true } : s));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">My Stores</h1>
          <p className="text-sm text-gray-500 mt-1">{stores.length} stores · Location never exposed to customers</p>
        </div>
        <button onClick={() => navigate("/stores/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition">
          <Plus size={15} /> New Store
        </button>
      </div>

      <div className="space-y-3">
        {stores.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Store size={18} className="text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.active ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-100 text-gray-500"}`}>
                  {s.active ? "Active" : "Offline"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={11} />{s.loc}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{s.hours}</span>
                <span>{s.orders} active orders</span>
                <span>Cap: {s.capacity}/day</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {s.active ? (
                <button onClick={() => setShowReason(s.id)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold border border-orange-200 text-orange-600 hover:bg-orange-50 transition">
                  Go Offline
                </button>
              ) : (
                <button onClick={() => goOnline(s.id)}
                  className="text-xs px-3 py-1.5 rounded-full font-semibold border border-green-200 text-green-700 hover:bg-green-50 transition">
                  Go Online
                </button>
              )}
              <button onClick={() => navigate(`/stores/${s.id}`)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition">
                Manage <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Offline reason modal */}
      {showReason && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Go Offline</h2>
              <button onClick={() => { setShowReason(null); setReason(""); }}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Select a reason. This is logged and affects routing.</p>
            <div className="space-y-2 mb-5">
              {offlineReasons.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${reason === r ? "bg-gray-900 text-white font-bold" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowReason(null); setReason(""); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={() => goOffline(showReason)} disabled={!reason}
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-50">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
