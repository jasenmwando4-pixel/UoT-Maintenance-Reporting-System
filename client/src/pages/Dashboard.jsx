import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import api from '../api';
import ReportForm from '../components/ReportForm';
import ReportList from '../components/ReportList';

// Dashboard page for authenticated users.
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  const loadReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load reports');
    }
  };

  useEffect(() => {
    // Load reports when the dashboard opens.
    loadReports();
  }, []);

  return (
    <main className="page dashboard-page">
      <header className="topbar">
        <div>
          <h1>UoT Maintenance Reporting</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="button secondary">Logout</button>
      </header>

      <section className="grid two-column">
        <article className="card">
          <h2>Create a maintenance report</h2>
          <ReportForm onCreated={loadReports} />
        </article>

        <article className="card">
          <h2>Your maintenance reports</h2>
          {error && <p className="error">{error}</p>}
          <ReportList reports={reports} onRefresh={loadReports} user={user} />
        </article>
      </section>
    </main>
  );
}
