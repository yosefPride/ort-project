import * as Dropdown from '@radix-ui/react-dropdown-menu';

// Dropdown menu floating over the page. `trigger` is the element that opens it.
export default function Menu({ trigger, children, align = 'end', width = 'w-40', sideOffset = 8, className = '', ...props }) {
  return (
    <Dropdown.Root {...props}>
      <Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align={align}
          sideOffset={sideOffset}
          className={`z-50 ${width} rounded-lg border border-white/10 bg-neutral-800 py-1 shadow-2xl shadow-black/50 ${className}`}
        >
          {children}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

const ITEM_VARIANTS = { default: 'text-slate-300', danger: 'text-red-400', plain: '' };

export const MenuItem = ({ variant = 'default', className = '', ...props }) => (
  <Dropdown.Item
    className={`cursor-pointer px-4 py-2 text-sm outline-none transition-colors data-highlighted:bg-white/10 ${ITEM_VARIANTS[variant]} ${className}`}
    {...props}
  />
);
