// Styling for every sidebar row: highlighted when it is the current page, centered when collapsed.
export const rowClasses = (collapsed, isActive) =>
  `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors ${collapsed ? 'justify-center px-2' : ''} ${
    isActive ? 'border-sky-400 bg-white/10 text-white' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
  }`;
