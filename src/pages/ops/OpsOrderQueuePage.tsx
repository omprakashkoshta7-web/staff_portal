import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, MessageSquare, X, CheckCircle } from "lucide-react";
import staffService from "../../services/staff.service";

const riskColor: Record<string, string> = { critical: "#ef4444", warning: "#f59e0b", normal: "#16a34a" };
const riskBg: Record<string, string> = { critical: "#fef2f2", warning: "#fffbeb", normal: "#f0fdf4" };

type Order = { 
  id: string; 
  type: string; 
  vendor: string; 
  status: string; 
  sla: string; 
  risk: string; 
  customer: string;
  rawStatus?: string;
  customerId?: string;
  amount?: number;
};
type Modal = { type: "reassign" | "clarify"; orderId: string } | null;
type AssignableVendor = { id: string; orgId?: string; name: string; location?: string; score?: number; priority?: number };

const reassignReasons = ["Vendor SLA breach", "Vendor capacity full", "Vendor suspended", "Quality concern"];

export default function OpsOrderQueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<AssignableVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [reason, setReason] = useState("");
  const [vendor, setVendor] = useState("");
  const [clarifyMsg, setClarifyMsg] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchVendors();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await staffService.getOrderQueue();
      if (result.success) {
        setOrders(result.data || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const result = await staffService.getAssignableVendors();
      if (result.success) {
        setVendors(result.data?.vendors || []);
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setVendors([]);
    }
  };

  const submitReassign = async () => {
    if (!reason || !vendor || !modal) return;
    try {
      setModalLoading(true);
      setModalError("");
      const result = await staffService.reassignVendor(modal.orderId, vendor, reason);
      if (result.success) {
        setDone(p => [...p, modal.orderId]);
        setModal(null);
        setReason("");
        setVendor("");
        fetchOrders();
      } else {
        setModalError(result.message || "Reassignment failed. Please try again.");
      }
    } catch (err: any) {
      setModalError(err?.message || "Reassignment failed. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const submitClarify = async () => {
    if (!clarifyMsg || !modal) return;
    try {
      setModalLoading(true);
      setModalError("");
      const result = await staffService.raiseClarification(modal.orderId, clarifyMsg);
      if (result.success) {
        setDone(p => [...p, modal.orderId]);
        setModal(null);
        setClarifyMsg("");
        fetchOrders();
      } else {
        setModalError(result.message || "Failed to raise clarification. Please try again.");
      }
    } catch (err: any) {
      setModalError(err?.message || "Failed to raise clarification. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      {loading && <p className="text-center text-gray-400 py-8">Loading orders...</p>}
      {!loading && orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders in queue.</p>}

      {!loading && orders.length > 0 && (
        <>
          <div className="hidden xl:block bg-white rounded-2xl border border-gray-100 overflow-hidden w-full" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="grid px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide" style={{ gridTemplateColumns: "200px 1fr 160px 110px 160px" }}>
              <span>Order ID</span>
              <span>Details</span>
              <span>Vendor</span>
              <span>SLA</span>
              <span className="text-right">Actions</span>
            </div>
            {orders.map(o => (
              <div key={o.id} className={`grid px-5 py-4 border-b border-gray-50 last:border-0 items-center gap-2 ${done.includes(o.id) ? "opacity-50" : ""}`} style={{ gridTemplateColumns: "200px 1fr 160px 110px 160px" }}>
                <span className="text-xs font-mono font-bold text-gray-700 truncate" title={o.id}>{o.id}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{o.type}</p>
                  <p className="text-xs text-gray-400 truncate">{o.customer}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block"
                    style={{ backgroundColor: riskBg[o.risk], color: riskColor[o.risk] }}>{o.status}</span>
                </div>
                <span className="text-xs text-gray-600 truncate">{o.vendor}</span>
                <div className="flex items-center gap-1.5">
                  {o.risk === "critical" && <AlertTriangle size={12} className="text-red-500" />}
                  <span className="text-xs font-bold" style={{ color: riskColor[o.risk] }}>{o.sla}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {!done.includes(o.id) && (
                    <>
                      <button onClick={() => { setModal({ type: "reassign", orderId: o.id }); setReason(""); setVendor(""); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition">
                        <RefreshCw size={11} /> Reassign
                      </button>
                      <button onClick={() => { setModal({ type: "clarify", orderId: o.id }); setClarifyMsg(""); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition">
                        <MessageSquare size={11} /> Clarify
                      </button>
                    </>
                  )}
                  {done.includes(o.id) && (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <CheckCircle size={12} /> Done
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="xl:hidden space-y-3">
            {orders.map(o => (
              <div key={o.id} className={`bg-white rounded-2xl border border-gray-100 p-4 ${done.includes(o.id) ? "opacity-50" : ""}`} style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-bold text-gray-700 truncate" title={o.id}>{o.id}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate mt-1">{o.type}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{o.customer}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                    style={{ backgroundColor: riskBg[o.risk], color: riskColor[o.risk] }}>{o.status}</span>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">VENDOR</span>
                    <span className="text-xs text-gray-700 text-right">{o.vendor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">SLA</span>
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: riskColor[o.risk] }}>
                      {o.risk === "critical" && <AlertTriangle size={12} className="text-red-500" />}
                      {o.sla}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-100">
                  {!done.includes(o.id) ? (
                    <>
                      <button onClick={() => { setModal({ type: "reassign", orderId: o.id }); setReason(""); setVendor(""); }}
                        className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition">
                        <RefreshCw size={11} /> Reassign
                      </button>
                      <button onClick={() => { setModal({ type: "clarify", orderId: o.id }); setClarifyMsg(""); }}
                        className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition">
                        <MessageSquare size={11} /> Clarify
                      </button>
                    </>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <CheckCircle size={12} /> Done
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
        <p className="text-xs font-bold text-orange-700">⚠ Ops staff cannot cancel orders. Cancellation requires admin approval.</p>
      </div>

      {/* Reassign Modal */}
      {modal?.type === "reassign" && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-start justify-center p-4 pt-20 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Vendor Reassignment</h2>
              <button onClick={() => { setModal(null); setModalError(""); }} className="hover:bg-gray-100 p-1 rounded">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Order: {modal.orderId} · Reason mandatory · Logged permanently</p>
            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Reason</label>
                <div className="space-y-2">
                  {reassignReasons.map(r => (
                    <button key={r} onClick={() => setReason(r)} type="button"
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${reason === r ? "bg-gray-900 text-white font-bold" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Select Vendor</label>
                <select value={vendor} onChange={e => setVendor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900">
                  <option value="">Choose vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}{v.location ? ` - ${v.location}` : ""}</option>)}
                </select>
              </div>
            </div>
            {modalError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs font-semibold text-red-600">⚠ {modalError}</p>
            </div>}
            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setModalError(""); }} type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={submitReassign} disabled={!reason || !vendor || modalLoading} type="button"
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                {modalLoading ? "Processing..." : "Reassign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarify Modal */}
      {modal?.type === "clarify" && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-start justify-center p-4 pt-20 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Trigger Clarification</h2>
              <button onClick={() => { setModal(null); setModalError(""); }} className="hover:bg-gray-100 p-1 rounded">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Order: {modal.orderId} · SLA timer remains active</p>
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Message to Customer</label>
              <textarea value={clarifyMsg} onChange={e => setClarifyMsg(e.target.value)}
                placeholder="Describe what clarification is needed..."
                rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition resize-none" />
            </div>
            {modalError && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs font-semibold text-red-600">⚠ {modalError}</p>
            </div>}
            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setModalError(""); }} type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={submitClarify} disabled={!clarifyMsg || modalLoading} type="button"
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                {modalLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
