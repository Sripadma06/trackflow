import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const today = new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="top-header">
      <div className="top-header-date">{today}</div>
      <div className="top-header-user">
        <span className="user-pill">{user.username} &middot; {user.role.replace('_', ' ')}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
