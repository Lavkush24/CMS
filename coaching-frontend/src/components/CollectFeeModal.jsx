import React, { useState } from 'react';

const CollectFeeModal = ({ studentId, batches, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    batchId: '',
    amountPaid: '',
    coveredMonths: '',
    paymentMethod: 'CASH',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Format array for coveredMonths from comma-separated string
    const monthsArray = formData.coveredMonths
      ? formData.coveredMonths.split(',').map(m => m.trim())
      : [];

    const payload = {
      batchId: formData.batchId,
      amountPaid: Number(formData.amountPaid),
      coveredMonths: monthsArray,
      paymentMethod: formData.paymentMethod,
      note: formData.note
    };

    try {
      const response = await fetch(`/api/fees/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your setup
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record fee');
      }

      onSuccess(); // Triggers re-fetch and modal close in parent
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-overlay">
      <div className="modal-content">
        
        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px' }}>Record Payment</h2>
        
        {error && (
          <div style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Select Batch</label>
            <select name="batchId" required value={formData.batchId} onChange={handleChange}>
              <option value="" disabled>Choose a batch...</option>
              {batches.map(b => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchName} ({b.subject}) - Bal: ${b.remainingFees}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Amount Paid ($)</label>
              <input 
                type="number" 
                name="amountPaid" 
                required 
                min="1" 
                value={formData.amountPaid} 
                onChange={handleChange} 
                placeholder="0.00"
                className="font-mono"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Covered Months (Optional)</label>
            <input 
              type="text" 
              name="coveredMonths" 
              value={formData.coveredMonths} 
              onChange={handleChange} 
              placeholder="e.g. Jan, Feb, Mar"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea 
              name="note" 
              rows="3" 
              value={formData.note} 
              onChange={handleChange} 
              placeholder="Any additional remarks..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Record Payment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CollectFeeModal;