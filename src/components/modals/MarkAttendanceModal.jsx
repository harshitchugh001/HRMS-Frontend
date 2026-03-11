import { useState } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { markAttendanceForEmployee } from "../../services/api";

const MarkAttendanceModal = ({ employees, onClose, onSuccess }) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("present");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!selectedEmployee || !date || !status) {
      setError("All fields are required");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const employeeId = parseInt(selectedEmployee);
      const payload = {
        user_id: employeeId,
        date: date,
        status: status,
      };

      const employee = employees.find((e) => e.id === employeeId);
      const result = await markAttendanceForEmployee(employeeId, payload);

      onSuccess({ ...result.data, employee_name: employee?.full_name });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0f1d35 0%, #0a1525 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: `0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)",
            }}
          />

          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(16,185,129,0.06)", opacity: 0.8 }}
          />

          <div className="relative p-7">
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2 className="text-slate-100 font-semibold text-lg">
                  Mark Attendance
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Mark employee attendance for a specific date
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-150"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/8 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                  Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 bg-white/4 border border-white/8"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <option value="">Select an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                  Status
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStatus("present")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      status === "present"
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    ✓ Present
                  </button>
                  <button
                    onClick={() => setStatus("absent")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      status === "absent"
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                        : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    ✗ Absent
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Marking...
                  </span>
                ) : (
                  "Mark Attendance"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarkAttendanceModal;
