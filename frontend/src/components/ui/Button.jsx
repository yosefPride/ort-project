import { Link } from 'react-router-dom';

const BUTTON_VARIANTS = {
  primary: 'bg-white font-semibold text-black hover:opacity-80',
  ghost: 'font-medium text-slate-300 hover:bg-white/10 hover:text-white',
  danger: 'bg-red-500 font-semibold text-white hover:opacity-80',
  dangerOutline: 'border border-red-500/50 font-semibold text-red-400 hover:bg-red-500/10',
};

const BUTTON_SIZES = { sm: 'px-3 py-1 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-sm' };

// Pill button. With `to` it renders a router Link that looks the same.
export default function Button({ variant = 'primary', size = 'md', type = 'button', className = '', to, ...props }) {
  const classes = `inline-flex items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`;
  return to ? <Link to={to} className={classes} {...props} /> : <button type={type} className={classes} {...props} />;
}
