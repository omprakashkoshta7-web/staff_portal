import { useState, useEffect } from "react";
import { Clock, ChevronRight, X, CheckCircle, AlertTriangle } from "lucide-react";
import staffService from "../../services/staff.service";

const statusColor: Record<string, string> = {
  open: "text-blue-700",
  in_progress: "text-orange-700",
  resolved: "text-green-700",
  closed: "text-gray-600",
};
const statusBg: Record<string, string> = {
  open: "bg-blue-50 border-blue-100",
  in_progress: "bg-orange-50 border-orange-100",
  resolved: "bg-green-50 border-green-100",
  closed: "bg-gray-100 border-gray-200",
};
const priorityColor: Record<string, string> = { urgent: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#16a34a" };

type Ticket = { id: string; issue: string; vendor: string; status: string; sla: string; priority: string };
type DetailModal = Ticket | null;

export default function VendorTicketsPage() {
  const [items, setItems] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DetailModal>(null);
  const [reply, setReply] = useState("");

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const result = await staffService.getVendorTickets();
      if (result.success) {
        setItems(result.data?.tickets || []);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch vendor tickets:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const doResolve = async (id: string) => {
    if (!reply) return;
    try {
      const result = await staffService.replyVendorTicket(id, reply);
      if (result.success) {
        setItems(p => p.map(t => t.id === id ? { ...t, ...(result.data || {}), status: result.data?.status || "resolved" } : t));
        setDetail(null);
        setReply("");
      }
    } catch (err) {
      console.error('Resolve failed:', err);
    }
  };

  const doEscalate = async (id: string) => {
    try {
      const result = await staffService.escalateTicket(id, "Escalated by staff");
      if (result.success) {
        setItems(p => p.map(t => t.id === id ? { ...t, ...(result.data || {}), status: result.data?.status || "in_progress" } : t));
        setDetail(result.data || null);
      }
    } catch (err) {
      console.error('Escalate failed:', err);
    }
  };

  return (
    <div>
      {loading && <p className="text-center text-gray-400 py-8">Loading vendor tickets...</p>}
      {!loading && items.length === 0 && <p className="text-center text-gray-400 py-8">No vendor tickets in queue.</p>}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: priorityColor[t.priority] || priorityColor.normal }} />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{t.issue}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">{t.id}</span>
                  <span className="text-xs font-semibold text-gray-600">{t.vendor}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${statusBg[t.status] || statusBg.open} ${statusColor[t.status] || statusColor.open}`}>{t.status}</span>
                  {t.sla && <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={10} />{t.sla}</span>}
                </div>
              </div>
              {t.status !== "resolved" && (
                <button onClick={() => { setDetail(t); setReply(""); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition">
                  Handle <ChevronRight size={12} />
                </button>
              )}
              {t.status === "resolved" && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={12} /> Resolved</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <p className="text-xs font-bold text-gray-600">ℹ Vendor communication is internal only. Customer information is never shared with vendors.</p>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">{detail.id} · {detail.vendor}</h2>
              <button onClick={() => setDetail(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
              <p className="text-sm font-semibold text-gray-800">{detail.issue}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${statusBg[detail.status] || statusBg.open} ${statusColor[detail.status] || statusColor.open}`}>{detail.status}</span>
                {detail.sla && <span className="text-xs text-gray-400">{detail.sla}</span>}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Reply to Vendor</label>
              <textarea value={reply} onChange={e => setReply(e.target.value)}
                placeholder="Type your response to vendor..."
                rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => doEscalate(detail.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition">
                <AlertTriangle size={13} /> Escalate
              </button>
              <button onClick={() => doResolve(detail.id)} disabled={!reply}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                <CheckCircle size={13} /> Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
