import { useState } from "react";
import { Download, CheckCircle } from "lucide-react";

const dailyJobs = [
  { id: "JOB-001", type: "Document Printing", store: "Downtown Hub", completedAt: "11:30 AM", amount: 450 },
  { id: "JOB-002", type: "Spiral Binding", store: "North Station", completedAt: "1:15 PM", amount: 280 },
  { id: "JOB-003", type: "Business Cards", store: "Downtown Hub", completedAt: "3:45 PM", amount: 620 },
  { id: "JOB-006", type: "Thesis Binding", store: "University Hub", completedAt: "5:00 PM", amount: 890 },
];

const ClosurePage = () => {
  const [period, setPeriod] = useState("daily");
  const total = dailyJobs.reduce((s, j) => s + j.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">Store Closure</h1>
          <p className="text-sm text-gray-500 mt-1">Auto-generated · No edits allowed</p>
        </div>
        <div className="flex gap-2">
          {["daily", "weekly", "monthly"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${period === p ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Jobs Completed", value: dailyJobs.length.toString() },
          { label: "Total Earnings", value: `₹${total.toLocaleString()}` },
          { label: "Date", value: "15 Apr 2024" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 font-medium mb-1">{card.label}</p>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-sm">Completed Jobs</h2>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition">
            <Download size={13} /> Export
          </button>
        </div>
        <div className="grid grid-cols-5 px-3 py-2 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
          <span>Job ID</span>
          <span className="col-span-2">Type</span>
          <span>Store</span>
          <span className="text-right">Amount</span>
        </div>
        {dailyJobs.map(job => (
          <div key={job.id} className="grid grid-cols-5 px-3 py-3.5 border-b border-gray-50 last:border-0 items-center">
            <span className="text-xs font-bold text-gray-700">{job.id}</span>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-gray-900">{job.type}</p>
              <p className="text-xs text-gray-400">{job.completedAt}</p>
            </div>
            <span className="text-xs text-gray-500">{job.store}</span>
            <span className="text-sm font-bold text-gray-900 text-right">₹{job.amount}</span>
          </div>
        ))}
        <div className="flex justify-between px-3 pt-3 mt-1 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-900">Total</span>
          <span className="text-sm font-black text-gray-900">₹{total.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <CheckCircle size={14} className="text-green-500" />
        <p className="text-xs text-gray-500">Closure report auto-generated at end of day. No manual edits permitted.</p>
      </div>
    </div>
  );
};

export default ClosurePage;
