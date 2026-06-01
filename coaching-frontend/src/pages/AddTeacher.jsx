import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";
import "./AddTeacher.css";

function AddTeacher() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [mode, setMode] = useState("none"); // none | existing | new

  // Form State
  const [form, setForm] = useState({
    name: "",
    subject: "",
    sharePercent: "",
    joinDate: "",
    phone: "",
    aadhar: "",
    // Existing Batch
    batchId: "",
    // New Batch
    batchName: "",
    batchFees: "",
    startDate: "",
    timing: ""
  });

  useEffect(() => {
    async function fetchBatches() {
      try {
        const b = await apiRequest("/batch/list");
        setBatches(b.map(batch => ({ id: batch._id, name: batch.name })));
      } catch (err) {
        showToast("Failed to load batches", "error");
      }
    }
    fetchBatches();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      subject: form.subject.trim(),
      sharePercent: Number(form.sharePercent) || 0,
      joinDate: form.joinDate,
      phone: form.phone.trim(),
      aadhar: form.aadhar.trim(),
      mode
    };

    // Attach batch data based on mode
    if (mode === "existing") {
      if (!form.batchId) return showToast("Please select a batch", "error");
      payload.batchId = form.batchId;
    }

    if (mode === "new") {
      if (!form.batchName || !form.batchFees || !form.startDate) {
        setLoading(false);
        return showToast("Please fill all new batch details", "error");
      }
      payload.batchName = form.batchName.trim();
      payload.batchFees = Number(form.batchFees) || 0;
      payload.startDate = form.startDate;
      payload.timing = form.timing.trim();
    }

    try {
      await apiRequest("/teacher/add", "POST", payload);
      showToast("Teacher added successfully!", "success");
      navigate("/teachers"); // Go back to teacher list
    } catch (err) {
      showToast(err.message || "Failed to add teacher", "error");
      setLoading(false);
    }
  }

  return (
    <div className="add-teacher-container">
      
      <div className="page-header">
        <div>
          <h2>Add New Teacher</h2>
          <p>Register a new faculty member and configure their batch assignments</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/teachers")}>
          ← Back to List
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          
          {/* ─── PERSONAL DETAILS ─── */}
          <div className="form-section">
            <h3>Personal & Role Details</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Doe" required />
              </div>

              <div className="input-group">
                <label>Subject Specialization *</label>
                <input name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Mathematics" required />
              </div>

              <div className="input-group">
                <label>Revenue Share (%) *</label>
                <input type="number" name="sharePercent" value={form.sharePercent} onChange={handleChange} placeholder="e.g. 40" required />
              </div>

              <div className="input-group">
                <label>Joining Date *</label>
                <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Contact number" required />
              </div>

              <div className="input-group">
                <label>Aadhar ID *</label>
                <input name="aadhar" value={form.aadhar} onChange={handleChange} placeholder="12-digit Aadhar" required />
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* ─── BATCH ASSIGNMENT ─── */}
          <div className="form-section">
            <h3>Batch Assignment</h3>
            <p className="section-hint">Decide if this teacher will take over an existing batch or start a new one.</p>
            
            <div className="input-group" style={{ maxWidth: '400px', marginBottom: '20px' }}>
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="none">No immediate batch assignment</option>
                <option value="existing">Assign to an Existing Batch</option>
                <option value="new">Create a entirely New Batch</option>
              </select>
            </div>

            {mode === "existing" && (
              <div className="assignment-box">
                <div className="input-group">
                  <label>Select Existing Batch</label>
                  <select name="batchId" value={form.batchId} onChange={handleChange} required>
                    <option value="">-- Choose a batch --</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {mode === "new" && (
              <div className="assignment-box">
                <h4>New Batch Details</h4>
                <div className="input-grid">
                  <div className="input-group">
                    <label>Batch Name</label>
                    <input name="batchName" value={form.batchName} onChange={handleChange} placeholder="e.g. Class 10 Physics" required />
                  </div>
                  <div className="input-group">
                    <label>Batch Fees (₹)</label>
                    <input type="number" name="batchFees" value={form.batchFees} onChange={handleChange} placeholder="e.g. 1500" required />
                  </div>
                  <div className="input-group">
                    <label>Start Date</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Timing</label>
                    <input name="timing" value={form.timing} onChange={handleChange} placeholder="e.g. MWF 4PM - 5PM" required />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── ACTIONS ─── */}
          <div className="form-footer">
            <button type="button" className="btn-cancel" onClick={() => navigate("/teachers")}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Saving..." : "Register Teacher"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddTeacher;