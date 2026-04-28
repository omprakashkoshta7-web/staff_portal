import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";
import staffService from "../../services/staff.service";

const STAFF_LIMIT = 500; // staff can only approve refunds up to ₹500

type Refund = { id: string; order: string; customer: string; amount: number; reason: string; status: string };

export default function RefundQueuePage() {
  const [items, setItems] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [escalateId, setEscalateId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const result = await staffService.getRefunds();
      if (result.success && result.data) {
        // Backend returns placeholder response with endpoint info
        // Check if data is an array or placeholder object
        if (Array.isArray(result.data)) {
          setItems(result.data);
        } else if (result.data.endpoint === 'getRefunds') {
          // Placeholder response - show empty state
          setItems([]);
        } else {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch refunds:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: string) => {
    try {
      setActionLoading(id);
      setActionError("");
      const result = await staffService.approveRefund(id);
      if (result.success) {
        // Check if backend returned real data or placeholder
        if (result.data && !result.data.endpoint) {
          setItems(p => p.map(r => r.id === id ? { ...r, status: "approved" } : r));
        } else {
          // Placeholder response - update locally
          setItems(p => p.map(r => r.id === id ? { ...r, status: "approved" } : r));
        }
      } else {
        setActionError(result.message || "Failed to approve refund");
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to approve refund. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const reject = (id: string) => {
    setItems(p => p.map(r => r.id === id ? { ...r, status: "rejected" } : r));
  };

  const doEscalate = async (id: string) => {
    try {
      setActionLoading(id);
      setActionError("");
      const result = await staffService.escalateRefund(id);
      if (result.success) {
        // Check if backend returned real data or placeholder
        if (result.data && !result.data.endpoint) {
          setItems(p => p.map(r => r.id === id ? { ...r, status: "escalated" } : r));
        } else {
          // Placeholder response - update locally
          setItems(p => p.map(r => r.id === id ? { ...r, status: "escalated" } : r));
        }
        setEscalateId(null);
      } else {
        setActionError(result.message || "Failed to escalate refund");
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to escalate refund. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {loading && <p className="text-center text-gray-400 py-8">Loading refunds...</p>}
      {!loading && items.length === 0 && <p className="text-center text-gray-400 py-8">No refunds in queue.</p>}

      {actionError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-700">
          ⚠ {actionError}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {items.map(r => {
            const overLimit = r.amount > STAFF_LIMIT;
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-gray-900">{r.id} · {r.order}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      r.status === "approved" ? "bg-green-50 text-green-700" :
                      r.status === "rejected" ? "bg-red-50 text-red-600" :
                      r.status === "escalated" ? "bg-orange-50 text-orange-600" :
                      "bg-yellow-50 text-yellow-700"
                    }`}>{r.status}</span>
                    {overLimit && r.status === "pending" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold border border-red-100">
                        Over limit
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{r.customer} · {r.reason}</p>
                </div>
                <span className="text-sm font-black text-gray-900">₹{r.amount}</span>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    {!overLimit ? (
                      <>
                        <button onClick={() => approve(r.id)} disabled={actionLoading === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-60">
                          <CheckCircle size={12} /> {actionLoading === r.id ? "..." : "Approve"}
                        </button>
                        <button onClick={() => reject(r.id)} disabled={actionLoading === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition disabled:opacity-60">
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setEscalateId(r.id)} disabled={actionLoading === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-50 transition disabled:opacity-60">
                        <AlertTriangle size={12} /> Escalate to Admin
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
        <p className="text-xs font-bold text-orange-700">⚠ Refunds above ₹{STAFF_LIMIT} must be escalated to admin. All approvals are permanently logged.</p>
      </div>

      {escalateId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Escalate to Admin</h2>
              <button onClick={() => setEscalateId(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This refund exceeds the staff limit of ₹{STAFF_LIMIT}. It will be escalated to admin for approval.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setEscalateId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={() => doEscalate(escalateId!)} disabled={actionLoading === escalateId}
                className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition disabled:opacity-60">
                {actionLoading === escalateId ? "Escalating..." : "Escalate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
