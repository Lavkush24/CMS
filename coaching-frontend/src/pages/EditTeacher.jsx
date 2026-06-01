import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";
import "./EditTeacher.css";

function EditTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    subject: "",
    sharePercent: "",
    phone: "",
    aadhar: ""
  });

  useEffect(() => {
    async function fetchTeacher() {
      try {
        setLoading(true);
        // Fetch the list and find the specific teacher
        const list = await apiRequest("/teacher/list");
        const teacher = list.find(t => t._id === id);

        if (!teacher) {
          showToast("Teacher not found", "error");
          navigate("/teachers");
          return;
        }

        setForm({
          name: teacher.name || "",
          subject: teacher.subject || "",
          sharePercent: teacher.sharePercent || "",
          phone: teacher.phone || "",
          aadhar: teacher.aadharNumber || ""
        });
      } catch (err) {
        showToast("Failed to load teacher details", "error");
      } finally {
        setLoading(false);
      }
    }
    
    fetchTeacher();
  }, [id, navigate, showToast]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);

    try {
      await apiRequest(`/teacher/update/${id}`, "PUT", {
        name: form.name.trim(),
        subject: form.subject.trim(),
        sharePercent: Number(form.sharePercent) || 0,
        phone: form.phone.trim(),
        aadhar: form.aadhar.trim()
      });
      showToast("Teacher updated successfully!", "success");
      navigate("/teachers");
    } catch (err) {
      showToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to completely remove this teacher? This action cannot be undone.")) return;
    
    try {
      await apiRequest(`/teacher/delete/${id}`, "DELETE");
      showToast("Teacher deleted successfully", "success");
      navigate("/teachers");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  }

  if (loading) {
    return <div className="loading-state">Loading teacher details...</div>;
  }

  return (
    <div className="edit-teacher-container">
      
      <div className="page-header">
        <div>
          <h2>Edit Teacher Details</h2>
          <p>Update personal and professional information</p>
        </div>
        <button className="btn-back" onClick={() => navigate("/teachers")}>
          ← Back to List
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleUpdate}>
          
          <div className="form-section">
            <h3>Profile Information</h3>
            
            <div className="input-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Subject</label>
                <input name="subject" value={form.subject} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Share Percent (%)</label>
                <input type="number" name="sharePercent" value={form.sharePercent} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Aadhar ID</label>
                <input name="aadhar" value={form.aadhar} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <hr className="divider" />

          <div className="form-actions">
            <button type="button" className="btn-delete" onClick={handleDelete}>
              Delete Teacher
            </button>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-cancel" onClick={() => navigate("/teachers")}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditTeacher;