import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Assignments() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filters, setFilters] = useState({ equipmentTypeId: '', startDate: '', endDate: '' });
  const [form, setForm] = useState({ baseId: user.baseId || '', equipmentTypeId: '', personnelName: '', quantity: '', assignedDate: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/bases').then((res) => setBases(res.data));
    api.get('/api/equipment-types').then((res) => setEquipmentTypes(res.data));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function load() {
    const params = {};
    if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    api.get('/api/assignments', { params }).then((res) => setAssignments(res.data));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/assignments', form);
      setForm({ ...form, personnelName: '', quantity: '', assignedDate: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record assignment');
    }
  }

  async function handleExpend(id) {
    await api.patch(`/api/assignments/${id}/expend`);
    load();
  }

  const active = assignments.filter((a) => a.status === 'ASSIGNED');
  const expended = assignments.filter((a) => a.status === 'EXPENDED');

  return (
    <div className="page">
      <div className="page-header">
        <h2>Assignments &amp; Expenditures</h2>
        <p className="page-subtitle">Assign assets to personnel and record expenditures</p>
      </div>

      <div className="panel">
        <div className="panel-title">New Assignment</div>
        <form className="inline-form" onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          {user.role === 'ADMIN' && (
            <select value={form.baseId} onChange={(e) => setForm({ ...form, baseId: e.target.value })} required>
              <option value="">Base</option>
              {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <select value={form.equipmentTypeId} onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })} required>
            <option value="">Equipment Type</option>
            {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input placeholder="Personnel Name" value={form.personnelName} onChange={(e) => setForm({ ...form, personnelName: e.target.value })} required />
          <input type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          <input type="date" value={form.assignedDate} onChange={(e) => setForm({ ...form, assignedDate: e.target.value })} required />
          <button type="submit">Assign</button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-title-row">
          <div className="panel-title">Active Assignments</div>
          <div className="filters filters-compact">
            <select value={filters.equipmentTypeId} onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}>
              <option value="">All Equipment Types</option>
              {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
        </div>
        <table>
          <thead>
            <tr><th>Person</th><th>Equipment</th><th>Base</th><th>Qty</th><th>Assigned</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {active.map((a) => (
              <tr key={a.id}>
                <td>{a.personnelName}</td>
                <td>{a.equipmentType.name}</td>
                <td>{a.base.name}</td>
                <td>{a.quantity}</td>
                <td>{a.assignedDate}</td>
                <td><span className="status-badge assigned">Assigned</span></td>
                <td><button onClick={() => handleExpend(a.id)}>Mark Expended</button></td>
              </tr>
            ))}
            {active.length === 0 && (
              <tr><td colSpan="7" className="muted">No active assignments.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <div className="panel-title">Expenditure History</div>
        <table>
          <thead>
            <tr><th>Person</th><th>Equipment</th><th>Base</th><th>Qty</th><th>Expended On</th><th>Status</th></tr>
          </thead>
          <tbody>
            {expended.map((a) => (
              <tr key={a.id}>
                <td>{a.personnelName}</td>
                <td>{a.equipmentType.name}</td>
                <td>{a.base.name}</td>
                <td>{a.quantity}</td>
                <td>{a.expendedDate}</td>
                <td><span className="status-badge expended">Expended</span></td>
              </tr>
            ))}
            {expended.length === 0 && (
              <tr><td colSpan="6" className="muted">No expenditures recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
