import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";
import "./Teachers.css";

function Teachers() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [teachers, setTeachers] = useState([]);
  const [salary, setSalary] = useState([]);
  const [batches, setBatches] = useState([]);
  
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [t, s, b] = await Promise.all([
        apiRequest("/teacher/list"),
        apiRequest("/teacher/salary"),
        apiRequest("/batch/list")
      ]);

      setTeachers(t.map(t => ({
        id: t._id,
        name: t.name,
        subject: t.subject,
        sharePercent: t.sharePercent,
        joinDate: t.joinDate,
        phone: t.phone,
        aadhar: t.aadharNumber
      })));
      setSalary(s);
      setBatches(b.map(batch => ({ id: batch._id, name: batch.name })));
    } catch {
      showToast("Failed to load teachers", "error");
    } finally {
      setLoading(false);
    }
  }
    
  useEffect(() => {
    loadData();
  }, []);

  const mergedTeachers = teachers.map(t => {
    const sal = salary.find(s => s.teacherId === t.id);
    return {
      ...t,
      totalRevenue: sal?.totalRevenue || 0,
      teacherEarning: sal?.teacherEarning || 0,
      ownerEarning: sal?.ownerEarning || 0
    };
  });
    
  const filteredTeachers = mergedTeachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );
    
  async function assignTeacher(e) {
    e.preventDefault();
    const form = e.target;
    
    try {
      await apiRequest("/batch/assign-teacher", "POST", {
        batchId: form.batchId.value,
        teacherId: form.teacherId.value
      });
      setShowAssignModal(false);
      showToast("Teacher assigned successfully", "success");
    } catch (err) {
      showToast(err.message || "Assignment failed", "error");
    }
  }

  function TeachersSkeleton() {
    return (
      <div className="teachers-container">
        <div className="page-header">
          <div>
            <div className="skeleton" style={{ width: 120, height: 28 }} />
            <div className="skeleton" style={{ width: 200, height: 14, marginTop: 6 }} />
          </div>
          <div className="skeleton" style={{ width: 120, height: 40, borderRadius: 10 }} />
        </div>
        <div className="stats-strip">
          {[...Array(3)].map((_, i) => (
            <div className="stat" key={i}>
              <div className="skeleton" style={{ width: 100, height: 12 }} />
              <div className="skeleton" style={{ width: 80, height: 28, marginTop: 8 }} />
            </div>
          ))}
        </div>
        <div className="card-grid">
          {[...Array(6)].map((_, i) => (
            <div className="teacher-card" key={i}>
              <div className="skeleton" style={{ width: "60%", height: 18 }} />
              <div className="skeleton" style={{ width: "40%", height: 12, marginTop: 8 }} />
              <div className="skeleton" style={{ width: "70%", height: 36, marginTop: 24 }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <div className="skeleton" style={{ width: "30%", height: 30, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: "30%", height: 30, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading && teachers.length === 0) return <TeachersSkeleton />;

  return (
    <div className="teachers-container">
      
      <div className="page-header">
        <div>
          <h2>Teachers</h2>
          <p>Manage teachers, batches and earnings</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowAssignModal(true)}>
            Assign Teacher
          </button>
          <button onClick={() => navigate("/teachers/new")}>
            + Add Teacher
          </button>
        </div>
      </div>

      {showAssignModal && (
        <div className="full-modal">
          <div className="modal-content">
            <h2>Assign Teacher to Batch</h2>
            <form onSubmit={assignTeacher} className="grid-form">
              <div className="form-group">
                <label>Select Teacher</label>
                <select name="teacherId" required>
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Batch</label>
                <select name="batchId" required>
                  <option value="">-- Choose Batch --</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit">Assign Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="search-bar">
        <input
          placeholder="Search teachers by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="stats-strip">
        <div className="stat">
          <p>Total Teachers</p>
          <h3>{teachers.length}</h3>
        </div>
        <div className="stat">
          <p>Total Revenue</p>
          <h3>₹{salary.reduce((s, t) => s + t.totalRevenue, 0).toLocaleString()}</h3>
        </div>
        <div className="stat">
          <p>Top Performer</p>
          <h3>
            {mergedTeachers.sort((a,b)=>b.totalRevenue-a.totalRevenue)[0]?.name || "N/A"}
          </h3>
        </div>
      </div>

      {filteredTeachers.length === 0 && (
        <div className="empty">
          <h3>No teachers found</h3>
          <p>Try searching or add a new teacher</p>
        </div>
      )}

      <div className="card-grid">
        {filteredTeachers.map(t => (
          <div className="teacher-card" key={t.id} onClick={() => navigate(`/teachers/edit/${t.id}`)}>
            <div className="card-header">
              <div>
                <h3>{t.name}</h3>
                <span className="subject">{t.subject}</span>
              </div>
              <span className={`badge ${t.totalRevenue > 5000 ? "high" : "low"}`}>
                {t.sharePercent}% Share
              </span>
            </div>
            
            <div className="main-metric">
              ₹{t.teacherEarning.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <small>Teacher Earning</small>
            </div>
            
            <div className="extra-metrics">
              <div>
                <p>Total Revenue</p>
                <strong>₹{t.totalRevenue.toLocaleString()}</strong>
              </div>
              <div>
                <p>Institute Share</p>
                <strong>₹{t.ownerEarning.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Teachers;