export default function IssueTab({ isActive, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
        isActive ? 'border-sky-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
      }`}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}
