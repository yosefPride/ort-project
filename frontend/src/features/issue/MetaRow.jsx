const MetaRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="shrink-0 text-sm text-slate-500">{label}</dt>
    <dd className="flex min-w-0 items-center gap-2 text-sm text-slate-200">{children}</dd>
  </div>
);

export default MetaRow;
