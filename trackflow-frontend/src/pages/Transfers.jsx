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
      <div className="page-header">
        <h2>Transfers</h2>
        <p className="page-subtitle">Move assets between bases with a full audit trail</p>
      </div>

      {canCreate && (
        <div className="panel">
          <div className="panel-title">Transfer Asset</div>
          <form className="transfer-form" onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            <div className="transfer-form-row">
              <div className="transfer-field">
                <label>From Base</label>
                <select value={form.fromBaseId} onChange={(e) => setForm({ ...form, fromBaseId: e.target.value })} required>
                  <option value="">Select base</option>
                  {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="transfer-arrow">&rarr;</div>
              <div className="transfer-field">
                <label>To Base</label>
                <select value={form.toBaseId} onChange={(e) => setForm({ ...form, toBaseId: e.target.value })} required>
                  <option value="">Select base</option>
                  {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="transfer-form-row">
              <div className="transfer-field">
                <label>Equipment</label>
                <select value={form.equipmentTypeId} onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })} required>
                  <option value="">Select equipment</option>
                  {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="transfer-field">
                <label>Quantity</label>
                <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              <div className="transfer-field">
                <label>Transfer Date</label>
                <input type="date" value={form.transferDate} onChange={(e) => setForm({ ...form, transferDate: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="transfer-submit">Create Transfer</button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-title-row">
          <div className="panel-title">Transfer History</div>
          <div className="filters filters-compact">
            <select value={filters.equipmentTypeId} onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}>
              <option value="">All Equipment Types</option>
              {equipmentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
        </div>

        <div className="transfer-list">
          {transfers.map((t) => (
            <div className="transfer-item" key={t.id}>
              <div className="transfer-item-route">
                <span>{t.fromBase.name}</span>
                <span className="route-arrow">&#8594;</span>
                <span>{t.toBase.name}</span>
              </div>
              <div className="transfer-item-detail">
                <span>{t.equipmentType.name}</span>
                <span>{t.quantity} units</span>
                <span>{t.transferDate}</span>
                <span className="status-badge recorded">Completed</span>
              </div>
            </div>
          ))}
          {transfers.length === 0 && <p className="muted">No transfers recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
