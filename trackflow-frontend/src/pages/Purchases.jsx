import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Purchases() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [filters, setFilters] = useState({ equipmentTypeId: '', startDate: '', endDate: '' });
  const [form, setForm] = useState({ baseId: user.baseId || '', equipmentTypeId: '', quantity: '', purchaseDate: '' });
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
    api.get('/api/purchases', { params }).then((res) => setPurchases(res.data));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/purchases', form);
      setForm({ ...form, quantity: '', purchaseDate: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record purchase');
    }
  }

  const canCreate = user.role === 'ADMIN' || user.role === 'LOGISTICS_OFFICER';

  return (
    <div className="page">
      <div className="page-header">
        <h2>Purchases</h2>
        <p className="page-subtitle">Record and track asset purchases</p>
      </div>

      {canCreate && (
        <div className="panel">
          <div className="panel-title">Record Purchase</div>
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
            <input type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} required />
            <button type="submit">+ Record Purchase</button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-title-row">
          <div className="panel-title">Purchase History</div>
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
            <tr><th>Date</th><th>Base</th><th>Equipment</th><th>Quantity</th><th>Recorded By</th><th>Status</th></tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td>{p.purchaseDate}</td>
                <td>{p.base.name}</td>
                <td>{p.equipmentType.name}</td>
                <td>{p.quantity}</td>
                <td>{p.createdBy}</td>
                <td><span className="status-badge recorded">Recorded</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
