import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { SidebarContext } from './SidebarContext';
import { rowClasses } from './rowClasses';

export default function NavItem({ to, label, icon: Icon }) {
  const { collapsed, expand, onNavigate } = useContext(SidebarContext);
  return (
    <NavLink
      to={to}
      onClick={() => { expand(); onNavigate(); }}
      title={collapsed ? label : undefined}
      className={({ isActive }) => rowClasses(collapsed, isActive)}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && label}
    </NavLink>
  );
}
