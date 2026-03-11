import { useState } from "react";
import { X, Eye, EyeOff, Shield, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { createUser } from "../../services/api";

const ROLE_META = {
  3: {
    label: "HR Manager",
    color: "emerald",
    icon: Shield,
    description: "Manage employees, attendance & leave approvals",
    badge: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
    btn: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    glow: "rgba(16,185,129,0.06)",
  },
  2: {
    label: "Employee",
    color: "indigo",
    icon: UserPlus,
    description: "Standard employee access — attendance & leave requests",
    badge: "bg-indigo-500/10 border-indigo-500/25 text-indigo-400",
    btn: "from-indigo-500 to-indigo-600 shadow-indigo-500/25",
    glow: "rgba(99,102,241,0.06)",
  },
};

const CreateUserModal = ({ role, onClose, onSuccess }) => {
  const [form, setForm] = useState({ employee_id: "", full_name: "", email: "", department: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});

  console.log(role,"role")

  const roleToCreate = role === "admin" ? 3 : role === "hr_manager" ? 2 : 2;
  const meta = ROLE_META[roleToCreate];
  const RoleIcon = meta.icon;

  const handleBlur = (field) => setTouched((p) => ({ ...p, [field]: true }));
  const isEmpty = (field) => touched[field] && !form[field];

  const handleSubmit = async () => {
    setTouched({ employee_id: true, full_name: true, email: true, department: true, password: true });

    if (!form.employee_id || !form.full_name || !form.email || !form.department || !form.password) {
      setError("All fields are required.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const payload = {
        employee_id: form.employee_id,
        full_name: form.full_name,
        email: form.email,
        department: form.department,
        password: form.password,
        role_id: roleToCreate,
      };

      const newUser = await createUser(payload);

      onSuccess(newUser); 
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create user");
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
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{
            background: "linear-gradient(145deg, #0f1d35 0%, #0a1525 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: `0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${meta.glow === "rgba(16,185,129,0.06)" ? "rgba(16,185,129,0.5)" : "rgba(99,102,241,0.5)"}, transparent)`,
            }}
          />

          
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: meta.glow, opacity: 0.8 }}
          />

          <div className="relative p-4 sm:p-7">
            
            <div className="flex items-start justify-between mb-4 sm:mb-7 gap-2">
              <div className="flex items-start gap-2 sm:gap-4 min-w-0 flex-1">
                <div
                  className={`p-2 sm:p-3 rounded-xl border ${meta.badge} flex-shrink-0`}
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <RoleIcon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base text-slate-100 font-semibold leading-tight">
                    Create {meta.label}
                  </h2>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    {meta.description}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-150 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/8 border border-red-500/20 text-red-400 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl mb-4 sm:mb-5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            
            <div className="space-y-3 sm:space-y-4">
              <Field
                label="Employee ID"
                placeholder="e.g. EMP001"
                value={form.employee_id}
                onChange={(v) => setForm({ ...form, employee_id: v })}
                onBlur={() => handleBlur("employee_id")}
                error={isEmpty("employee_id") ? "Employee ID required" : ""}
              />
              <Field
                label="Full Name"
                placeholder="e.g. Harshit"
                value={form.full_name}
                onChange={(v) => setForm({ ...form, full_name: v })}
                onBlur={() => handleBlur("full_name")}
                error={isEmpty("full_name") ? "Name required" : ""}
              />
              <Field
                label="Department"
                placeholder="e.g. Engineering"
                value={form.department}
                onChange={(v) => setForm({ ...form, department: v })}
                onBlur={() => handleBlur("department")}
                error={isEmpty("department") ? "Department required" : ""}
              />
              <Field
                label="Email Address"
                type="email"
                placeholder="harshit@gmail.com"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                onBlur={() => handleBlur("email")}
                error={isEmpty("email") ? "Email required" : ""}
              />
              <PasswordField
                value={form.password}
                show={showPass}
                onToggle={() => setShowPass(!showPass)}
                onChange={(v) => setForm({ ...form, password: v })}
                onBlur={() => handleBlur("password")}
                error={isEmpty("password") ? "Password required" : ""}
              />
            </div>

            <div
              className={`flex items-center gap-2 sm:gap-3 mt-4 sm:mt-5 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border text-xs sm:text-sm ${meta.badge}`}
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <CheckCircle2 size={14} className="shrink-0 opacity-80" />
              <span className="font-medium truncate">Role: {meta.label}</span>
              <span className="ml-auto text-xs opacity-50 font-normal whitespace-nowrap flex-shrink-0">
                Auto-assigned
              </span>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-slate-200 transition-all duration-150"
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
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-b ${meta.btn} shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1 sm:gap-2">
                    <span className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span className="hidden sm:inline">Creating...</span>
                    <span className="sm:hidden">Create</span>
                  </span>
                ) : (
                  <span className="hidden sm:inline">{`Create ${meta.label}`}</span>
                ) || (
                  <span className="sm:hidden">Create</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


const Field = ({ label, type = "text", placeholder, value, onChange, onBlur, error }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className="w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "rgba(16,185,129,0.4)";
        e.target.style.background = "rgba(255,255,255,0.06)";
      }}
      onBlurCapture={(e) => {
        e.target.style.borderColor = error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)";
        e.target.style.background = "rgba(255,255,255,0.04)";
      }}
    />
    {error && (
      <p className="text-red-400 text-xs mt-1 sm:mt-1.5 ml-1">{error}</p>
    )}
  </div>
);

const PasswordField = ({ value, show, onToggle, onChange, onBlur, error }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">
      Password
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder="Min. 8 characters"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 pr-9 sm:pr-11 text-xs sm:text-sm text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(16,185,129,0.4)";
          e.target.style.background = "rgba(255,255,255,0.06)";
        }}
        onBlurCapture={(e) => {
          e.target.style.borderColor = error ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)";
          e.target.style.background = "rgba(255,255,255,0.04)";
        }}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
    {error && <p className="text-red-400 text-xs mt-1 sm:mt-1.5 ml-1">{error}</p>}
  </div>
);

export default CreateUserModal;