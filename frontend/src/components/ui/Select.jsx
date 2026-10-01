// Solid background (not see-through) so the browser's option list stays readable.
const Select = ({ className = '', ...props }) => (
  <select className={`rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/50 ${className}`} {...props} />
);

export default Select;
