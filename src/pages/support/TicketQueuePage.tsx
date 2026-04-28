import { useState, useEffect } from "react";
import { Clock, ChevronRight, X, CheckCircle, AlertTriangle } from "lucide-react";
import staffService from "../../services/staff.service";

type Ticket = { 
  _id: string;
  id?: string;
  subject: string;
  description?: string;
  category: string;
  status: string;
  priority: string;
  orderId?: string;
  userId?: string;
  assignedTo?: string;
  replies?: Array<{
    authorId: string;
    authorRole: string;
    message: string;
    attachments: string[];
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
};

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

type DetailModal = Ticket | null;

export default function TicketQueuePage() {
  const [items, setItems] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DetailModal>(null);
  const [reply, setReply] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const result = await staffService.getTickets();
      if (result.success && result.data) {
        // Backend returns { tickets: [...], meta: {...} }
        const tickets = result.data.tickets || [];
        setItems(tickets);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const doEscalate = async (ticketId: string) => {
    try {
      setActionLoading(true);
      setActionError("");
      const result = await staffService.escalateTicket(ticketId, "Escalated by support staff");
      if (result.success && result.data) {
        // Update ticket in list
        setItems(p => p.map(t => 
          (t._id === ticketId || t.id === ticketId) 
            ? { ...t, ...result.data, priority: 'urgent', status: 'in_progress' } 
            : t
        ));
        setDetail(result.data);
      } else {
        setActionError(result.message || "Failed to escalate");
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to escalate ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const doResolve = async (ticketId: string) => {
    if (!reply) return;
    try {
      setActionLoading(true);
      setActionError("");
      const result = await staffService.replyTicket(ticketId, reply);
      if (result.success && result.data) {
        // Update ticket in list
        setItems(p => p.map(t => 
          (t._id === ticketId || t.id === ticketId) 
            ? { ...t, ...result.data, status: 'in_progress' } 
            : t
        ));
        setDetail(null);
        setReply("");
        fetchTickets(); // Refresh to get latest data
      } else {
        setActionError(result.message || "Failed to send reply");
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to resolve ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const doClose = async (ticketId: string) => {
    try {
      setActionLoading(true);
      setActionError("");
      const result = await staffService.closeTicket(ticketId);
      if (result.success && result.data) {
        setItems(p => p.map(t => 
          (t._id === ticketId || t.id === ticketId) 
            ? { ...t, ...result.data, status: 'resolved' } 
            : t
        ));
        setDetail(null);
      } else {
        setActionError(result.message || "Failed to close ticket");
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to close ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const getSLA = (createdAt: string) => {
    const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / 3600000);
    if (hours < 1) return "< 1h";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div>
      {loading && <p className="text-center text-gray-400 py-8">Loading tickets...</p>}
      {!loading && items.length === 0 && <p className="text-center text-gray-400 py-8">No tickets in queue.</p>}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map(t => {
            const ticketId = t._id || t.id || '';
            const sla = getSLA(t.createdAt);
            return (
              <div key={ticketId} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: priorityColor[t.priority] || priorityColor.medium }} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{t.subject}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{ticketId.slice(-8)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${statusBg[t.status] || statusBg.open} ${statusColor[t.status] || statusColor.open}`}>{t.status.replace('_', ' ')}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={10} />{sla}</span>
                    {t.category && <span className="text-xs text-gray-500">· {t.category}</span>}
                  </div>
                </div>
                {t.status !== "resolved" && t.status !== "closed" && (
                  <button onClick={() => { setDetail(t); setReply(""); setActionError(""); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition">
                    Handle <ChevronRight size={12} />
                  </button>
                )}
                {(t.status === "resolved" || t.status === "closed") && (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle size={12} /> {t.status === "closed" ? "Closed" : "Resolved"}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <p className="text-xs font-bold text-blue-700">ℹ Vendor information is never shared with customers. Escalate to admin if beyond scope.</p>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Ticket #{(detail._id || detail.id || '').slice(-8)}</h2>
              <button onClick={() => { setDetail(null); setActionError(""); }}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
              <p className="text-sm font-semibold text-gray-800">{detail.subject}</p>
              {detail.description && <p className="text-xs text-gray-600 mt-2">{detail.description}</p>}
              {detail.orderId && <p className="text-xs text-gray-400 mt-2">Linked order: {detail.orderId}</p>}
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${statusBg[detail.status] || statusBg.open} ${statusColor[detail.status] || statusColor.open}`}>{detail.status.replace('_', ' ')}</span>
                <span className="text-xs text-gray-400">{getSLA(detail.createdAt)}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: priorityColor[detail.priority] + '20', color: priorityColor[detail.priority] }}>{detail.priority}</span>
              </div>
              {detail.replies && detail.replies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-600 mb-2">Previous Replies:</p>
                  {detail.replies.slice(-2).map((r, i) => (
                    <div key={i} className="text-xs text-gray-600 mb-1">
                      <span className="font-semibold">{r.authorRole}:</span> {r.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Reply to Customer</label>
              <textarea value={reply} onChange={e => setReply(e.target.value)}
                placeholder="Type your response..."
                rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition resize-none" />
            </div>
            {actionError && (
              <p className="text-xs font-semibold text-red-600 mb-3">⚠ {actionError}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => doEscalate(detail._id || detail.id || '')} disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition disabled:opacity-60">
                <AlertTriangle size={13} /> {actionLoading ? "..." : "Escalate"}
              </button>
              <button onClick={() => doResolve(detail._id || detail.id || '')} disabled={!reply || actionLoading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                <CheckCircle size={13} /> {actionLoading ? "Saving..." : "Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
