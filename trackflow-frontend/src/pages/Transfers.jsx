import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Transfers() {
  const { user } = useAuth();
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [filters, setFilters] = useState({ equipmentTypeId: '', startDate: '', endDate: '' });
  const [form, setForm] = useState({ fromBaseId: user.baseId || '', toBaseId: '', equipmentTypeId: '', quantity: '', transferDate: '' });
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
    api.get('/api/transfers', { params }).then((res) => setTransfers(res.data));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/transfers', form);
      setForm({ ...form, quantity: '', transferDate: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record transfer');
    }
  }

  const canCreate = user.role === 'ADMIN' || user.role === 'LOGISTICS_OFFICER';

  return (
    <div className="page">
      <h2>Transfers</h2>

      {canCreate && (
        <form className="inline-form" onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <select value={form.fromBaseId} onChange={(e) => setForm({ ...form, fromBaseId: e.target.value })} required>
            <option value="">From Base</option>
            {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={form.toBaseId} onChange={(e) => setForm({ ...form, toBaseId: e.target.value })} required>
            <option value="">To Base</option>
            {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={form.equipmentTypeId} onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })} required>
            <option value="">Equipment Type</option>
            {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          <input type="date" value={form.transferDate} onChange={(e) => setForm({ ...form, transferDate: e.target.value })} required />
          <button type="submit">Record Transfer</button>
        </form>
      )}

      <div className="filters">
        <select value={filters.equipmentTypeId} onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}>
          <option value="">All Equipment Types</option>
          {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
      </div>

      <table>
        <thead>
          <tr><th>Date</th><th>From</th><th>To</th><th>Equipment</th><th>Quantity</th><th>Recorded By</th></tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.id}>
              <td>{t.transferDate}</td>
              <td>{t.fromBase.name}</td>
              <td>{t.toBase.name}</td>
              <td>{t.equipmentType.name}</td>
              <td>{t.quantity}</td>
              <td>{t.createdBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
