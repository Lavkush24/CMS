import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";

import "./Fees.css";

function Fees() {

  const navigate = useNavigate();
  const { id } = useParams();

  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(null);

  const [selectedBatch, setSelectedBatch] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    paymentMethod: "CASH",
    coveredMonths: "",
    note: ""
  });

  useEffect(() => {
    loadFees();
  }, []);

  async function loadFees() {

    try {

      const res = await apiRequest(
        `/fees/details/${id}`
      );

      setData(res);

    } catch (e) {

      showToast(
        e.message || "Failed to load fee details",
        "error"
      );

    } finally {

      setLoading(false);
    }
  }

  async function handlePayment(e) {

    e.preventDefault();

    if (!selectedBatch) return;

    try {

      await apiRequest(
        `/fees/${id}`,
        "POST",
        {
          batchId: selectedBatch.batchId,

          amountPaid: Number(paymentForm.amountPaid),

          paymentMethod:
            paymentForm.paymentMethod,

          coveredMonths:
            paymentForm.coveredMonths
              .split(",")
              .map(m => m.trim()),

          note: paymentForm.note
        }
      );

      showToast(
        "Fees recorded successfully",
        "success"
      );

      setSelectedBatch(null);

      setPaymentForm({
        amountPaid: "",
        paymentMethod: "CASH",
        coveredMonths: "",
        note: ""
      });

      loadFees();

    } catch (e) {

      showToast(
        e.message || "Payment failed",
        "error"
      );
    }
  }

  function FeesSkeleton() {
    return (
      <div className="fees-container">
        
        {/* HEADER SKELETON */}
        <div className="fees-header" style={{ marginBottom: "24px" }}>
          <div>
            <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 150, height: 16 }} />
          </div>
          <div className="skeleton" style={{ width: 80, height: 36, borderRadius: 8 }} />
        </div>

        {/* STUDENT CARD SKELETON */}
        <div className="fees-student-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="skeleton" style={{ width: "30%", height: 24 }} />
          <div style={{ display: "flex", gap: 16 }}>
            <div className="skeleton" style={{ width: 80, height: 16 }} />
            <div className="skeleton" style={{ width: 120, height: 16 }} />
          </div>
        </div>

        {/* SUMMARY SKELETON (3 Cards) */}
        <div className="fees-summary-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="summary-card">
              <div className="skeleton" style={{ width: "50%", height: 14 }} />
              <div className="skeleton" style={{ width: "70%", height: 36, marginTop: 8 }} />
            </div>
          ))}
        </div>

        {/* BATCH GRID SKELETON (2 Cards) */}
        <div className="fees-batch-grid">
          {[1, 2].map((i) => (
            <div key={i} className="fees-batch-card">
              {/* Batch Top */}
              <div className="batch-top">
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: "60%", height: 22, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: "40%", height: 14 }} />
                </div>
                <div className="skeleton" style={{ width: 50, height: 22, borderRadius: 99 }} />
              </div>

              {/* Batch Info */}
              <div className="batch-info">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="skeleton" style={{ width: "30%", height: 14 }} />
                    <div className="skeleton" style={{ width: "20%", height: 14 }} />
                  </div>
                ))}
              </div>

              {/* Button */}
              <div className="skeleton" style={{ width: "100%", height: 44, borderRadius: 10, marginBottom: 24 }} />

              {/* History */}
              <div className="payment-history">
                <div className="skeleton" style={{ width: "40%", height: 16, marginBottom: 16 }} />
                {[1, 2].map(j => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div className="skeleton" style={{ width: 60, height: 16, marginBottom: 6 }} />
                      <div className="skeleton" style={{ width: 40, height: 12 }} />
                    </div>
                    <div className="skeleton" style={{ width: 80, height: 14 }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    );
  }

  if (loading) {
    return (
      <FeesSkeleton/>
    );
  }

  if (!data) {
    return (
      <div className="fees-loading">
        No fee data found
      </div>
    );
  }

  return (
    <div className="fees-container">

      {/* HEADER */}
      <div className="fees-header">

        <div>
          <h2>Student Fee Details</h2>

          <p>
            Manage payments and fee records
          </p>
        </div>

        <button
          className="btn-back"
          onClick={() => navigate("/students")}
        >
          ← Back
        </button>

      </div>

      {/* STUDENT CARD */}
      <div className="fees-student-card">

        <h3>{data.student.name}</h3>

        <div className="student-meta">

          <span>
            Class {data.student.standard}
          </span>

          <span>
            {data.student.phone}
          </span>

        </div>

      </div>

      {/* SUMMARY */}
      <div className="fees-summary-grid">

        <div className="summary-card">

          <h4>Total Expected</h4>

          <p>
            ₹{data.summary.totalExpected}
          </p>

        </div>

        <div className="summary-card">

          <h4>Total Paid</h4>

          <p className="paid">
            ₹{data.summary.totalPaid}
          </p>

        </div>

        <div className="summary-card">

          <h4>Remaining</h4>

          <p className="remaining">
            ₹{data.summary.totalRemaining}
          </p>

        </div>

      </div>

      {/* BATCHES */}
      <div className="fees-batch-grid">

        {data.batches.map(batch => (

          <div
            className="fees-batch-card"
            key={batch.batchId}
          >

            <div className="batch-top">

              <div>
                <h3>{batch.batchName}</h3>

                <span>
                  {batch.subject}
                </span>
              </div>

              <span
                className={`status ${
                  batch.remainingFees > 0
                    ? "due"
                    : "paid"
                }`}
              >
                {batch.remainingFees > 0
                  ? "DUE"
                  : "PAID"}
              </span>

            </div>

            <div className="batch-info">

              <p>
                Monthly Fees:
                ₹{batch.batchFees}
              </p>

              <p>
                Expected:
                ₹{batch.expectedFees}
              </p>

              <p>
                Paid:
                ₹{batch.totalPaid}
              </p>

              <p className="remaining-text">
                Remaining:
                ₹{batch.remainingFees}
              </p>

            </div>

            <button
              className="btn-collect"
              onClick={() => setSelectedBatch(batch)}
            >
              Collect Fees
            </button>

            {/* HISTORY */}

            <div className="payment-history">

              <h4>Payment History</h4>

              {batch.paymentHistory.length === 0 && (
                <p className="empty-history">
                  No payments yet
                </p>
              )}

              {batch.paymentHistory.map((p, i) => (

                <div
                  className="payment-item"
                  key={i}
                >

                  <div>

                    <strong>
                      ₹{p.amountPaid}
                    </strong>

                    <p>
                      {p.paymentMethod}
                    </p>

                  </div>

                  <div className="payment-date">

                    {new Date(
                      p.paidAt
                    ).toLocaleDateString()}

                  </div>

                </div>
              ))}

            </div>

          </div>
        ))}

      </div>

      {/* PAYMENT MODAL */}

      {selectedBatch && (

        <div className="modal-overlay">

          <div className="payment-modal">

            <div className="modal-header">

              <h3>
                Collect Fees
              </h3>

              <button
                onClick={() =>
                  setSelectedBatch(null)
                }
              >
                ✕
              </button>

            </div>

            <form onSubmit={handlePayment}>

              <div className="input-group">

                <label>Amount Paid</label>

                <input
                  type="number"
                  value={paymentForm.amountPaid}
                  onChange={(e) =>
                    setPaymentForm(prev => ({
                      ...prev,
                      amountPaid:
                        e.target.value
                    }))
                  }
                />

              </div>

              <div className="input-group">

                <label>
                  Payment Method
                </label>

                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) =>
                    setPaymentForm(prev => ({
                      ...prev,
                      paymentMethod:
                        e.target.value
                    }))
                  }
                >

                  <option value="CASH">
                    CASH
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="BANK">
                    BANK
                  </option>

                  <option value="CARD">
                    CARD
                  </option>

                </select>

              </div>

              <div className="input-group">

                <label>
                  Covered Months
                </label>

                <input
                  placeholder="2026-05, 2026-06"
                  value={
                    paymentForm.coveredMonths
                  }
                  onChange={(e) =>
                    setPaymentForm(prev => ({
                      ...prev,
                      coveredMonths:
                        e.target.value
                    }))
                  }
                />

              </div>

              <div className="input-group">

                <label>Note</label>

                <textarea
                  value={paymentForm.note}
                  onChange={(e) =>
                    setPaymentForm(prev => ({
                      ...prev,
                      note: e.target.value
                    }))
                  }
                />

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() =>
                    setSelectedBatch(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-submit"
                >
                  Save Payment
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Fees;