const BADGE_VARIANTS = {
  neutral: 'bg-white/10 text-slate-300',
  accent: 'border border-sky-400/30 bg-sky-500/10 text-sky-300',
  outline: 'border border-white/10 text-slate-500',
  danger: 'border border-red-500/30 bg-red-500/10 text-red-400',
};

export default function Badge({ variant = 'neutral', size = 'md', className = '', ...props }) {
  const sizes = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';
  return <span className={`inline-flex items-center rounded-full font-medium ${BADGE_VARIANTS[variant]} ${sizes} ${className}`} {...props} />;
}
