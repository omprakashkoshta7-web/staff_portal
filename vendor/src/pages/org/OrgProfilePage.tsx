import { useState } from "react";
import { Building2, FileText, CheckCircle, AlertCircle, Save } from "lucide-react";

const OrgProfilePage = () => {
  const [form, setForm] = useState({
    orgName: "PrintMaster Solutions Pvt Ltd",
    contactEmail: "ops@printmaster.in",
    contactPhone: "+91 98765 43210",
    gst: "27AABCP1234F1Z5",
    pan: "AABCP1234F",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-gray-900">Org Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Internal identity — never visible to customers</p>
      </div>

      <div className="space-y-4">
        {/* Org Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={16} className="text-gray-500" />
            <h2 className="font-bold text-gray-900 text-sm">Organization Details</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Name is internal only</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Org Name (Internal)</label>
              <input value={form.orgName} onChange={e => setForm(p => ({ ...p, orgName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Contact Email</label>
              <input value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Contact Phone</label>
              <input value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition" />
            </div>
          </div>
          <button onClick={handleSave}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition">
            <Save size={14} /> {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>

        {/* GST & Legal */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={16} className="text-gray-500" />
            <h2 className="font-bold text-gray-900 text-sm">GST & Legal Info</h2>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-semibold border border-yellow-100">Required for payouts</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">GST Number</label>
              <input value={form.gst} onChange={e => setForm(p => ({ ...p, gst: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-gray-900 transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">PAN Number</label>
              <input value={form.pan} onChange={e => setForm(p => ({ ...p, pan: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-gray-900 transition" />
            </div>
          </div>
        </div>

        {/* Agreement */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-green-500" />
            <h2 className="font-bold text-gray-900 text-sm">Agreement Status</h2>
            <span className="ml-auto text-xs text-gray-400">Read-only</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-100">
            <div>
              <p className="text-sm font-bold text-green-800">Vendor Agreement — Active</p>
              <p className="text-xs text-green-600 mt-0.5">Signed on 01 Jan 2024 · Valid till 31 Dec 2024</p>
            </div>
            <button className="text-xs font-bold text-green-700 hover:underline">View PDF</button>
          </div>
          <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-gray-50">
            <AlertCircle size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500">Agreement managed by SpeedCopy. Contact support for renewals or changes.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrgProfilePage;
