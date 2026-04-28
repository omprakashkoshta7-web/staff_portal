import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, UserCircle } from "lucide-react";
import { useStaffRole } from "../../context/StaffContext";
import { isFirebaseConfigured } from "../../config/firebase";
import { loginWithFirebase } from "../../services/firebase-auth";

type Role = "ops" | "support" | "finance" | "marketing";

const roleOptions: { value: Role; label: string; color: string }[] = [
  { value: "ops", label: "Ops Staff", color: "#3b82f6" },
  { value: "support", label: "Support Staff", color: "#8b5cf6" },
  { value: "finance", label: "Finance Staff", color: "#16a34a" },
  { value: "marketing", label: "Marketing Staff", color: "#f59e0b" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setRole, setUser, setToken } = useStaffRole();
  const [form, setForm] = useState({ email: "", password: "", role: "ops" as Role });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Fill all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const authResponse = await loginWithFirebase(form.email, form.password, form.role);

      setToken(authResponse.token);
      setRole(authResponse.user.team);
      setUser({
        id: authResponse.user.uid,
        email: authResponse.user.email,
        name: authResponse.user.displayName || authResponse.user.email,
        role: authResponse.user.role,
        team: authResponse.user.team,
        permissions: authResponse.user.permissions,
        scopes: authResponse.user.scopes,
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#f8fafc" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gray-900 mb-3 shadow-sm">
            <UserCircle size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-gray-900">Staff Portal</h1>
          <p className="text-xs text-gray-400 mt-1">SpeedCopy - Internal Staff Access</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-7">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-semibold">{error}</div>
              )}
              {!isFirebaseConfigured && (
                <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-semibold">
                  Firebase is not configured for the staff portal. Add the Firebase env values before logging in.
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Team</label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: option.value }))}
                      className="py-2 px-3 rounded-xl text-xs font-bold transition border"
                      style={{
                        backgroundColor: form.role === option.value ? `${option.color}15` : "transparent",
                        borderColor: form.role === option.value ? `${option.color}60` : "#e5e7eb",
                        color: form.role === option.value ? option.color : "#6b7280",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="finance@speedcopy.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Finance@123456"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 transition bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !isFirebaseConfigured}
                className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Enter Staff Portal"}
              </button>
            </form>
            <p className="text-xs text-center text-gray-400 mt-5">
              Firebase staff accounts are ready. Demo finance login: finance@speedcopy.com / Finance@123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
