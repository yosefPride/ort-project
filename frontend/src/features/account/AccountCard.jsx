const AccountCard = ({ title, subtitle, children }) => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-6">
    <h2 className="text-lg font-semibold text-white">{title}</h2>
    <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    {children}
  </div>
);

export default AccountCard;
