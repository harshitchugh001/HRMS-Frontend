import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { applyLeave } from "../../services/api";

const LEAVE_TYPES = ["casual", "sick", "annual", "other"];

const ApplyLeaveModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    if (!formData.leave_type || !formData.start_date || !formData.end_date) {
      setError("All fields are required");
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError("Start date must be before end date");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const payload = {
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || null,
      };

      const result = await applyLeave(payload);
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDays();

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
                "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)",
            }}
          />

          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "rgba(59,130,246,0.06)", opacity: 0.8 }}
          />

          <div className="relative p-7">
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2 className="text-slate-100 font-semibold text-lg">
                  Apply for Leave
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Submit your leave request for approval
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
                  Leave Type
                </label>
                <select
                  name="leave_type"
                  value={formData.leave_type}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {LEAVE_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-slate-900">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
              </div>

              {days > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-blue-400 font-medium">
                    📅 Total Days: <span className="font-bold">{days}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="e.g., Family emergency, personal work..."
                  rows="3"
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                />
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
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Applying...
                  </span>
                ) : (
                  "Apply Leave"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplyLeaveModal;
