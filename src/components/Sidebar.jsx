import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, ShieldCheck, Menu, ChevronRight } from "lucide-react";

const NAV_CONFIG = {
  admin:    [{ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
  manager:  [{ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
  employee: [{ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
};

const ROLE_LABELS = {
  admin:    "Admin",
  manager:  "HR Manager",
  employee: "Employee",
};

const ROLE_COLORS = {
  admin:    "text-amber-400",
  manager:  "text-indigo-400",
  employee: "text-emerald-400",
};

const ROLE_DOT_COLORS = {
  admin:    "bg-amber-400",
  manager:  "bg-indigo-400",
  employee: "bg-emerald-400",
};

const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const rawRole = (JSON.parse(localStorage.getItem("role") || '""') || "").toLowerCase();
  const role    = rawRole === "hr manager" ? "manager" : rawRole;

  const navItems  = NAV_CONFIG[role]      || NAV_CONFIG.employee;
  const roleLabel = ROLE_LABELS[role]     || "Employee";
  const roleColor = ROLE_COLORS[role]     || ROLE_COLORS.employee;
  const roleDot   = ROLE_DOT_COLORS[role] || ROLE_DOT_COLORS.employee;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#070d1a]">

      <aside
        className={`
          ${collapsed ? "w-[72px]" : "w-[240px]"}
          bg-[#0c1526] border-r border-white/[0.06]
          flex flex-col flex-shrink-0
          sticky top-0 h-screen overflow-hidden
          transition-all duration-250
        `}
      >
        <div className="flex items-center justify-between px-4 pt-[22px] pb-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-[10px]">
            <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/15 rounded-[10px] flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} className="text-emerald-400" strokeWidth={1.5} />
            </div>
            {!collapsed && (
              <span className="text-[15px] font-semibold text-slate-100 tracking-tight whitespace-nowrap">
                HRMS Lite
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="bg-white/5 border border-white/[0.08] rounded-lg p-1.5 text-white/40 cursor-pointer flex flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04]">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${roleDot}`} />
            <span className={`text-[11px] font-semibold tracking-[0.8px] uppercase ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        )}

        <nav className="flex-1 px-[10px] py-4 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : ""}
                className={`
                  flex items-center gap-[10px] px-3 py-[10px] rounded-lg
                  border-l-2 w-full text-left text-[13.5px] font-medium
                  transition-all duration-150 cursor-pointer
                  ${collapsed ? "justify-center" : "justify-start"}
                  ${active
                    ? "bg-emerald-400/[0.08] border-emerald-400 text-emerald-400"
                    : "border-transparent text-white/45 hover:text-white/70 hover:bg-white/5"
                  }
                `}
              >
                <item.icon size={18} strokeWidth={active ? 2 : 1.5} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-[10px] pt-3 pb-5 border-t border-white/[0.05] flex flex-col gap-2">
          {!collapsed && (
            <div className="flex items-center gap-[10px] px-3 py-[10px] bg-white/[0.03] rounded-[10px] border border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/15 text-emerald-400 flex items-center justify-center text-[13px] font-bold flex-shrink-0">
                {(user?.full_name || "U")[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-semibold text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">
                  {user?.full_name || "User"}
                </p>
                <p className="text-[11px] text-white/30 whitespace-nowrap overflow-hidden text-ellipsis">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-[10px] px-3 py-[10px]
              bg-transparent border border-red-500/15 rounded-lg
              text-red-500/70 text-[13px] font-medium
              hover:bg-red-500/5 transition-all duration-150
              cursor-pointer w-full
              ${collapsed ? "justify-center" : "justify-start"}
            `}
          >
            <LogOut size={16} strokeWidth={1.5} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;