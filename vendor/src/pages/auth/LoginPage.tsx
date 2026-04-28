import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, Smartphone, CheckCircle } from "lucide-react";

type Step = "login" | "mfa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enableMfa, setEnableMfa] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (enableMfa) setStep("mfa");
      else navigate("/orders");
    }, 800);
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  };

  const handleMfaVerify = () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter 6-digit code"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate("/orders"); }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gray-900 mb-3 shadow-sm">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Vendor Portal</h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">SpeedCopy · Internal Access Only</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Step 1: Login */}
          {step === "login" && (
            <div className="p-7">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-semibold">{error}</div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Email / Mobile</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="vendor@speedcopy.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition bg-gray-50 focus:bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest">Password / OTP</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPass ? "text" : "password"} value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Enter password or OTP"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition bg-gray-50 focus:bg-white" />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* MFA toggle */}
                <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} className="text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-blue-800">Enable MFA</p>
                      <p className="text-[10px] text-blue-500">Recommended for owners</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setEnableMfa(m => !m)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${enableMfa ? "bg-blue-600" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enableMfa ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition disabled:opacity-60">
                  {loading ? "Verifying..." : enableMfa ? "Continue to MFA →" : "Sign In"}
                </button>
              </form>

              <p className="text-[10px] text-center text-gray-400 mt-5 font-medium">
                🔒 Vendor-only · Customer sessions not allowed
              </p>
            </div>
          )}

          {/* Step 2: MFA */}
          {step === "mfa" && (
            <div className="p-7">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 mb-3">
                  <Smartphone size={18} className="text-blue-600" />
                </div>
                <h2 className="text-base font-black text-gray-900">Two-Factor Auth</h2>
                <p className="text-xs text-gray-400 mt-1">Enter the 6-digit code from your authenticator app</p>
              </div>

              {error && (
                <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-semibold mb-4">{error}</div>
              )}

              {/* OTP inputs */}
              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => { if (e.key === "Backspace" && !digit && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                    className="w-10 h-11 text-center text-lg font-black rounded-xl border border-gray-200 focus:outline-none focus:border-gray-900 bg-gray-50 focus:bg-white transition" />
                ))}
              </div>

              <button onClick={handleMfaVerify} disabled={loading}
                className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? "Verifying..." : <><CheckCircle size={15} /> Verify & Sign In</>}
              </button>

              <button onClick={() => { setStep("login"); setOtp(["","","","","",""]); setError(""); }}
                className="w-full mt-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-700 transition">
                ← Back to login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-5 font-medium">
          SpeedCopy Vendor Portal · Confidential
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
