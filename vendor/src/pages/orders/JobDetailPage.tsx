import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, AlertTriangle, X, Printer } from "lucide-react";

const reasons = ["Machine unavailable", "Capacity full", "File quality issue", "SKU not supported", "Other"];

const defaultJob = {
  id: "JOB-001", type: "Document Printing",
  specs: [["Type","Document Printing"],["Pages","50 pages"],["Size","A4 Standard"],["Color","Full Color"],["Print Side","Double-sided"],["Copies","1"],["Store","Downtown Hub"],["Priority","High"]],
  files: ["document_final.pdf", "instructions.txt"],
  sla: "2h 15m", pickupId: "#PKP-8821",
};

export default function JobDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job || defaultJob;

  const [status, setStatus] = useState<"pending" | "accepted" | "rejected">("pending");
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const reject = () => {
    if (!reason) return;
    setStatus("rejected");
    setShowReject(false);
    setTimeout(() => navigate("/orders"), 1500);
  };

  const moveToProduction = () => navigate("/production");

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate("/orders")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition -ml-2">
        <ArrowLeft size={15} /> Back to Queue
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">{job.id || "JOB-001"}</h1>
          <p className="text-xs text-gray-400 mt-1">Assigned · No customer contact allowed</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
          <Clock size={13} /> {job.sla || "2h 15m"} SLA
        </div>
      </div>

      <div className="space-y-4">
        {/* Specs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Job Specifications</h2>
          <div className="grid grid-cols-2 gap-0">
            {(defaultJob.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400">{k}</span>
                <span className="text-xs font-bold text-gray-800">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-yellow-50 border border-yellow-100 flex items-center gap-2">
            <AlertTriangle size={13} className="text-yellow-600 flex-shrink-0" />
            <p className="text-xs font-bold text-yellow-800">Customer identity masked — Pickup ID: {defaultJob.pickupId}</p>
          </div>
        </div>

        {/* Files */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Files</h2>
          {defaultJob.files.map(f => (
            <div key={f} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-700">{f}</span>
              <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <Download size={13} /> Download
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        {status === "pending" && (
          <div className="flex gap-3">
            <button onClick={() => setStatus("accepted")}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition">
              <CheckCircle size={16} /> Accept Job
            </button>
            <button onClick={() => setShowReject(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-50 transition">
              <XCircle size={16} /> Reject Job
            </button>
          </div>
        )}

        {status === "accepted" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-100">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm font-bold text-green-800">Job Accepted — SLA timer stopped.</p>
            </div>
            <button onClick={moveToProduction}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition">
              <Printer size={16} /> Move to Production
            </button>
          </div>
        )}

        {status === "rejected" && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100">
            <XCircle size={16} className="text-red-500" />
            <p className="text-sm font-bold text-red-700">Job Rejected — Reassignment in progress. Rejection counted.</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Reject Job</h2>
              <button onClick={() => setShowReject(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Reason is mandatory and logged permanently. Cannot be deleted.</p>
            <div className="space-y-2 mb-5">
              {reasons.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition ${reason === r ? "bg-gray-900 text-white font-bold" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReject(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={reject} disabled={!reason}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
