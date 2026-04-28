import { useEffect, useState } from "react";
import { Plus, Shield, Clock, X, CheckCircle, Store } from "lucide-react";

const roles = ["Operator", "Supervisor", "Manager"];
const allStores = ["Downtown Hub", "North Station", "University Hub"];

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function StaffListPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", stores: [] as string[] });
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/vendor/staff`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch staff');
        const data = await res.json();
        // map backend shape to UI-friendly fields if needed
        const mapped = (data || []).map((s: any) => ({
          id: s._id || s.id,
          name: s.name,
          role: s.role || s.designation || 'Operator',
          stores: s.store ? [s.store.name || s.store] : (s.stores || []),
          active: s.isActive ?? s.active ?? true,
          since: s.createdAt ? new Date(s.createdAt).toLocaleString(undefined, { month: 'short', year: 'numeric' }) : '—',
        }));
        setStaff(mapped);
      } catch (e) {
        // keep empty list on error — optional: show toast
        console.error(e);
      }
    };
    load();
  }, []);

  const toggleStore = (store: string) => {
    setForm(p => ({
      ...p,
      stores: p.stores.includes(store) ? p.stores.filter(s => s !== store) : [...p.stores, store],
    }));
  };

  const handleAdd = async () => {
    if (!form.name || !form.role || form.stores.length === 0) return;
    try {
      const payload = { name: form.name, role: form.role.toLowerCase(), storeId: form.stores[0] };
      const res = await fetch(`${API_BASE}/api/vendor/staff`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
      if (!res.ok) throw new Error('Failed to add staff');
      const created = await res.json();
      const newItem = {
        id: created._id || created.id || `s${Date.now()}`,
        name: created.name || form.name,
        role: created.role || form.role,
        stores: created.store ? [created.store.name || created.store] : form.stores,
        active: created.isActive ?? true,
        since: created.createdAt ? new Date(created.createdAt).toLocaleString(undefined, { month: 'short', year: 'numeric' }) : '—',
      };
      setStaff(p => [...p, newItem]);
      setAdded(true);
      setTimeout(() => { setShowAdd(false); setAdded(false); setForm({ name: "", role: "", stores: [] }); }, 1200);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const found = staff.find(s => s.id === id);
      if (!found) return;
      const newState = !found.active;
      const res = await fetch(`${API_BASE}/api/vendor/staff/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: newState }), credentials: 'include' });
      if (!res.ok) throw new Error('Failed to update status');
      setStaff(p => p.map(s => s.id === id ? { ...s, active: newState } : s));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500 mt-1">{staff.length} members · Multi-store assignment allowed · No financial access</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition">
          <Plus size={15} /> Add Staff
        </button>
      </div>

      <div className="space-y-3">
        {staff.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {s.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.active ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-100 text-gray-500"}`}>
                  {s.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1"><Shield size={11} />{s.role}</span>
                <span className="flex items-center gap-1">
                  <Store size={11} />
                  {s.stores.join(", ")}
                  {s.stores.length > 1 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">{s.stores.length} stores</span>}
                </span>
                <span className="flex items-center gap-1"><Clock size={11} />Since {s.since}</span>
              </div>
            </div>
            <button onClick={() => toggleActive(s.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition flex-shrink-0 ${
                s.active ? "border-orange-200 text-orange-600 hover:bg-orange-50" : "border-green-200 text-green-700 hover:bg-green-50"
              }`}>
              {s.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Add Staff Member</h2>
              <button onClick={() => { setShowAdd(false); setForm({ name: "", role: "", stores: [] }); }}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {added ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-100">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-sm font-bold text-green-800">Staff member added.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Rahul Mehta"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Role</label>
                    <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900">
                      <option value="">Select role</option>
                      {roles.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">No financial access for any role</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Assign Stores <span className="text-gray-400 font-normal normal-case">(multi-store allowed)</span>
                    </label>
                    <div className="space-y-2">
                      {allStores.map(store => (
                        <label key={store} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                          <input type="checkbox" checked={form.stores.includes(store)} onChange={() => toggleStore(store)}
                            className="w-4 h-4 rounded accent-gray-900" />
                          <span className="text-sm text-gray-700 font-medium">{store}</span>
                        </label>
                      ))}
                    </div>
                    {form.stores.length === 0 && <p className="text-xs text-red-400 mt-1">Select at least one store</p>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowAdd(false); setForm({ name: "", role: "", stores: [] }); }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleAdd} disabled={!form.name || !form.role || form.stores.length === 0}
                    className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                    Add Member
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
