// Admin tables. `columns` are strings, or { label, right: true } for a right-aligned column.
export default function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wide text-slate-400">
            {columns.map((column) => (
              <th key={column.label ?? column} className={`px-4 py-3 ${column.right ? 'text-right' : ''}`}>{column.label ?? column}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const Tr = (props) => <tr className="border-b border-white/5 last:border-0 hover:bg-white/5" {...props} />;

export const Td = ({ className = '', ...props }) => <td className={`px-4 py-3 ${className}`} {...props} />;
