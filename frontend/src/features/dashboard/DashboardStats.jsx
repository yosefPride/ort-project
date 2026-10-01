import { AlertTriangle, Ticket, User, Users } from 'lucide-react';

// Tailwind only includes classes written out in full, so each color is spelled out.
const TILES = [
  { icon: Users, label: 'Teams', field: null, value: 'text-sky-300', chip: 'bg-sky-500/15 text-sky-300' },
  { icon: Ticket, label: 'Open Issues', field: 'open_issues', value: 'text-amber-300', chip: 'bg-amber-500/15 text-amber-300' },
  { icon: AlertTriangle, label: 'Critical/High Open', field: 'urgent_issues', value: 'text-rose-300', chip: 'bg-rose-500/15 text-rose-300' },
  { icon: User, label: 'Assigned to Me', field: 'my_issues', value: 'text-violet-300', chip: 'bg-violet-500/15 text-violet-300' },
];

// Every number comes from GET /teams, which already counts each team's issues.
export default function DashboardStats({ teams }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {TILES.map(({ icon: Icon, label, field, value, chip }) => (
        <div key={label} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:gap-4 sm:p-5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 sm:gap-2 sm:text-base">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full sm:h-10 sm:w-10 ${chip}`}>
              <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </span>
            {label}
          </span>
          <span className={`text-2xl font-bold sm:text-4xl ${value}`}>
            {field ? teams.reduce((sum, team) => sum + team[field], 0) : teams.length}
          </span>
        </div>
      ))}
    </div>
  );
}
