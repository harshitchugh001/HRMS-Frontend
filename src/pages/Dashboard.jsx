import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, CalendarCheck, Clock, TrendingUp,
  Shield, Plus, CheckCircle, AlertCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import CreateUserModal from "../components/modals/CreateUserModal";
import MarkAttendanceModal from "../components/modals/MarkAttendanceModal";
import ApplyLeaveModal from "../components/modals/ApplyLeaveModal";
import { getAllUsers, createUser, markAttendance, getMyAttendance, getWeeklyAttendance, getMyLeaves } from "../services/api";

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
  const [showMarkAtt,  setShowMarkAtt]  = useState(false);
  const [showApplyLeave, setShowApplyLeave] = useState(false);
  const [toast,        setToast]        = useState(null);
  const [myLeaves,     setMyLeaves]     = useState([]);
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
      if (user?.id) {
        fetchMyAttendance();
        fetchMyLeaves();
      }
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

  const fetchMyLeaves = async () => {
    try {
      const res = await getMyLeaves();
      setMyLeaves(res?.data || []);
    } catch (_) {
      
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
      <div className="min-h-screen bg-[#070d1a] p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">

        {showCreate && canSeeFullDashboard && (
          <CreateUserModal
            role={role}
            onClose={() => setShowCreate(false)}
            onSuccess={handleUserCreated}
          />
        )}

        {showMarkAtt && canSeeFullDashboard && (
          <MarkAttendanceModal
            employees={users.filter((u) => u.role_id === 2)}
            onClose={() => setShowMarkAtt(false)}
            onSuccess={(result) => {
              showToast(`Attendance marked for ${result.employee_name}`);
            }}
          />
        )}

        {showApplyLeave && isEmployee && (
          <ApplyLeaveModal
            onClose={() => setShowApplyLeave(false)}
            onSuccess={(result) => {
              setMyLeaves((prev) => [...prev, result.data]);
              showToast(`Leave applied for ${result.data.days_requested} days ✓`);
            }}
          />
        )}

        {toast && (
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 sm:px-5 py-3 rounded-xl shadow-lg max-w-xs">
            <CheckCircle size={17} className="flex-shrink-0" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">
              Good {greeting()},{" "}
              <span className="text-emerald-400">
                {user?.full_name?.split(" ")[0] || "User"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long", year: "numeric",
                month: "long",  day: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col xs:flex-row xs:gap-2 gap-2">
              {canSeeFullDashboard && (
                <>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
                  >
                    <Plus size={15} className="flex-shrink-0" />
                    <span className="hidden sm:inline">{createLabel}</span>
                    <span className="sm:hidden">Add</span>
                  </button>

                  <button
                    onClick={() => setShowMarkAtt(true)}
                    className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition shadow-lg shadow-indigo-500/20 w-full sm:w-auto"
                  >
                    <CalendarCheck size={15} className="flex-shrink-0" />
                    <span className="hidden sm:inline">Mark Attendance</span>
                    <span className="sm:hidden">Marks</span>
                  </button>
                </>
              )}

              {isEmployee && (
                <button
                  onClick={() => setShowApplyLeave(true)}
                  className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs sm:text-sm font-semibold rounded-lg transition shadow-lg shadow-blue-500/20 w-full sm:w-auto"
                >
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span className="hidden sm:inline">Apply Leave</span>
                  <span className="sm:hidden">Leave</span>
                </button>
              )}
            </div>

            <div className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold border w-full sm:w-auto ${
              isAdmin
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : isManager
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}>
              <Shield size={14} className="flex-shrink-0" />
              <span className="hidden sm:inline">{ROLE_LABELS[role] || "Unknown"}</span>
              <span className="sm:hidden">{ROLE_LABELS[role]?.[0] || "U"}</span>
            </div>
          </div>
        </div>

        {isEmployee && (
          <div className="flex flex-col items-center gap-4 sm:gap-6">

            <div className="flex flex-col items-center gap-3 sm:gap-4 bg-[#0c1526] border border-white/5 rounded-2xl px-4 sm:px-7 py-4 sm:py-5 w-full">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
                {user?.full_name?.[0] || "E"}
              </div>
              <div className="text-center">
                <p className="text-slate-200 font-semibold text-sm sm:text-base">{user?.full_name || "Employee"}</p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">{user?.employee_id} • {user?.department}</p>
              </div>
              <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Employee
              </span>
            </div>

            <div className="bg-[#0c1526] border border-white/5 rounded-2xl p-4 sm:p-8 w-full text-center space-y-4 sm:space-y-6">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm uppercase tracking-widest mb-1">
                  Today's Attendance
                </p>
                <p className="text-slate-500 text-xs">{todayDate}</p>
              </div>

              <div className="flex justify-center">
                {!attFetched ? (
                  <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm bg-white/5 text-slate-500 border border-white/5 animate-pulse">
                    Loading…
                  </span>
                ) : attStatus === null ? (
                  <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm bg-slate-700/50 text-slate-400 border border-white/5">
                    Not Marked Yet
                  </span>
                ) : attStatus === "present" ? (
                  <span className="px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    ✓ Present
                  </span>
                ) : (
                  <span className="px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm bg-red-500/15 text-red-400 border border-red-500/25">
                    ✗ Absent
                  </span>
                )}
              </div>

              {attFetched && attStatus === null && (
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => handleMarkAttendance("present")}
                    disabled={attLoading}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {attLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={16} className="flex-shrink-0" />
                    )}
                    <span className="hidden sm:inline">Present</span>
                    <span className="sm:hidden">Yes</span>
                  </button>

                  <button
                    onClick={() => handleMarkAttendance("absent")}
                    disabled={attLoading}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {attLoading ? (
                      <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <span className="text-base leading-none">✗</span>
                    )}
                    <span className="hidden sm:inline">Absent</span>
                    <span className="sm:hidden">No</span>
                  </button>
                </div>
              )}

              {attFetched && attStatus !== null && (
                <p className="text-slate-500 text-xs sm:text-sm">
                  {attStatus === "present"
                    ? "Attendance marked for today 🎉"
                    : "Marked as absent for today"}
                </p>
              )}
            </div>

            <div className="bg-[#0c1526] border border-white/5 rounded-2xl p-4 sm:p-8 w-full text-center space-y-4 sm:space-y-6">
              <div>
                <p className="text-slate-400 text-xs sm:text-sm uppercase tracking-widest mb-2 sm:mb-3">
                  Your Leave Requests
                </p>
                {myLeaves.length === 0 ? (
                  <p className="text-slate-500 text-xs sm:text-sm">No leave requests yet</p>
                ) : (
                  <div className="space-y-2 text-xs sm:text-sm">
                    {myLeaves.slice(0, 3).map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div className="text-left">
                          <p className="text-slate-200 font-medium">{leave.leave_type}</p>
                          <p className="text-xs text-slate-400">{leave.days_requested} days</p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            leave.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : leave.status === "rejected"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {leave.status === "pending" ? "🔄" : leave.status === "approved" ? "✓" : "✗"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-slate-600 text-xs text-center px-2">
              You have access to mark attendance and apply for leaves.
            </p>
          </div>
        )}

        {canSeeFullDashboard && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard title="Total Employees" value={loading ? "—" : totalEmployees} icon={Users}         color="text-emerald-400" />
              <StatCard title="Total Users"     value={loading ? "—" : users.length}   icon={CalendarCheck}  color="text-indigo-400"  />
              <StatCard title="HR Managers"     value={loading ? "—" : totalManagers}  icon={TrendingUp}     color="text-amber-400"   />
              <StatCard title="Pending Leaves"  value="3"                              icon={Clock}          color="text-red-400"     />
            </div>

            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">

              <div className="bg-[#0c1526] border border-white/5 rounded-xl p-4 sm:p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-base text-slate-200 font-semibold truncate">Recent Users</h2>
                  <button
                    onClick={fetchUsers}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition whitespace-nowrap flex-shrink-0 ml-2"
                  >
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-slate-500 text-xs sm:text-sm text-center py-6">No users found</p>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-64">
                    {users.slice(0, 6).map((u) => (
                      <div key={u.id} className="flex items-center gap-2 sm:gap-3 bg-white/5 p-2 sm:p-3 rounded-lg min-w-0">
                        <div className="w-7 sm:w-8 h-7 sm:h-8 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                          {u.full_name?.[0] || "?"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs sm:text-sm text-slate-200 font-medium truncate">{u.full_name} <span className="text-xs text-slate-400 ml-1">({u.employee_id})</span></p>
                          <p className="text-xs text-slate-400 truncate">{u.department} • {u.email}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <RoleBadge roleId={u.role_id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#0c1526] border border-white/5 rounded-xl p-4 sm:p-6">
                <h2 className="text-sm sm:text-base text-slate-200 font-semibold mb-4">Weekly Attendance</h2>

                {weekLoading ? (
                  <div className="flex items-end gap-2 SM:gap-3 h-32 sm:h-40">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-full h-16 sm:h-24 bg-white/5 rounded-md animate-pulse" />
                        <div className="w-6 sm:w-8 h-2 sm:h-3 bg-white/5 rounded animate-pulse mt-1" />
                      </div>
                    ))}
                  </div>
                ) : weekDaysData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 sm:h-40 gap-2">
                    <CalendarCheck size={24} className="text-slate-600" />
                    <p className="text-slate-500 text-xs sm:text-sm">No attendance this week</p>
                  </div>
                ) : (
                  <div className="flex items-end gap-1 sm:gap-3 h-32 sm:h-40 overflow-x-auto">
                    {weekDaysData.map((item) => (
                      <div key={item.date} className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-slate-400 mb-1 whitespace-nowrap">{item.pct}%</div>
                        <div className="w-full bg-white/5 rounded-md flex items-end h-20 sm:h-28 relative group">
                          <div
                            className="w-full bg-emerald-400 rounded-md transition-all duration-700"
                            style={{ height: `${item.pct}%` }}
                          />
                          <div className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-white/10 z-10">
                            {item.present}/{item.total}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 text-center">{item.day}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0c1526] border border-white/5 rounded-xl p-4 sm:p-6">
              <h2 className="text-sm sm:text-base text-slate-200 font-semibold mb-3 sm:mb-4">Pending Leave Requests</h2>
              <div className="space-y-2 sm:space-y-3 overflow-x-auto">
                {[
                  { name: "Rahul Singh",  type: "Sick Leave",   days: 2, date: "20 Feb" },
                  { name: "Neha Kapoor",  type: "Casual Leave", days: 1, date: "22 Feb" },
                  { name: "Amit Sharma",  type: "Annual Leave", days: 3, date: "25 Feb" },
                ].map((req, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-7 h-7 bg-amber-500/20 text-amber-400 rounded-md flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                        {req.name[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs sm:text-sm text-slate-200 font-medium truncate">{req.name}</p>
                        <p className="text-xs text-slate-400 truncate">{req.type} · {req.days} days · {req.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 sm:gap-2 font-shrink-0">
                      <button className="px-2 sm:px-3 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition whitespace-nowrap">
                        Approve
                      </button>
                      <button className="px-2 sm:px-3 py-1 text-xs rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition whitespace-nowrap">
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