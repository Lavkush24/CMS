import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";
import "./StudentRegistration.css";
import Toast from "../components/Toast";



function StudentRegistration() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [payNow, setPayNow] = useState("no");
  
  const [form, setForm] = useState({
    name: "",
    standard: "",
    phone: "",
    aadhar: "",
    batches: [] 
  });

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.standard) {
      showToast("Name and Standard are required", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest("/student/add", "POST", {
        name: form.name,
        standard: form.standard,
        phone: form.phone,
        aadhar: form.aadhar,
        batches: form.batches
      });

      showToast("Student registered successfully!", "success");

      if (payNow === "yes") {
        navigate(`/fee/${res.student._id}`);
      } else {
        navigate("/students");
      }

    } catch (e) {
      showToast("Error registering student", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "standard") {
      fetchBatches(value);
      // Optional: Clear selected batches if standard changes
      setForm((prev) => ({ ...prev, batches: [] })); 
    }
  }

 async function fetchBatches(standard, subject) {
    if (!standard) return;
    // console.log("called ");
 
    try {
      const data = await apiRequest(
        `/batch/filter?standard=${standard}`
      );
 
      // console.log(data);
 
      setFilteredBatches(data);
    } catch {
      showToast("Failed to load batches", "error");
    }
  }

  function handleBatchSelect(e) {
    const batchId = e.target.value;
    if (!batchId) return;

    const batch = filteredBatches.find((b) => b._id === batchId);
    if (!batch) return;

    setForm((prev) => {
      // Prevent duplicate batch selection
      if (prev.batches.some((b) => b.batchId === batchId)) {
        return prev;
      }
      return {
        ...prev,
        batches: [
          ...prev.batches,
          {
            batchId: batch._id,
            name: batch.name,
            batchFees: batch.batchFees || 0
          }
        ]
      };
    });

    e.target.value = ""; // Reset dropdown
  }

  function removeBatch(batchId) {
    setForm((prev) => ({
      ...prev,
      batches: prev.batches.filter((b) => b.batchId !== batchId)
    }));
  }

  return (
    <div className="registration-container">
      
      <div className="registration-header">
        <div>
          <h2>Student Registration</h2>
          <p>Enroll a new student and assign them to batches</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/students")}>
          ← Back to List
        </button>
      </div>

      <div className="registration-card">
        <form onSubmit={handleSubmit} className="registration-form">
          
          <div className="form-section">
            <h3>Personal Details</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>Full Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter student's full name"
                //   required
                />
              </div>

              <div className="input-group">
                <label>Standard / Class *</label>
                <input
                  name="standard"
                  value={form.standard}
                  onChange={handleChange}
                  placeholder="e.g. 10th"
                //   required
                />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Parent or Student contact"
                />
              </div>

              <div className="input-group">
                <label>Aadhar ID</label>
                <input
                  name="aadhar"
                  value={form.aadhar}
                  onChange={handleChange}
                  placeholder="12-digit Aadhar number"
                />
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="form-section">
            <h3>Batch Enrollment</h3>
            <p className="section-hint">Select a Standard above to see available batches.</p>
            
            <div className="batch-selector">
              <select onChange={handleBatchSelect} disabled={filteredBatches.length === 0}>
                <option value="">
                  {filteredBatches.length === 0 ? "Enter standard to load batches..." : "Select a batch to add..."}
                </option>
                {filteredBatches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} (₹{b.batchFees})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Batches Chips */}
            {form.batches.length > 0 && (
              <div className="selected-batches-area">
                <h4>Selected Batches:</h4>
                <div className="chip-container">
                  {form.batches.map((b) => (
                    <div key={b.batchId} className="reg-batch-chip">
                      <span>{b.name} — ₹{b.batchFees}</span>
                      <button type="button" onClick={() => removeBatch(b.batchId)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {form.batches.length > 0 && (
            <div className={`fee-selector`}>
              <span>Do you want to collect fees now?</span>
              <div className={`radio-option ${payNow === "yes" ? "selected" : ""}`}>
                <input
                  type="radio"
                  id="yes"
                  name="payNow"
                  value="yes"
                  checked={payNow === "yes"}
                  onChange={(e) => setPayNow(e.target.value)}
                />
                <label htmlFor="yes">
                  Yes
                </label>
              </div>
              <div className={`radio-option ${payNow === "no" ? "selected" : ""}`}>
                <input
                  type="radio"
                  id="no"
                  name="payNow"
                  value="no"
                  checked={payNow === "no"}
                  onChange={(e) => setPayNow(e.target.value)}
                />
                <label htmlFor="no">
                  No
                </label>
              </div>
            </div>
          )} 

          <div className="form-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => navigate("/students")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Registering..." : "Register Student"}
            </button>
          </div>
        </form>
      </div>
        {toast && (
            <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            />
        )}
    </div>
  );
}

export default StudentRegistration;