import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, CalendarCheck, Clock, TrendingUp,
  Shield, Plus, CheckCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import CreateUserModal from "../components/modals/CreateUserModal";
import { getAllUsers, createUser, markAttendance, getMyAttendance, getWeeklyAttendance } from "../services/api";

const ROLE_LABELS = {
  admin:    "Admin",
  manager:  "HR Manager",
  employee: "Employee",
};

const todayDate = new Date().toISOString().split("T")[0];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
};

const Dashboard = () => {
  const navigate = useNavigate();

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = (JSON.parse(localStorage.getItem("role") || '""') || "").toLowerCase();
  const role    = rawRole === "hr manager" ? "manager" : rawRole;

  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showCreate,   setShowCreate]   = useState(false);
  const [toast,        setToast]        = useState(null);
  const [weekDaysData, setWeekDaysData] = useState([]);
  const [weekLoading,  setWeekLoading]  = useState(false);

  
  const [attStatus,  setAttStatus]  = useState(null);
  const [attLoading, setAttLoading] = useState(false);
  const [attFetched, setAttFetched] = useState(false);

  const isAdmin             = role === "admin";
  const isManager           = role === "manager";
  const isEmployee          = role === "employee";
  const canSeeFullDashboard = isAdmin || isManager;
  const createLabel         = isAdmin ? "Create HR Manager" : "Add Employee";

  
  useEffect(() => {
    if (!user?.email) { navigate("/"); return; }
    if (canSeeFullDashboard) {
      fetchUsers();
      fetchWeeklyAttendance();
    } else {
      setLoading(false);
      if (user?.id) fetchMyAttendance();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res  = await getAllUsers();
      const list = res?.data || res || [];
      setUsers(list);
    } catch (err) {
      showToast("Error fetching users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyAttendance = async () => {
    try {
      setWeekLoading(true);
      const res = await getWeeklyAttendance();
      setWeekDaysData(res?.data || []);
    } catch (err) {
      showToast("Error fetching weekly attendance: " + err.message);
    } finally {
      setWeekLoading(false);
    }
  };

  const fetchMyAttendance = async () => {
    try {
      const res     = await getMyAttendance(user.id);
      const records = res?.data || [];
      const today   = records.find((r) => r.date === todayDate);
      if (today) setAttStatus(today.status);
    } catch (_) {
      
    } finally {
      setAttFetched(true);
    }
  };

  
  const totalEmployees = users.filter((u) => u.role_id === 2).length;
  const totalManagers  = users.filter((u) => u.role_id === 3).length;

  
  const handleUserCreated = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    setShowCreate(false);
    const label = newUser.role_id === 3 ? "HR Manager" : "Employee";
    showToast(`${label} created successfully!`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAttendance = async (status) => {
    if (!user?.id || attLoading) return;
    try {
      setAttLoading(true);
      await markAttendance({
        user_id: user.id,
        date:    todayDate,
        status:  status,
      });
      setAttStatus(status);
      showToast(
        status === "present"
          ? "Marked as Present ✓"
          : "Marked as Absent"
      );
    } catch (err) {
      showToast("Error: " + err.message);
    } finally {
      setAttLoading(false);
    }
  };

  
  return (
    <Sidebar>
      <div className="min-h-screen bg-[#070d1a] p-8 space-y-8">

        {showCreate && canSeeFullDashboard && (
          <CreateUserModal
            role={role}
            onClose={() => setShowCreate(false)}
            onSuccess={handleUserCreated}
          />
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-xl shadow-lg">
            <CheckCircle size={17} />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">
              Good {greeting()},{" "}
              <span className="text-emerald-400">
                {user?.full_name?.split(" ")[0] || "User"}
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long", year: "numeric",
                month: "long",  day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canSeeFullDashboard && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-emerald-500/20"
              >
                <Plus size={15} />
                {createLabel}
              </button>
            )}

            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${
              isAdmin
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : isManager
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}>
              <Shield size={14} />
              {ROLE_LABELS[role] || "Unknown"}
            </div>
          </div>
        </div>

        {isEmployee && (
          <div className="flex flex-col items-center justify-center gap-8 py-6">

            <div className="flex items-center gap-4 bg-[#0c1526] border border-white/5 rounded-2xl px-7 py-5 w-full max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
                {user?.full_name?.[0] || "E"}
              </div>
              <div>
                <p className="text-slate-200 font-semibold">{user?.full_name || "Employee"}</p>
                <p className="text-slate-400 text-sm">{user?.email}</p>
              </div>
              <span className="ml-auto text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Employee
              </span>
            </div>

            <div className="bg-[#0c1526] border border-white/5 rounded-2xl p-8 w-full max-w-sm text-center space-y-6">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">
                  Today's Attendance
                </p>
                <p className="text-slate-500 text-xs">{todayDate}</p>
              </div>

              <div className="flex justify-center">
                {!attFetched ? (
                  <span className="px-4 py-1.5 rounded-full text-sm bg-white/5 text-slate-500 border border-white/5 animate-pulse">
                    Loading…
                  </span>
                ) : attStatus === null ? (
                  <span className="px-4 py-1.5 rounded-full text-sm bg-slate-700/50 text-slate-400 border border-white/5">
                    Not Marked Yet
                  </span>
                ) : attStatus === "present" ? (
                  <span className="px-5 py-1.5 rounded-full text-sm bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    ✓ Present
                  </span>
                ) : (
                  <span className="px-5 py-1.5 rounded-full text-sm bg-red-500/15 text-red-400 border border-red-500/25">
                    ✗ Absent
                  </span>
                )}
              </div>

              {attFetched && attStatus === null && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMarkAttendance("present")}
                    disabled={attLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {attLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Present
                  </button>

                  <button
                    onClick={() => handleMarkAttendance("absent")}
                    disabled={attLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {attLoading ? (
                      <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <span className="text-base leading-none">✗</span>
                    )}
                    Absent
                  </button>
                </div>
              )}

              {attFetched && attStatus !== null && (
                <p className="text-slate-500 text-sm">
                  {attStatus === "present"
                    ? "Attendance marked for today 🎉"
                    : "Marked as absent for today"}
                </p>
              )}
            </div>

            <p className="text-slate-600 text-xs text-center max-w-xs">
              You only have access to mark your attendance.
            </p>
          </div>
        )}

        {canSeeFullDashboard && (
          <>
            <div className="grid md:grid-cols-4 gap-5">
              <StatCard title="Total Employees" value={loading ? "—" : totalEmployees} icon={Users}         color="text-emerald-400" />
              <StatCard title="Total Users"     value={loading ? "—" : users.length}   icon={CalendarCheck}  color="text-indigo-400"  />
              <StatCard title="HR Managers"     value={loading ? "—" : totalManagers}  icon={TrendingUp}     color="text-amber-400"   />
              <StatCard title="Pending Leaves"  value="3"                              icon={Clock}          color="text-red-400"     />
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="bg-[#0c1526] border border-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-slate-200 font-semibold">Recent Users</h2>
                  <button
                    onClick={fetchUsers}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition"
                  >
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">No users found</p>
                ) : (
                  <div className="space-y-3">
                    {users.slice(0, 6).map((u) => (
                      <div key={u.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {u.full_name?.[0] || "?"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm text-slate-200 font-medium truncate">{u.full_name}</p>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        </div>
                        <RoleBadge roleId={u.role_id} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#0c1526] border border-white/5 rounded-xl p-6">
                <h2 className="text-slate-200 font-semibold mb-6">Weekly Attendance</h2>

                {weekLoading ? (
                  <div className="flex items-end gap-4 h-40">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full h-24 bg-white/5 rounded-md animate-pulse" />
                        <div className="w-8 h-3 bg-white/5 rounded animate-pulse mt-1" />
                      </div>
                    ))}
                  </div>
                ) : weekDaysData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2">
                    <CalendarCheck size={28} className="text-slate-600" />
                    <p className="text-slate-500 text-sm">No attendance records this week</p>
                  </div>
                ) : (
                  <div className="flex items-end gap-4 h-40">
                    {weekDaysData.map((item) => (
                      <div key={item.date} className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-slate-400 mb-1">{item.pct}%</div>
                        <div className="w-full bg-white/5 rounded-md flex items-end h-28 relative group">
                          <div
                            className="w-full bg-emerald-400 rounded-md transition-all duration-700"
                            style={{ height: `${item.pct}%` }}
                          />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-white/10 z-10">
                            {item.present}/{item.total} present
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{item.day}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0c1526] border border-white/5 rounded-xl p-6">
              <h2 className="text-slate-200 font-semibold mb-4">Pending Leave Requests</h2>
              <div className="space-y-3">
                {[
                  { name: "Rahul Singh",  type: "Sick Leave",   days: 2, date: "20 Feb" },
                  { name: "Neha Kapoor",  type: "Casual Leave", days: 1, date: "22 Feb" },
                  { name: "Amit Sharma",  type: "Annual Leave", days: 3, date: "25 Feb" },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 px-4 py-3 rounded-lg">
                    <div className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-md flex items-center justify-center text-sm font-bold">
                      {req.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-200 font-medium">{req.name}</p>
                      <p className="text-xs text-slate-400">{req.type} · {req.days} days · {req.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition">
                        Approve
                      </button>
                      <button className="px-3 py-1 text-xs rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Sidebar>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-[#0c1526] border border-white/5 rounded-xl p-5 flex justify-between items-center">
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide">{title}</p>
      <h3 className="text-2xl font-bold text-slate-100 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg bg-white/5 ${color}`}>
      <Icon size={20} />
    </div>
  </div>
);

const RoleBadge = ({ roleId }) => {
  const cfg = {
    1: { cls: "bg-amber-500/10 border-amber-500/20 text-amber-400",      label: "Admin"      },
    3: { cls: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", label: "HR Manager" },
    2: { cls: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",   label: "Employee"   },
  };
  const { cls, label } = cfg[roleId] || cfg[2];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cls}`}>
      {label}
    </span>
  );
};

export default Dashboard;