import api from '../api';

// Component to render a list of reports.
// It displays report details and action buttons depending on user role and report state.
export default function ReportList({ reports, onRefresh, user }) {
  // Handle user actions for resolving or deleting a report.
  const handleAction = async (id, actionLabel, actionType) => {
    if (!window.confirm(`${actionLabel} this report?`)) return;

    try {
      if (actionType === 'resolve') {
        // Admin resolves the report by updating its status to Resolved.
        await api.put(`/reports/${id}`, { status: 'Resolved' });
      } else {
        // Admin deletes a resolved report.
        await api.delete(`/reports/${id}`);
      }
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || `${actionLabel} failed`);
    }
  };

  // Show fallback text when there are no reports.
  if (!reports.length) {
    return <p>No reports submitted yet.</p>;
  }

  return (
    <div className="report-list">
      {reports.map((report) => {
        const isAdmin = user?.role === 'admin';
        // Only show Resolve button to admins for unresolved reports.
        const showResolve = isAdmin && report.status !== 'Resolved';
        // Only show Delete button to admins for already resolved reports.
        const showDelete = isAdmin && report.status === 'Resolved';

        return (
          <section key={report.id} className="report-card">
            <div className="report-header">
              <h3>{report.title}</h3>
              <span className="status">{report.status}</span>
            </div>
            <p>{report.description}</p>
            <p><strong>Location:</strong> {report.location}</p>
            <p><strong>Reporter:</strong> {report.reporter_name}</p>

            {report.image_url && (
              // Show the report image only when it exists.
              <img src={`http://localhost:5000${report.image_url}`} alt={report.title} />
            )}

            {showResolve && (
              <button className="button" onClick={() => handleAction(report.id, 'Resolve', 'resolve')}>
                Resolve
              </button>
            )}
            {showDelete && (
              <button className="button danger" onClick={() => handleAction(report.id, 'Delete', 'delete')}>
                Delete
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
