import React from 'react';

const FeeSummaryCard = ({ summary }) => {
  return (
    <div className="card data-grid">
      
      <div>
        <div className="text-subtext font-mono" style={{ fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>
          Total Expected
        </div>
        <div className="font-mono" style={{ fontSize: '32px', fontWeight: '600', color: 'var(--text)' }}>
          ${summary.totalExpected.toLocaleString()}
        </div>
      </div>

      <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
        <div className="text-subtext font-mono" style={{ fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>
          Total Paid
        </div>
        <div className="font-mono" style={{ fontSize: '32px', fontWeight: '600', color: 'var(--success)' }}>
          ${summary.totalPaid.toLocaleString()}
        </div>
      </div>

      <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
        <div className="text-subtext font-mono" style={{ fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>
          Total Remaining
        </div>
        <div className="font-mono" style={{ fontSize: '32px', fontWeight: '600', color: 'var(--danger)' }}>
          ${summary.totalRemaining.toLocaleString()}
        </div>
      </div>

    </div>
  );
};

export default FeeSummaryCard;