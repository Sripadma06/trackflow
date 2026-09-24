import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">TrackFlow</div>
      <div className="navbar-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        {(user.role === 'ADMIN' || user.role === 'LOGISTICS_OFFICER' || user.role === 'BASE_COMMANDER') && (
          <NavLink to="/purchases">Purchases</NavLink>
        )}
        {(user.role === 'ADMIN' || user.role === 'LOGISTICS_OFFICER' || user.role === 'BASE_COMMANDER') && (
          <NavLink to="/transfers">Transfers</NavLink>
        )}
        {(user.role === 'ADMIN' || user.role === 'BASE_COMMANDER') && (
          <NavLink to="/assignments">Assignments</NavLink>
        )}
      </div>
      <div className="navbar-user">
        <span>{user.username} · {user.role}{user.baseName ? ` · ${user.baseName}` : ''}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
