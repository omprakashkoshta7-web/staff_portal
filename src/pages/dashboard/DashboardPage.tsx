import { useNavigate } from "react-router-dom";
import {
  ClipboardList, TrendingUp, AlertTriangle, Clock,
  CheckCircle, Package, Users, RefreshCw,
  ArrowRight, Zap, ShoppingCart
} from "lucide-react";
import { useStaffRole } from "../../context/StaffContext";
import { useEffect, useState } from "react";
import staffService from "../../services/staff.service";

// ─── Role config ──────────────────────────────────────────
const ROLE_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  quickLinks: { label: string; route: string; icon: React.ElementType }[];
}> = {
  ops: {
    label: "Operations",
    color: "#3b82f6",
    bg: "#eff6ff",
    quickLinks: [
      { label: "Order Queue", route: "/orders", icon: ShoppingCart },
      { label: "Vendors", route: "/vendors", icon: Users },
    ],
  },
  support: {
    label: "Support",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    quickLinks: [
      { label: "Tickets", route: "/support", icon: ClipboardList },
    ],
  },
  finance: {
    label: "Finance",
    color: "#10b981",
    bg: "#f0fdf4",
    quickLinks: [
      { label: "Refunds", route: "/refunds", icon: TrendingUp },
    ],
  },
  marketing: {
    label: "Marketing",
    color: "#f59e0b",
    bg: "#fffbeb",
    quickLinks: [
      { label: "Campaigns", route: "/campaigns", icon: Zap },
    ],
  },
};

const PRIORITY_COLOR = { critical: "#ef4444", high: "#f59e0b", normal: "#3b82f6" };
const PRIORITY_BG = { critical: "#fef2f2", high: "#fffbeb", normal: "#eff6ff" };
const ALERT_COLOR = { critical: "#ef4444", warning: "#f59e0b", info: "#3b82f6" };
const ALERT_BG = { critical: "#fef2f2", warning: "#fffbeb", info: "#eff6ff" };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { role } = useStaffRole();

  const [dashData, setDashData] = useState<{ kpis: any[]; tasks: any[]; alerts: any[] }>({ kpis: [], tasks: [], alerts: [] });
  const [orderStats, setOrderStats] = useState({ total: 0, critical: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const rc = ROLE_CONFIG[role] || ROLE_CONFIG.ops;

  // API: GET /api/staff/dashboard?role=<role>
  // Also fetch real order queue for ops role
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const promises: Promise<any>[] = [staffService.getDashboard(role)];

      // For ops role, also fetch real order queue
      if (role === "ops") {
        promises.push(staffService.getOrderQueue().catch(() => ({ data: [] })));
      }

      const [dashResult, ordersResult] = await Promise.all(promises);

      if (dashResult?.success && dashResult?.data) {
        setDashData({
          kpis: dashResult.data.kpis || [],
          tasks: dashResult.data.tasks || [],
          alerts: dashResult.data.alerts || [],
        });
      }

      // Build real order stats for ops
      if (role === "ops" && ordersResult) {
        const orders: any[] = Array.isArray(ordersResult?.data) ? ordersResult.data : [];
        const critical = orders.filter((o: any) => o.risk === "critical").length;
        const pending = orders.filter((o: any) => o.rawStatus === "pending" || o.rawStatus === "assigned_vendor").length;
        setOrderStats({ total: orders.length, critical, pending });
      }
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { void loadData(); }, [role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <RefreshCw size={24} className="animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: rc.bg }}>
            <Users size={16} style={{ color: rc.color }} />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{rc.label} Dashboard</p>
            <p className="text-xs text-gray-400">Role: {role}</p>
          </div>
        </div>
        <button onClick={() => void loadData(true)} disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-900 transition text-sm font-semibold">
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Real Order Stats for Ops role */}
      {role === "ops" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "#eff6ff" }}>
              <Package size={16} style={{ color: "#3b82f6" }} />
            </div>
            <p className="text-2xl font-black text-gray-900">{orderStats.total}</p>
            <p className="text-xs text-gray-400 mt-0.5">Active Orders</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "#fef2f2" }}>
              <AlertTriangle size={16} style={{ color: "#ef4444" }} />
            </div>
            <p className="text-2xl font-black" style={{ color: orderStats.critical > 0 ? "#ef4444" : "#111827" }}>
              {orderStats.critical}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Critical SLA Risk</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: "#fffbeb" }}>
              <Clock size={16} style={{ color: "#f59e0b" }} />
            </div>
            <p className="text-2xl font-black text-gray-900">{orderStats.pending}</p>
            <p className="text-xs text-gray-400 mt-0.5">Pending Assignment</p>
          </div>
        </div>
      )}

      {/* API KPIs (from dashboard endpoint) */}
      {dashData.kpis.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {dashData.kpis.map((k: any) => (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: (k.color || rc.color) + "15" }}>
                <TrendingUp size={16} style={{ color: k.color || rc.color }} />
              </div>
              <p className="text-2xl font-black text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty KPIs state for non-ops roles */}
      {dashData.kpis.length === 0 && role !== "ops" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <TrendingUp size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No KPI data available for {role} role</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-sm">Assigned Tasks</h2>
            <ClipboardList size={15} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {dashData.tasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No tasks assigned</p>
              </div>
            ) : (
              dashData.tasks.map((t: any) => (
                <div key={t.id} onClick={() => navigate(t.route || "/")}
                  className="flex items-start gap-3 p-3.5 rounded-xl cursor-pointer hover:opacity-90 transition"
                  style={{
                    backgroundColor: PRIORITY_BG[t.priority as keyof typeof PRIORITY_BG] || "#eff6ff",
                    border: `1px solid ${PRIORITY_COLOR[t.priority as keyof typeof PRIORITY_COLOR] || "#3b82f6"}20`,
                  }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: PRIORITY_COLOR[t.priority as keyof typeof PRIORITY_COLOR] || "#3b82f6" }} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 mb-0.5">{t.id}</p>
                    <p className="text-sm font-semibold text-gray-800">{t.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={10} style={{ color: PRIORITY_COLOR[t.priority as keyof typeof PRIORITY_COLOR] || "#3b82f6" }} />
                      <p className="text-xs font-bold" style={{ color: PRIORITY_COLOR[t.priority as keyof typeof PRIORITY_COLOR] || "#3b82f6" }}>
                        {t.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-red-500" />
            <h2 className="font-bold text-gray-900 text-sm">Alerts</h2>
          </div>
          <div className="space-y-3">
            {/* Real critical SLA alert for ops */}
            {role === "ops" && orderStats.critical > 0 && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{ backgroundColor: "#fef2f2", border: "1px solid #ef444420" }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "#ef4444" }} />
                <p className="text-sm font-semibold text-gray-800">
                  {orderStats.critical} order{orderStats.critical > 1 ? "s" : ""} at critical SLA risk
                </p>
              </div>
            )}
            {role === "ops" && orderStats.pending > 0 && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{ backgroundColor: "#fffbeb", border: "1px solid #f59e0b20" }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "#f59e0b" }} />
                <p className="text-sm font-semibold text-gray-800">
                  {orderStats.pending} order{orderStats.pending > 1 ? "s" : ""} pending vendor assignment
                </p>
              </div>
            )}

            {/* API alerts */}
            {dashData.alerts.map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{
                  backgroundColor: ALERT_BG[a.type as keyof typeof ALERT_BG] || "#eff6ff",
                  border: `1px solid ${ALERT_COLOR[a.type as keyof typeof ALERT_COLOR] || "#3b82f6"}20`,
                }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: ALERT_COLOR[a.type as keyof typeof ALERT_COLOR] || "#3b82f6" }} />
                <p className="text-sm font-semibold text-gray-800">{a.msg}</p>
              </div>
            ))}

            {dashData.alerts.length === 0 && !(role === "ops" && (orderStats.critical > 0 || orderStats.pending > 0)) && (
              <div className="text-center py-6">
                <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No alerts</p>
              </div>
            )}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold">
              ⚠ Staff cannot override system rules. Escalate to admin when needed.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 text-sm mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {rc.quickLinks.map(link => (
            <button key={link.route} onClick={() => navigate(link.route)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition hover:shadow-sm"
              style={{ backgroundColor: rc.bg, color: rc.color, borderColor: rc.color + "30" }}>
              <link.icon size={15} />
              {link.label}
              <ArrowRight size={13} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
