import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import staffService from "../../services/staff.service";

type Entry = { id: string; type: string; ref: string; amount: string; date: string; note: string };

export default function LedgerViewPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLedger(); }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const result = await staffService.getWalletLedger();
      if (result.success && result.data) {
        // Backend returns placeholder response with endpoint info
        // Check if data is an array or placeholder object
        if (Array.isArray(result.data)) {
          setEntries(result.data);
        } else if (result.data.endpoint === 'getWalletLedger') {
          // Placeholder response - show empty state
          setEntries([]);
        } else {
          setEntries([]);
        }
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
          <Lock size={13} className="text-gray-500" />
          <span className="text-xs font-bold text-gray-600">Read-Only</span>
        </div>
      </div>

      {loading && <p className="text-center text-gray-400 py-8">Loading ledger...</p>}
      {!loading && entries.length === 0 && <p className="text-center text-gray-400 py-8">No ledger entries found.</p>}

      {!loading && entries.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="grid px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide" style={{ gridTemplateColumns: "150px 120px 1fr 120px 140px" }}>
            <span>Entry ID</span>
            <span>Type</span>
            <span>Reference</span>
            <span>Amount</span>
            <span className="text-right pr-2">Date</span>
          </div>
          {entries.map(e => (
            <div key={e.id} className="grid px-5 py-4 border-b border-gray-50 last:border-0 items-center" style={{ gridTemplateColumns: "150px 120px 1fr 120px 140px" }}>
              <span className="text-xs font-bold text-gray-700 truncate">{e.id}</span>
              <span className="text-sm text-gray-700 truncate">{e.type}</span>
              <span className="text-xs text-gray-500 truncate">{e.ref}</span>
              <span className={`text-sm font-black truncate ${e.amount.startsWith("+") ? "text-green-600" : "text-red-500"}`}>{e.amount}</span>
              <span className="text-xs text-gray-400 text-right truncate">{e.date}</span>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
        <p className="text-xs font-bold text-gray-600">ℹ Finance staff can view ledger entries but cannot modify them. Contact admin for corrections.</p>
      </div>
    </div>
  );
}
