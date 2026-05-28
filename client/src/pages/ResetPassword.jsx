import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Read email and token from query string when landing on this page.
    const queryEmail = searchParams.get('email') || '';
    const queryToken = searchParams.get('token') || '';
    setEmail(queryEmail);
    setToken(queryToken);
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await api.post('/auth/reset', { email, token, newPassword });
      setMessage(response.data.message);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password');
    }
  };

  return (
    <main className="page auth-page">
      <section className="card auth-card">
        <h1>Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Reset Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <button type="submit">Reset password</button>
        </form>
        <p>
          Back to <Link to="/">Login</Link>
        </p>
      </section>
    </main>
  );
}
