import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList, Printer, Store, Users,
  DollarSign, CreditCard, HeadphonesIcon,
  LogOut, Bell, Star, CalendarCheck, ChevronDown,
  Settings
} from "lucide-react";

const navGroups = [
  {
    label: "Operations",
    items: [
      { to: "/orders", icon: ClipboardList, label: "Job Queue" },
      { to: "/production", icon: Printer, label: "Production" },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/stores", icon: Store, label: "My Stores" },
      { to: "/staff", icon: Users, label: "Staff" },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/earnings", icon: DollarSign, label: "Earnings" },
      { to: "/closure", icon: CalendarCheck, label: "Closure" },
      { to: "/payouts", icon: CreditCard, label: "Payouts" },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/score", icon: Star, label: "Vendor Score" },
      { to: "/org", icon: Settings, label: "Org Profile" },
      { to: "/support", icon: HeadphonesIcon, label: "Support" },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/orders": "Job Queue",
  "/production": "Production",
  "/stores": "My Stores",
  "/staff": "Staff",
  "/earnings": "Earnings",
  "/closure": "Closure",
  "/payouts": "Payouts",
  "/score": "Vendor Score",
  "/org": "Org Profile",
  "/support": "Support",
};

const VendorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="flex h-screen bg-[#f5f6fa] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex flex-col flex-shrink-0" style={{ backgroundColor: "#0f172a", boxShadow: "1px 0 0 rgba(255,255,255,0.06)" }}>

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-black text-white leading-none tracking-tight">SpeedCopy</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Vendor Portal</p>
            </div>
          </div>
        </div>

        {/* Org badge */}
        <div className="mx-3 mt-3 mb-2 px-3.5 py-3 rounded-xl flex items-center justify-between cursor-pointer transition" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <p className="text-sm font-bold text-white leading-none">PrintMaster Org</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Owner · 3 Stores Active</p>
          </div>
          <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} className="flex-shrink-0" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-xs font-black uppercase tracking-widest px-3 mb-2" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "text-white shadow-sm"
                          : "hover:text-white"
                      }`
                    }
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                      color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                    })}>
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => navigate("/login")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition"
            style={{ color: "rgba(255,100,100,0.8)" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,100,100,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0" style={{ minHeight: "64px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

          {/* Left: breadcrumb + title */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-gray-400 font-medium">SpeedCopy</span>
                <span className="text-gray-300 text-xs">/</span>
                <span className="text-xs text-gray-500 font-medium">{currentTitle}</span>
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">{currentTitle}</h1>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            {/* Status badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-700">All Systems Online</span>
            </div>

            <div className="w-px h-6 bg-gray-100 mx-1" />

            {/* Notification */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 transition border border-gray-100">
              <Bell size={16} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>

            {/* User */}
            <div onClick={() => navigate("/org")}
              className="flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100 ml-1">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-black flex-shrink-0">V</div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">Vendor Owner</p>
                <p className="text-xs font-semibold mt-0.5 text-green-600">● Online</p>
              </div>
              <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
