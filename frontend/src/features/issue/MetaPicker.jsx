import { Check } from 'lucide-react';
import Menu, { MenuItem } from '../../components/ui/Menu';

// A value that people who can edit may change right here: clicking it opens a list of choices.
export default function MetaPicker({ label, value, options, canEdit, onSelect, children }) {
  if (!canEdit) return children;
  return (
    <Menu
      width="w-44"
      sideOffset={6}
      trigger={
        <button type="button" aria-label={`Change ${label}`} className="min-w-0 rounded-full outline-none focus-visible:ring-1 focus-visible:ring-white">
          {children}
        </button>
      }
    >
      {options.map((option) => (
        <MenuItem key={option.value} className="flex items-center justify-between" onSelect={() => option.value !== value && onSelect(option.value)}>
          <span className="truncate">{option.label}</span>
          {option.value === value && <Check className="h-4 w-4 shrink-0 text-sky-400" />}
        </MenuItem>
      ))}
    </Menu>
  );
}
