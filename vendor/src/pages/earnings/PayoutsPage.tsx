import { useState } from "react";
import { CreditCard, Calendar, AlertCircle, CheckCircle, X } from "lucide-react";

const history = [
  { date: "01 Apr 2024", amount: 18400, status: "paid", ref: "PAY-2024-04-01" },
  { date: "01 Mar 2024", amount: 21200, status: "paid", ref: "PAY-2024-03-01" },
  { date: "01 Feb 2024", amount: 15800, status: "paid", ref: "PAY-2024-02-01" },
];

const PayoutsPage = () => {
  const [showTicket, setShowTicket] = useState(false);
  const [issue, setIssue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitTicket = () => {
    if (!issue) return;
    setSubmitted(true);
    setTimeout(() => { setShowTicket(false); setSubmitted(false); setIssue(""); }, 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-black text-gray-900">Payouts</h1>
        <p className="text-sm text-gray-500 mt-1">SpeedCopy-defined schedule · Read-only · No direct finance edits</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} className="text-gray-500" />
            <h2 className="font-bold text-gray-900 text-sm">Payout Schedule</h2>
          </div>
          <div className="space-y-0">
            {[
              ["Cycle", "Monthly"],
              ["Next Payout", "01 May 2024"],
              ["Pending Amount", "₹23,400"],
              ["Bank Account", "HDFC ****4521"],
              ["Status", "Scheduled"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400">{k}</span>
                <span className="text-xs font-bold text-gray-800">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Schedule defined by SpeedCopy. No direct edits allowed.</p>
        </div>

        {/* Payment Issue */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={15} className="text-gray-500" />
            <h2 className="font-bold text-gray-900 text-sm">Payment Issue?</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Raise a support ticket for payout concerns. No direct finance edits allowed.
          </p>
          <div className="space-y-2 mb-4">
            {["Payout not received", "Wrong amount credited", "Bank account issue", "Other"].map(opt => (
              <button key={opt} onClick={() => setIssue(opt)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition ${issue === opt ? "bg-gray-900 text-white font-bold" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                {opt}
              </button>
            ))}
          </div>
          <button onClick={() => issue && setShowTicket(true)} disabled={!issue}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition disabled:opacity-40">
            Raise Ticket
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={15} className="text-gray-500" />
          <h2 className="font-bold text-gray-900 text-sm">Payout History</h2>
          <span className="ml-auto text-xs text-gray-400">Read-only</span>
        </div>
        <div className="space-y-0">
          {history.map(p => (
            <div key={p.ref} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <CheckCircle size={15} className="text-green-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">₹{p.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{p.date} · {p.ref}</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold border border-green-100">Paid</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Confirm Modal */}
      {showTicket && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Raise Payment Ticket</h2>
              <button onClick={() => setShowTicket(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            {submitted ? (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-100">
                <CheckCircle size={16} className="text-green-600" />
                <p className="text-sm font-bold text-green-800">Ticket raised. Support will respond within SLA.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Issue: <span className="font-bold text-gray-900">{issue}</span></p>
                <div className="flex gap-3">
                  <button onClick={() => setShowTicket(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
                  <button onClick={submitTicket} className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition">Submit</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutsPage;
