import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, BarChart3, Calendar } from "lucide-react";
import Sidebar from "../components/Sidebar";
import {
  getReportStatistics,
  getReportDepartments,
  getReportEmployees,
  getReportTrend,
  getReportToday,
} from "../services/api";

const Reports = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = (JSON.parse(localStorage.getItem("role") || '""') || "").toLowerCase();
  const role = rawRole === "hr manager" ? "manager" : rawRole;

  const isAllowed = role === "admin" || role === "manager";

  const [statistics, setStatistics] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trend, setTrend] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user?.email) {
      navigate("/");
      return;
    }
    if (!isAllowed) {
      navigate("/dashboard");
      return;
    }

    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [stats, depts, emps, trendData, today] = await Promise.all([
        getReportStatistics().catch(() => ({})),
        getReportDepartments().catch(() => ({ data: [] })),
        getReportEmployees().catch(() => ({ data: [] })),
        getReportTrend().catch(() => ({ data: [] })),
        getReportToday().catch(() => ({})),
      ]);

      setStatistics(stats?.data || null);
      setDepartments(depts?.data || []);
      setEmployees(emps?.data || []);
      setTrend(trendData?.data || []);
      setTodaySummary(today?.data || null);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const StatBox = ({ label, value, icon: Icon, color }) => (
    <div className="bg-[#0c1526] border border-white/5 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 sm:mt-2">{value || "—"}</h3>
      </div>
      <div className={`p-2 sm:p-3 rounded-lg bg-white/5 ${color} flex-shrink-0`}>
        <Icon size={20} sm:size={24} />
      </div>
    </div>
  );

  return (
    <Sidebar>
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-1 sm:mb-2">Reports & Analytics</h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              View detailed attendance and employee analytics
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex gap-1 sm:gap-2 mb-6 bg-[#0c1526] border border-white/5 rounded-xl p-1 overflow-x-auto w-full">
                {[
                  { id: "overview", label: "Overview", icon: BarChart3 },
                  { id: "departments", label: "Departments", icon: Users },
                  { id: "employees", label: "Employees", icon: Users },
                  { id: "trend", label: "30-Day Trend", icon: TrendingUp },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium
                        transition-all duration-200 flex-shrink-0 whitespace-nowrap
                        ${
                          activeTab === tab.id
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "text-slate-400 hover:text-slate-200"
                        }
                      `}
                    >
                      <TabIcon size={16} className="flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Today's Summary Cards */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatBox
                      label="Total Employees"
                      value={todaySummary?.total_employees || 0}
                      icon={Users}
                      color="text-emerald-400"
                    />
                    <StatBox
                      label="Present Today"
                      value={todaySummary?.present || 0}
                      icon={Calendar}
                      color="text-emerald-400"
                    />
                    <StatBox
                      label="Absent Today"
                      value={todaySummary?.absent || 0}
                      icon={Users}
                      color="text-red-400"
                    />
                    <StatBox
                      label="Not Marked"
                      value={todaySummary?.not_marked || 0}
                      icon={Calendar}
                      color="text-amber-400"
                    />
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <StatBox
                      label="Total Users"
                      value={statistics?.total_users || 0}
                      icon={Users}
                      color="text-indigo-400"
                    />
                    <StatBox
                      label="Employees"
                      value={statistics?.total_employees || 0}
                      icon={Users}
                      color="text-emerald-400"
                    />
                    <StatBox
                      label="HR Managers"
                      value={statistics?.total_managers || 0}
                      icon={Users}
                      color="text-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Departments Tab */}
              {activeTab === "departments" && (
                <div className="bg-[#0c1526] border border-white/5 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Department
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Emps
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Present
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Absent
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Att %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {departments.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-3 sm:px-6 py-4 sm:py-8 text-center text-slate-400 text-xs sm:text-sm">
                              No department data available
                            </td>
                          </tr>
                        ) : (
                          departments.map((dept, idx) => (
                            <tr key={idx} className="hover:bg-white/2 transition">
                              <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-slate-200 text-xs sm:text-sm">
                                {dept.department}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-300 text-xs sm:text-sm">{dept.total_employees}</td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4">
                                <span className="px-2 sm:px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                                  {dept.present}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4">
                                <span className="px-2 sm:px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">
                                  {dept.absent}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <div className="w-8 sm:w-12 h-2 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
                                    <div
                                      className="h-full bg-emerald-500 transition-all"
                                      style={{ width: `${dept.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-slate-400 text-xs font-medium flex-shrink-0">
                                    {dept.percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Employees Tab */}
              {activeTab === "employees" && (
                <div className="bg-[#0c1526] border border-white/5 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            ID
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Name
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase hidden sm:table-cell">
                            Dept
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Pres
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Abs
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Att %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {employees.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-3 sm:px-6 py-4 sm:py-8 text-center text-slate-400 text-xs sm:text-sm">
                              No employee data available
                            </td>
                          </tr>
                        ) : (
                          employees.map((emp, idx) => (
                            <tr key={idx} className="hover:bg-white/2 transition">
                              <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-slate-200 text-xs sm:text-sm">
                                {emp.employee_id}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-200 text-xs sm:text-sm">{emp.full_name}</td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-400 text-xs sm:text-sm hidden sm:table-cell">{emp.department}</td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4">
                                <span className="px-2 sm:px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                                  {emp.present}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4">
                                <span className="px-2 sm:px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">
                                  {emp.absent}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <div className="w-8 sm:w-12 h-2 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
                                    <div
                                      className="h-full bg-emerald-500 transition-all"
                                      style={{ width: `${emp.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-slate-400 text-xs font-medium flex-shrink-0">
                                    {emp.percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 30-Day Trend Tab */}
              {activeTab === "trend" && (
                <div className="bg-[#0c1526] border border-white/5 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Date
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Total
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Present
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Absent
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                            Att %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {trend.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-3 sm:px-6 py-4 sm:py-8 text-center text-slate-400 text-xs sm:text-sm">
                              No trend data available
                            </td>
                          </tr>
                        ) : (
                          trend.map((data, idx) => (
                            <tr key={idx} className="hover:bg-white/2 transition">
                              <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-slate-200 text-xs sm:text-sm">
                                {new Date(data.date).toLocaleDateString("en-IN")}
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4 text-slate-300 text-xs sm:text-sm">{data.total}</td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4">
                                <span className="px-2 sm:px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">
                                  {data.present}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4">
                                <span className="px-2 sm:px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">
                                  {data.absent}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-2 sm:py-4">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <div className="w-8 sm:w-12 h-2 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
                                    <div
                                      className="h-full bg-emerald-500 transition-all"
                                      style={{ width: `${data.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-slate-400 text-xs font-medium flex-shrink-0">
                                    {data.percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Sidebar>
  );
};

export default Reports;
