import React from 'react';

const PaymentHistory = ({ batch }) => {
  return (
    <div className="card" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
      
      {/* Header Info */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{batch.batchName}</h3>
            <span className="badge">{batch.subject}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="text-subtext" style={{ fontSize: '13px' }}>Remaining Balance</div>
            <div className="font-mono" style={{ color: 'var(--danger)', fontWeight: '600', fontSize: '18px' }}>
              ${batch.remainingFees.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div>
        <div className="list-grid-header font-mono">
          <div>Date</div>
          <div>Amount</div>
          <div>Months Covered</div>
          <div>Method</div>
        </div>

        {batch.paymentHistory.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }} className="text-subtext">
            No payments recorded for this batch yet.
          </div>
        ) : (
          batch.paymentHistory.map((payment, index) => (
            <div key={index} className="list-grid-row">
              <div className="font-mono" style={{ fontSize: '14px' }}>
                {new Date(payment.paidAt).toLocaleDateString()}
              </div>
              <div className="font-mono" style={{ fontWeight: '500' }}>
                ${payment.amountPaid.toLocaleString()}
              </div>
              <div className="text-subtext" style={{ fontSize: '13px' }}>
                {payment.coveredMonths.length > 0 ? payment.coveredMonths.join(', ') : 'N/A'}
              </div>
              <div>
                <span className="badge" style={{ 
                  background: 'color-mix(in srgb, var(--primary) 12%, transparent)', 
                  color: 'var(--primary)',
                  borderColor: 'color-mix(in srgb, var(--primary) 25%, transparent)'
                }}>
                  {payment.paymentMethod}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;