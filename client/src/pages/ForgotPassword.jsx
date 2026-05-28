import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

// Page to request a password reset email.
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/forgot', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to request password reset');
    }
  };

  return (
    <main className="page auth-page">
      <section className="card auth-card">
        <h1>Forgot Password</h1>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <button type="submit">Send reset email</button>
        </form>
        <p>
          Remembered your password? <Link to="/">Login here</Link>
        </p>
      </section>
    </main>
  );
}
