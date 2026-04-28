import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  HeadphonesIcon,
  DollarSign,
  TrendingUp,
  LogOut,
  Bell,
  ChevronDown,
  BookOpen,
  RotateCcw,
  Search,
  X,
  User,
  Lock,
} from "lucide-react";
import { useStaffRole } from "../../context/StaffContext";
import { notificationService, type PortalNotification } from "../../services/notification.service";

const allNavGroups = [
  {
    label: "Overview",
    roles: ["ops", "support", "finance", "marketing"],
    items: [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["ops", "support", "finance", "marketing"] }],
  },
  {
    label: "Operations",
    roles: ["ops"],
    items: [{ to: "/ops/orders", icon: ClipboardList, label: "Order Queue", roles: ["ops"] }],
  },
  {
    label: "Support",
    roles: ["support"],
    items: [
      { to: "/support/tickets", icon: HeadphonesIcon, label: "Ticket Queue", roles: ["support"] },
      { to: "/support/vendor-tickets", icon: HeadphonesIcon, label: "Vendor Tickets", roles: ["support"] },
    ],
  },
  {
    label: "Finance",
    roles: ["finance"],
    items: [
      { to: "/finance/refunds", icon: RotateCcw, label: "Refund Queue", roles: ["finance"] },
      { to: "/finance/ledger", icon: BookOpen, label: "Ledger View", roles: ["finance"] },
      { to: "/finance/payouts", icon: DollarSign, label: "Payout Assist", roles: ["finance"] },
    ],
  },
  {
    label: "Marketing",
    roles: ["marketing"],
    items: [{ to: "/marketing/campaigns", icon: TrendingUp, label: "Campaigns", roles: ["marketing"] }],
  },
];

const pageMeta: Record<string, { title: string; caption: string }> = {
  "/dashboard": { title: "Dashboard", caption: "Track your queue, tickets, finance tasks, and campaign flow in one place." },
  "/ops/orders": { title: "Order Queue", caption: "Watch assignments, escalations, and turnaround pressure." },
  "/support/tickets": { title: "Ticket Queue", caption: "Handle customer issues while keeping SLA targets visible." },
  "/support/vendor-tickets": { title: "Vendor Tickets", caption: "Manage vendor-facing issues and response history." },
  "/finance/refunds": { title: "Refund Queue", caption: "Review refund requests and escalation thresholds." },
  "/finance/ledger": { title: "Ledger View", caption: "Inspect entries, filters, and staff-safe ledger detail." },
  "/finance/payouts": { title: "Payout Assist", caption: "Coordinate payout support tasks without direct finance edits." },
  "/marketing/campaigns": { title: "Campaigns", caption: "Keep offers, approvals, and status updates organized." },
};

const roleLabels: Record<string, string> = {
  ops: "Ops Staff",
  support: "Support Staff",
  finance: "Finance Staff",
  marketing: "Marketing Staff",
};

export default function StaffLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { role, user, logout } = useStaffRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const page = pageMeta[pathname] || { title: "Staff Portal", caption: "Manage daily staff workflows in a unified workspace." };

  const visibleGroups = allNavGroups
    .filter((group) => group.roles.includes(role))
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);

  const navItems = visibleGroups.flatMap((group) => group.items);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate based on role
      if (role === "ops") {
        navigate(`/ops/orders?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (role === "support") {
        navigate(`/support/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const [summary, recent] = await Promise.all([
          notificationService.getSummary(),
          notificationService.getRecent(),
        ]);

        if (!active) return;
        setUnreadCount(summary.data.unread_count || 0);
        setNotifications(recent.data.notifications || []);
      } catch {
        if (!active) return;
        setUnreadCount(0);
        setNotifications([]);
      }
    };

    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 15000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const formatTimestamp = (value?: string) =>
    value
      ? new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
      : "";

  return (
    <div className="staff-app-shell min-h-screen p-3 sm:p-4">
      <div className="staff-frame flex min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[34px]">
        <aside className="staff-sidebar hidden w-[236px] flex-shrink-0 lg:flex lg:flex-col">
          <div className="px-5 pb-6 pt-8">
            <div className="flex items-center gap-2">
              <h1 className="text-[2.2rem] font-black lowercase leading-none tracking-tight text-white">
                SpeedCopy
              </h1>
            </div>
            <p className="mt-2 pl-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/50">
              Staff portal
            </p>
          </div>

          <div className="mx-5 h-px bg-violet-200/30" />

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-5">
              {visibleGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">{group.label}</p>
                  <div className="space-y-1">
                    {group.items.map(({ to, icon: Icon, label }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                            isActive ? "staff-nav-active" : "staff-nav-idle hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        <Icon size={15} />
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="px-4 pb-5">
            <div className="mb-3 rounded-2xl bg-white/5 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">Session</p>
              <p className="mt-1 text-sm font-semibold text-white">{user?.name || roleLabels[role] || role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/72 hover:bg-white/5 hover:text-white transition-all"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </aside>

        <div className="staff-content-shell flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="staff-topbar flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-violet-500/80">Staff Workspace</p>
              <h1 className="text-[2.15rem] font-black tracking-tight text-slate-900">{page.title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">{page.caption}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form onSubmit={handleSearch} className="relative min-w-[220px] flex-1 sm:w-[320px]">
                <Search size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-violet-500" />
                <input 
                  className="staff-search-input w-full rounded-full border-0 px-5 py-3 pr-11 text-sm" 
                  placeholder="Search orders, tickets, payouts" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="relative">
                  <button 
                    className="relative hidden md:flex h-9 w-9 items-center justify-center rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
                    style={{ 
                      background: 'radial-gradient(circle at top, rgba(255, 255, 255, 0.04), transparent 24%), linear-gradient(180deg, #1a2332 0%, #141c28 100%)'
                    }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="Notifications"
                  >
                    <Bell size={16} className="text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 min-w-[18px] rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-[18px] text-white border border-white text-center">
                        {Math.min(unreadCount, 99)}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white shadow-xl border border-slate-200 z-50">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-slate-100 rounded-lg transition"
                        >
                          <X size={16} className="text-slate-500" />
                        </button>
                      </div>
                      {notifications.length ? (
                        <div className="max-h-96 overflow-y-auto p-2">
                          {notifications.map((notification) => (
                            <div key={notification._id} className="rounded-xl px-3 py-3 hover:bg-slate-50 transition">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                                  <p className="mt-1 text-xs leading-5 text-slate-600">{notification.message}</p>
                                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                    {notification.category} • {formatTimestamp(notification.createdAt)}
                                  </p>
                                </div>
                                {!notification.isRead && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-3">
                            <Bell size={24} className="text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">No notifications yet</p>
                          <p className="text-xs text-gray-500 mt-1">Queue changes and escalations will appear here.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button 
                    className="staff-profile-chip"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white overflow-hidden" style={{ background: 'radial-gradient(circle at top, rgba(255, 255, 255, 0.04), transparent 24%), linear-gradient(180deg, #1a2332 0%, #141c28 100%)' }}>
                      S
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-semibold text-slate-700">{user?.name || "Staff Member"}</p>
                      <p className="text-xs text-slate-400">{user?.email || roleLabels[role] || role}</p>
                    </div>
                    <ChevronDown size={13} className="text-violet-500" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 z-50">
                      <div className="p-4 border-b border-slate-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-900">{user?.name || "Staff Member"}</p>
                            <p className="text-xs text-slate-500 mt-1">{user?.email || roleLabels[role] || role}</p>
                          </div>
                          <button 
                            onClick={() => setShowUserMenu(false)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition"
                          >
                            <X size={16} className="text-slate-500" />
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/dashboard');
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition"
                        >
                          <User size={14} />
                          Profile Settings
                        </button>
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/dashboard');
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition"
                        >
                          <Lock size={14} />
                          Security
                        </button>
                      </div>
                      <div className="p-2 border-t border-slate-100">
                        <button 
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <LogOut size={14} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,0.14)]"
                        : "bg-white/85 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition bg-red-50 text-red-600 shadow-[0_8px_18px_rgba(15,23,42,0.06)] hover:bg-red-100 flex items-center gap-2"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </header>

          <main className="staff-main flex-1 overflow-y-auto px-6 pb-5 pt-7 sm:px-10 sm:pb-7 sm:pt-8 lg:px-14 lg:pt-9">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
