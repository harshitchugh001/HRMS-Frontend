import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getPendingLeaves, approveRejectLeave } from "../services/api";

const LeaveManagement = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = (JSON.parse(localStorage.getItem("role") || '""') || "").toLowerCase();
  const role = rawRole === "hr manager" ? "manager" : rawRole;

  const isAllowed = role === "admin" || role === "manager";

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user?.email) {
      navigate("/");
      return;
    }
    if (!isAllowed) {
      navigate("/dashboard");
      return;
    }

    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const res = await getPendingLeaves();
      setLeaves(res?.data || []);
    } catch (err) {
      showToast("Error fetching leaves: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [leaveId]: true }));
      const result = await approveRejectLeave(leaveId, "approved");
      setLeaves((prev) =>
        prev.filter((leave) => leave.id !== leaveId)
      );
      showToast(`${result.data.employee_name || "Leave"} approved ✓`);
    } catch (err) {
      showToast("Error: " + err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [leaveId]: false }));
    }
  };

  const handleReject = async (leaveId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [leaveId]: true }));
      const result = await approveRejectLeave(leaveId, "rejected");
      setLeaves((prev) =>
        prev.filter((leave) => leave.id !== leaveId)
      );
      showToast(`${result.data.employee_name || "Leave"} rejected`);
    } catch (err) {
      showToast("Error: " + err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [leaveId]: false }));
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const LeaveTypeLabel = ({ type }) => {
    const colors = {
      casual: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      sick: "bg-red-500/10 border-red-500/20 text-red-400",
      annual: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      other: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          colors[type] || colors.other
        }`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  return (
    <Sidebar>
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1 sm:mb-2">
              Leave Management
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Review and manage pending leave requests
            </p>
          </div>

          {toast && (
            <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 sm:px-5 py-3 rounded-xl shadow-lg max-w-xs">
              <CheckCircle size={17} className="flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{toast}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            </div>
          ) : (
            <div className="bg-[#0c1526] border border-white/5 rounded-xl overflow-hidden">
              {leaves.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle size={32} className="text-slate-600 mb-3" />
                  <p className="text-slate-400 text-xs sm:text-sm">
                    No pending leave requests
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/2">
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                          Employee
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase hidden md:table-cell">
                          Dept
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                          Type
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase hidden lg:table-cell">
                          Date Range
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                          Days
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase hidden sm:table-cell">
                          Reason
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leaves.map((leave) => (
                        <tr key={leave.id} className="hover:bg-white/2 transition">
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <div>
                              <p className="font-medium text-slate-200 text-xs sm:text-sm">
                                {leave.employee_name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {leave.employee_id}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-300 text-xs sm:text-sm hidden md:table-cell">
                            {leave.department}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <LeaveTypeLabel type={leave.leave_type} />
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-300 hidden lg:table-cell">
                            <div className="text-xs sm:text-sm">
                              <p>
                                {new Date(
                                  leave.start_date
                                ).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                              </p>
                              <p className="text-xs text-slate-500">
                                to{" "}
                                {new Date(
                                  leave.end_date
                                ).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <span className="px-2 sm:px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                              {leave.days_requested}d
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-400 text-xs sm:text-sm max-w-xs truncate hidden sm:table-cell">
                            {leave.reason || "—"}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <div className="flex gap-1 sm:gap-2 flex-col sm:flex-row">
                              <button
                                onClick={() => handleApprove(leave.id)}
                                disabled={actionLoading[leave.id]}
                                className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {actionLoading[leave.id] ? (
                                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle size={13} className="flex-shrink-0" />
                                )}
                                <span className="hidden sm:inline">Approve</span>
                                <span className="sm:hidden">Yes</span>
                              </button>
                              <button
                                onClick={() => handleReject(leave.id)}
                                disabled={actionLoading[leave.id]}
                                className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                {actionLoading[leave.id] ? (
                                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <XCircle size={13} className="flex-shrink-0" />
                                )}
                                <span className="hidden sm:inline">Reject</span>
                                <span className="sm:hidden">No</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
};

export default LeaveManagement;
