import { useState } from 'react';
import api from '../api';

// Form for submitting a new maintenance report.
export default function ReportForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('location', location);
    if (image) formData.append('image', image);

    setIsSubmitting(true);
    setMessage('Sending your report...');

    try {
      await api.post('/reports', formData);
      setMessage('Your report has been received successfully.');
      setTitle('');
      setDescription('');
      setLocation('');
      setImage(null);
      onCreated();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <label>Issue title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>Description</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

      <label>Location</label>
      <input value={location} onChange={(e) => setLocation(e.target.value)} required />

      <label>Image (optional)</label>
      <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Submit report'}
      </button>
      {message && <p className="info">{message}</p>}
    </form>
  );
}
