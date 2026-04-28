import { useState } from "react";
import { HeadphonesIcon, Plus, Clock, CheckCircle, X, MessageSquare } from "lucide-react";

const tickets = [
  { id: "TKT-001", issue: "Payout not received for March", status: "resolved", date: "10 Apr", sla: "Resolved in 4h", replies: 3 },
  { id: "TKT-002", issue: "Job reassigned incorrectly", status: "in_progress", date: "14 Apr", sla: "2h remaining", replies: 1 },
  { id: "TKT-003", issue: "Store capacity limit query", status: "open", date: "15 Apr", sla: "6h remaining", replies: 0 },
];

const issues = ["Payout issue", "Job assignment problem", "Store capacity query", "Staff access issue", "QC dispute", "Technical problem", "Other"];

const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
  in_progress: { label: "In Progress", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-100" },
  resolved: { label: "Resolved", color: "text-green-700", bg: "bg-green-50 border-green-100" },
};

const SupportPage = () => {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ issue: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [activeTicket, setActiveTicket] = useState<string | null>(null);

  const submit = () => {
    if (!form.issue) return;
    setSubmitted(true);
    setTimeout(() => { setShowNew(false); setSubmitted(false); setForm({ issue: "", description: "" }); }, 1500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">Support</h1>
          <p className="text-sm text-gray-500 mt-1">Internal ops only · SLA enforced · No customer contact</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition">
          <Plus size={15} /> Raise Ticket
        </button>
      </div>

      <div className="space-y-3">
        {tickets.map(t => {
          const cfg = statusCfg[t.status];
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <HeadphonesIcon size={16} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{t.issue}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{t.id}</span>
                    <span className="text-xs text-gray-400">{t.date}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={10} /> {t.sla}
                    </span>
                    {t.replies > 0 && (
                      <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                        <MessageSquare size={10} /> {t.replies} replies
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  <button onClick={() => setActiveTicket(activeTicket === t.id ? null : t.id)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition">
                    {activeTicket === t.id ? "Hide" : "View"}
                  </button>
                </div>
              </div>

              {/* Timeline */}
              {activeTicket === t.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Ticket Timeline</p>
                  <div className="space-y-3">
                    {[
                      { from: "You", msg: "Issue reported: " + t.issue, time: t.date + " 10:00 AM" },
                      ...(t.replies > 0 ? [{ from: "SpeedCopy Support", msg: "We are looking into this. Will update within SLA.", time: t.date + " 11:30 AM" }] : []),
                      ...(t.status === "resolved" ? [{ from: "SpeedCopy Support", msg: "Issue resolved. Please confirm.", time: t.date + " 2:00 PM" }] : []),
                    ].map((entry, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${entry.from === "You" ? "bg-gray-900 text-white" : "bg-blue-100 text-blue-700"}`}>
                          {entry.from === "You" ? "V" : "S"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700">{entry.from}</p>
                          <p className="text-xs text-gray-500">{entry.msg}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{entry.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Ticket Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Raise Support Ticket</h2>
              <button onClick={() => setShowNew(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            {submitted ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-100">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-sm font-bold text-green-800">Ticket submitted. SLA timer started.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Issue Type</label>
                    <select value={form.issue} onChange={e => setForm(p => ({ ...p, issue: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900">
                      <option value="">Select issue</option>
                      {issues.map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                      rows={3} placeholder="Describe the issue in detail..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 resize-none" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button onClick={submit} disabled={!form.issue}
                    className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
                    Submit Ticket
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
