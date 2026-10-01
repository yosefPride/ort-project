export default function Field({ label, error, className = '', children }) {
  return (
    <label className={`flex flex-col gap-1 text-sm text-slate-300 ${className}`}>
      {label}
      {children}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </label>
  );
}
