import { TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";

const metrics = [
  { label: "Acceptance Rate", value: "94%", target: ">90%", status: "good", desc: "% of assigned jobs accepted" },
  { label: "SLA Compliance", value: "88%", target: ">85%", status: "good", desc: "On-time production performance" },
  { label: "QC Failure Rate", value: "3%", target: "<5%", status: "good", desc: "Jobs requiring reprint" },
  { label: "Availability Abuse", value: "1 flag", target: "0 flags", status: "warning", desc: "Suspicious toggle patterns" },
];

const rejectionHistory = [
  { id: "JOB-089", reason: "Machine unavailable", date: "12 Apr", counted: true },
  { id: "JOB-071", reason: "Capacity full", date: "08 Apr", counted: true },
  { id: "JOB-055", reason: "File quality issue", date: "02 Apr", counted: true },
];

const VendorScorePage = () => (
  <div>
    <div className="mb-6">
      <h1 className="text-xl font-black text-gray-900">Vendor Score</h1>
      <p className="text-sm text-gray-500 mt-1">Read-only · Affects routing priority automatically</p>
    </div>

    {/* Score Card */}
    <div className="bg-gray-900 rounded-2xl p-6 mb-6 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-1">Overall Score</p>
        <p className="text-5xl font-black text-white">87<span className="text-2xl text-gray-400">/100</span></p>
        <p className="text-sm text-green-400 font-semibold mt-1">● Good Standing</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400 mb-1">Routing Priority</p>
        <p className="text-lg font-black text-white">High</p>
        <p className="text-xs text-gray-500 mt-1">Updated daily</p>
      </div>
    </div>

    {/* Metrics */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      {metrics.map(m => (
        <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{m.label}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{m.value}</p>
            </div>
            {m.status === "good"
              ? <TrendingUp size={18} className="text-green-500 mt-1" />
              : <AlertTriangle size={18} className="text-yellow-500 mt-1" />
            }
          </div>
          <p className="text-xs text-gray-400">{m.desc}</p>
          <p className="text-xs font-semibold mt-1" style={{ color: m.status === "good" ? "#16a34a" : "#d97706" }}>
            Target: {m.target}
          </p>
        </div>
      ))}
    </div>

    {/* Rejection History */}
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown size={15} className="text-red-500" />
        <h2 className="font-bold text-gray-900 text-sm">Rejection History</h2>
        <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
          <Info size={12} />
          Cannot be deleted
        </div>
      </div>
      <div className="space-y-0">
        {rejectionHistory.map(r => (
          <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-semibold text-gray-900">{r.id}</p>
              <p className="text-xs text-gray-400">{r.reason} · {r.date}</p>
            </div>
            {r.counted && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-semibold border border-red-100">Counted</span>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Edge Cases */}
    <div className="mt-4 bg-yellow-50 rounded-2xl border border-yellow-100 p-5">
      <p className="text-xs font-bold text-yellow-800 mb-3 uppercase tracking-wide">System Actions on Failure</p>
      <div className="space-y-2">
        {[
          ["Repeated rejection", "Routing priority reduced"],
          ["Capacity abuse", "Restriction + Admin override"],
          ["QC failure", "Reprint assigned + Score impacted"],
          ["SLA breach", "Alert + Escalation"],
        ].map(([scenario, action]) => (
          <div key={scenario} className="flex justify-between text-xs">
            <span className="text-yellow-700 font-medium">{scenario}</span>
            <span className="text-yellow-800 font-bold">{action}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default VendorScorePage;
