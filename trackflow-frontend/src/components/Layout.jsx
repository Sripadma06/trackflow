import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopHeader />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
