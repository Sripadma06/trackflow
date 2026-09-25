import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/api/audit-logs').then((res) => {
      const sorted = [...res.data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(sorted);
    });
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Audit Logs</h2>
        <p className="page-subtitle">Every login and write action, logged for accountability</p>
      </div>
      <div className="panel">
        <table>
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Details</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.timestamp).toLocaleString()}</td>
                <td>{l.username}</td>
                <td><span className="status-badge recorded">{l.action}</span></td>
                <td>{l.entityName ? `${l.entityName} #${l.entityId}` : '-'}</td>
                <td className="muted">{l.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="5" className="muted">No audit entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
