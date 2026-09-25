import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/purchases', label: 'Purchases', roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
      { to: '/transfers', label: 'Transfers', roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
      { to: '/assignments', label: 'Assignments', roles: ['ADMIN', 'BASE_COMMANDER'] },
    ],
  },
  {
    label: 'Security',
    items: [
      { to: '/audit-logs', label: 'Audit Logs', roles: ['ADMIN'] },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">&#9670;</span> TrackFlow
      </div>
      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((i) => i.roles.includes(user.role));
          if (visibleItems.length === 0) return null;
          return (
            <div className="sidebar-group" key={group.label}>
              <div className="sidebar-group-label">{group.label}</div>
              {visibleItems.map((item) => (
                <NavLink key={item.to} to={item.to} className="sidebar-link">
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        Role: <strong>{user.role.replace('_', ' ')}</strong>
        {user.baseName && <div>Base: {user.baseName}</div>}
      </div>
    </aside>
  );
}
