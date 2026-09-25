import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({ baseId: '', equipmentTypeId: '', startDate: '', endDate: '' });
  const [data, setData] = useState(null);
  const [recentTransfers, setRecentTransfers] = useState([]);
  const [showNetMovement, setShowNetMovement] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/bases').then((res) => setBases(res.data)).catch(() => {});
    api.get('/api/equipment-types').then((res) => setEquipmentTypes(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchRecentTransfers();
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

  function fetchRecentTransfers() {
    const params = {};
    if (filters.baseId) params.baseId = filters.baseId;
    if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
    api.get('/api/transfers', { params })
      .then((res) => setRecentTransfers(res.data.slice(0, 6)))
      .catch(() => {});
  }

  const available = data ? data.closingBalance - data.assigned : null;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Asset overview and movement activity</p>
      </div>

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

      {loading && <p className="muted">Loading...</p>}

      {data && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card kpi-opening">
              <div className="kpi-label">Opening Balance</div>
              <div className="kpi-value">{data.openingBalance.toLocaleString()}</div>
              <div className="kpi-caption">Assets at start</div>
            </div>
            <div className="kpi-card kpi-net clickable" onClick={() => setShowNetMovement(true)}>
              <div className="kpi-label">Net Movement</div>
              <div className="kpi-value">{data.netMovement >= 0 ? '+' : ''}{data.netMovement.toLocaleString()}</div>
              <div className="kpi-caption kpi-link">Purchases + Transfers &middot; click for details</div>
            </div>
            <div className="kpi-card kpi-closing">
              <div className="kpi-label">Closing Balance</div>
              <div className="kpi-value">{data.closingBalance.toLocaleString()}</div>
              <div className="kpi-caption">Current balance</div>
            </div>
            <div className="kpi-card kpi-assigned">
              <div className="kpi-label">Assigned</div>
              <div className="kpi-value">{data.assigned.toLocaleString()}</div>
              <div className="kpi-caption">Currently assigned</div>
            </div>
            <div className="kpi-card kpi-expended">
              <div className="kpi-label">Expended</div>
              <div className="kpi-value">{data.expended.toLocaleString()}</div>
              <div className="kpi-caption">Assets expended</div>
            </div>
          </div>

          <div className="split-grid">
            <div className="panel">
              <div className="panel-title">Net Movement</div>
              <div className="breakdown-row"><span>Purchases</span><span className="pos">+{data.purchases}</span></div>
              <div className="breakdown-row"><span>Transfer In</span><span className="pos">+{data.transfersIn}</span></div>
              <div className="breakdown-row"><span>Transfer Out</span><span className="neg">-{data.transfersOut}</span></div>
              <div className="breakdown-row breakdown-total"><span>Net Movement</span><span>{data.netMovement >= 0 ? '+' : ''}{data.netMovement}</span></div>
            </div>
            <div className="panel">
              <div className="panel-title">Asset Status</div>
              <div className="breakdown-row"><span>Assigned</span><span className="assigned-color">{data.assigned}</span></div>
              <div className="breakdown-row"><span>Expended</span><span className="expended-color">{data.expended}</span></div>
              <div className="breakdown-row breakdown-total"><span>Available (est.)</span><span>{available}</span></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">Recent Transfers</div>
            {recentTransfers.length === 0 && <p className="muted">No transfers recorded yet.</p>}
            {recentTransfers.length > 0 && (
              <table>
                <thead>
                  <tr><th>Date</th><th>Equipment</th><th>From</th><th>To</th><th>Qty</th></tr>
                </thead>
                <tbody>
                  {recentTransfers.map((t) => (
                    <tr key={t.id}>
                      <td>{t.transferDate}</td>
                      <td>{t.equipmentType.name}</td>
                      <td>{t.fromBase.name}</td>
                      <td>{t.toBase.name}</td>
                      <td>{t.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {showNetMovement && data && (
        <div className="modal-backdrop" onClick={() => setShowNetMovement(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Net Movement</h3>
            <p className="modal-date">{filters.startDate || 'All time'} &ndash; {filters.endDate || 'today'}</p>
            <div className="breakdown-row"><span>Purchases</span><span className="pos">+{data.purchases}</span></div>
            <div className="breakdown-row"><span>Transfer In</span><span className="pos">+{data.transfersIn}</span></div>
            <div className="breakdown-row"><span>Transfer Out</span><span className="neg">-{data.transfersOut}</span></div>
            <div className="breakdown-row breakdown-total"><span>Net Movement</span><span>{data.netMovement >= 0 ? '+' : ''}{data.netMovement}</span></div>
            <button onClick={() => setShowNetMovement(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
