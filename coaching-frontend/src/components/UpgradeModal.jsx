
function UpgradeModal({ onClose, onUpgrade }) {
  return (
    <div className="full-modal">
      <div className="modal-content wide">

        <h2>Upgrade to Pro 🚀</h2>
        <p>Unlock powerful features for your coaching</p>

        <div className="pricing-grid">

          {/* FREE */}
          <div className="plan-card">
            <h3>Free</h3>
            <p className="price">₹0</p>
            <ul>
              <li>Basic student management</li>
              <li>Limited features</li>
            </ul>
          </div>

          {/* PRO */}
          <div className="plan-card highlight">
            <h3>Pro</h3>
            <p className="price">₹199/month</p>
            <ul>
              <li>Revenue analytics</li>
              <li>Charts & insights</li>
              <li>Unlimited data</li>
            </ul>

            <button onClick={() => onUpgrade?.()}>
                Upgrade Now
            </button>
          </div>

        </div>

        <button onClick={onClose} className="close-btn">
          Cancel
        </button>

      </div>
    </div>
  );
}

export default UpgradeModal;