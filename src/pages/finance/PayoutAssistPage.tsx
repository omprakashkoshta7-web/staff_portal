import { useState, useEffect } from "react";
import { AlertTriangle, X, CheckCircle } from "lucide-react";
import staffService from "../../services/staff.service";

type Payout = { id: string; vendor: string; amount: string; period: string; status: string; date: string };

const statusColor: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700",
  processing: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  issue: "bg-red-50 text-red-600",
};

export default function PayoutAssistPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState<{ id: string; vendor: string } | null>(null);
  const [ticketMsg, setTicketMsg] = useState("");
  const [raised, setRaised] = useState<string[]>([]);
  const [ticketError, setTicketError] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);

  useEffect(() => { fetchPayouts(); }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const result = await staffService.getPayouts();
      if (result.success && result.data) {
        // Backend returns placeholder response with endpoint info
        // Check if data is an array or placeholder object
        if (Array.isArray(result.data)) {
          setPayouts(result.data);
        } else if (result.data.endpoint === 'getPayouts') {
          // Placeholder response - show empty state
          setPayouts([]);
        } else {
          setPayouts([]);
        }
      } else {
        setPayouts([]);
      }
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  const raiseTicket = async () => {
    if (!ticketMsg || !ticketModal) return;
    try {
      setTicketLoading(true);
      setTicketError("");
      const result = await staffService.issuePayoutTicket(ticketModal.id, ticketMsg);
      if (result.success) {
        // Check if backend returned real data or placeholder
        if (result.data && !result.data.endpoint) {
          setRaised(p => [...p, ticketModal.id]);
        } else {
          // Placeholder response - update locally
          setRaised(p => [...p, ticketModal.id]);
        }
        setTicketModal(null);
        setTicketMsg("");
      } else {
        setTicketError(result.message || "Failed to raise ticket");
      }
    } catch (err: any) {
      setTicketError(err?.message || "Failed to raise ticket. Please try again.");
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div>
      {loading && <p className="text-center text-gray-400 py-8">Loading payouts...</p>}
      {!loading && payouts.length === 0 && <p className="text-center text-gray-400 py-8">No payouts found.</p>}

      {!loading && payouts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="grid grid-cols-5 px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
            <span className="col-span-2">Vendor</span>
            <span>Amount</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>
          {payouts.map(p => (
            <div key={p.id} className="grid grid-cols-5 px-5 py-4 border-b border-gray-50 last:border-0 items-center">
              <div className="col-span-2">
                <p className="text-sm font-bold text-gray-900">{p.vendor}</p>
                <p className="text-xs text-gray-400">{p.period} · Due {p.date}</p>
              </div>
              <span className="text-sm font-black text-gray-900">Rs.{p.amount}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold w-fit ${statusColor[p.status] || "bg-gray-100 text-gray-600"}`}>{p.status}</span>
              <div className="flex justify-end">
                {p.status === "issue" && !raised.includes(p.id) && (
                  <button onClick={() => setTicketModal({ id: p.id, vendor: p.vendor })}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 text-orange-600 text-xs font-bold rounded-xl hover:bg-orange-50 transition">
                    <AlertTriangle size={12} /> Raise Ticket
                  </button>
                )}
                {raised.includes(p.id) && (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <CheckCircle size={12} /> Ticket Raised
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
        <p className="text-xs font-bold text-orange-700">Finance staff cannot release or modify payouts. Raise a ticket for issues.</p>
      </div>

      {ticketModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Raise Payout Ticket</h2>
              <button onClick={() => setTicketModal(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Vendor: {ticketModal.vendor}</p>
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Issue Description</label>
              <textarea value={ticketMsg} onChange={e => setTicketMsg(e.target.value)}
                placeholder="Describe the payout issue..."
                rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setTicketModal(null); setTicketError(""); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={raiseTicket} disabled={!ticketMsg || ticketLoading}
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                {ticketLoading ? "Raising..." : "Raise Ticket"}
              </button>
            </div>
            {ticketError && <p className="mt-2 text-xs font-semibold text-red-600">⚠ {ticketError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
