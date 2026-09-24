import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({ baseId: '', equipmentTypeId: '', startDate: '', endDate: '' });
  const [data, setData] = useState(null);
  const [showNetMovement, setShowNetMovement] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/bases').then((res) => setBases(res.data)).catch(() => {});
    api.get('/api/equipment-types').then((res) => setEquipmentTypes(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function fetchDashboard() {
    setLoading(true);
    const params = {};
    if (filters.baseId) params.baseId = filters.baseId;
    if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    api.get('/api/dashboard', { params })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <div className="filters">
        {user.role === 'ADMIN' && (
          <select value={filters.baseId} onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}>
            <option value="">All Bases</option>
            {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <select value={filters.equipmentTypeId} onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}>
          <option value="">All Equipment Types</option>
          {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
      </div>

      {loading && <p>Loading...</p>}

      {data && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Opening Balance</div>
            <div className="metric-value">{data.openingBalance}</div>
          </div>
          <div className="metric-card clickable" onClick={() => setShowNetMovement(true)}>
            <div className="metric-label">Net Movement</div>
            <div className="metric-value">{data.netMovement}</div>
            <div className="metric-sub">click for details</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Closing Balance</div>
            <div className="metric-value">{data.closingBalance}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Assigned</div>
            <div className="metric-value">{data.assigned}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Expended</div>
            <div className="metric-value">{data.expended}</div>
          </div>
        </div>
      )}

      {showNetMovement && data && (
        <div className="modal-backdrop" onClick={() => setShowNetMovement(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Net Movement Breakdown</h3>
            <p>Purchases: <strong>{data.purchases}</strong></p>
            <p>Transfers In: <strong>{data.transfersIn}</strong></p>
            <p>Transfers Out: <strong>{data.transfersOut}</strong></p>
            <p>Net Movement: <strong>{data.netMovement}</strong></p>
            <button onClick={() => setShowNetMovement(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
