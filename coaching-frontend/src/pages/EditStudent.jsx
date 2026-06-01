import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";
import "./EditStudent.css";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newEnrollment, setNewEnrollment] = useState({
    batchId: "",
    fees: ""
  });

  // Load student and batches independently
  async function loadData() {
    setLoading(true);
    try {
      // Fetch all batches
      const batchData = await apiRequest("/batch/list");
      setAllBatches(batchData.map(b => ({
        _id: b._id,
        name: b.name,
        batchFees: b.batchFees,
        standard: b.standard
      })));

      // Fetch student data (using your existing list endpoint to find the specific one)
      const studentList = await apiRequest("/student/list");
      const s = studentList.find(x => x._id === id);

      if (!s) {
        showToast("Student not found", "error");
        navigate("/students");
        return;
      }

      setStudent({
        id: s._id,
        name: s.name,
        standard: s.standard,
        phone: s.phone,
        aadhar: s.aadharNumber,
        batches: (s.batches || []).map(b => ({
          batchId: b.batchId,
          name: b.name,
          fees: b.fees || 0,
          batchFees: b.batchFees || 0,
          status: b.status || "ACTIVE"
        }))
      });

    } catch (err) {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function updateBasicInfo(e) {
    e.preventDefault();
    const form = e.target;

    const updated = {
      name: form.name.value.trim(),
      // standard: form.standard.value.trim(),
      phone: form.phone.value.trim(),
      aadhar: form.aadhar.value.trim()
    };

    try {
      await apiRequest(`/student/update/${student.id}`, "PUT", updated);
      showToast("Student details updated", "success");
      loadData(); // Refresh data
    } catch (err) {
      showToast("Error updating student", "error");
    }
  }

  async function handleAddBatch() {
    try {
      const { batchId, fees } = newEnrollment;
      if (!batchId) {
        showToast("Please select a batch", "error");
        return;
      }

      await apiRequest("/student/enroll", "POST", {
        studentId: student.id,
        batchId,
        fees: Number(fees)
      });

      showToast("Batch added successfully", "success");
      setNewEnrollment({ batchId: "", fees: "" });
      loadData(); // Refresh list
    } catch (e) {
      showToast("Error adding batch", "error");
    }
  }

  async function leaveBatch(batchId) {
    if (!window.confirm("Leave this batch?")) return;
    try {
      await apiRequest("/student/leave-batch", "PUT", { studentId: student.id, batchId });
      showToast("Unenrolled from batch", "success");
      loadData();
    } catch {
      showToast("Failed to leave batch", "error");
    }
  }

  async function deleteBatch(batchId) {
    if (!window.confirm("Remove this batch entirely?")) return;
    try {
      await apiRequest("/student/delete-batch", "DELETE", { studentId: student.id, batchId });
      showToast("Batch removed from history", "success");
      loadData();
    } catch {
      showToast("Failed to delete batch", "error");
    }
  }

  if (loading || !student) {
    return <div className="loading-state">Loading student details...</div>;
  }

  const availableBatches = allBatches.filter(b => b.standard === student.standard);

  return (
    <div className="edit-page-container">
      
      <div className="edit-page-header">
        <div>
          <h2>Edit Student Profile</h2>
          <p>Update personal details and manage batch enrollments for {student.name}</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/students")}>
          ← Back to List
        </button>

        <button className="btn-fee" onClick={() => navigate(`/fee/${id}`)}>
          go to fees
        </button>
      </div>

      <div className="edit-card">
        {/* ─── BASIC INFO FORM ─── */}
        <form onSubmit={updateBasicInfo} className="edit-form">
          <div className="form-section">
            <h3>Personal Details</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input name="name" defaultValue={student.name} required />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input name="phone" defaultValue={student.phone} />
              </div>

              <div className="input-group">
                <label>Aadhar ID</label>
                <input name="aadhar" defaultValue={student.aadhar} />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-save">Save Changes</button>
            </div>
          </div>
        </form>

        <hr className="divider" />

        {/* ─── BATCH MANAGEMENT ─── */}
        <div className="form-section">
          <h3>Enrolled Batches</h3>
          
          <div className="batch-list-wrapper">
            {student.batches?.length === 0 && (
              <div className="empty-batch-state">
                Student is not enrolled in any batches.
              </div>
            )}

            {student.batches?.map((b, i) => (
              <div key={i} className="edit-batch-row">
                <div className="batch-info">
                  <strong>{b.name}</strong>
                  <span className="batch-fee">
                    ₹{b.fees} {b.fees !== b.batchFees && <span className="default-fee">(default ₹{b.batchFees})</span>}
                  </span>
                </div>

                <div className="batch-actions">
                  <span className={`status ${b.status === "LEFT" ? "left" : "active"}`}>
                    {b.status}
                  </span>

                  {b.status === "ACTIVE" && (
                    <button type="button" className="btn-unenroll" onClick={() => leaveBatch(b.batchId)}>
                      Unenroll
                    </button>
                  )}

                  {b.status === "LEFT" && (
                    <button type="button" className="btn-remove" onClick={() => deleteBatch(b.batchId)}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ─── ADD NEW BATCH ─── */}
          <div className="add-batch-controls">
            <select
              value={newEnrollment.batchId}
              onChange={(e) => {
                const batch = availableBatches.find(b => b._id === e.target.value);
                if (!batch) return;
                setNewEnrollment({
                  batchId: batch._id,
                  fees: batch.batchFees 
                });
              }}
            >
              <option value="">Select a batch to add...</option>
              {availableBatches.map(b => (
                <option key={b._id} value={b._id}>
                  {b.name} (₹{b.batchFees})
                </option>
              ))}
            </select>
            
            <input
              type="number"
              placeholder="Fee"
              value={newEnrollment.fees}
              onChange={(e) => setNewEnrollment(prev => ({ ...prev, fees: e.target.value }))}
            />

            <button type="button" className="btn-add" onClick={handleAddBatch}>
              Add Batch
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}