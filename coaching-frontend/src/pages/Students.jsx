import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import "./Students.css";
import Toast from "../components/Toast";
import EditStudent from "./EditStudent";

function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("");
  
  // Controls the Edit Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Keep selected student fresh after re-fetching
  function refreshSelectedStudent(updatedList) {
    setSelectedStudent(prev => {
      if (!prev) return null;
      return updatedList.find(s => s.id === prev.id) || null;
    });
  }

  async function loadStudents() {
    setLoading(true);
    try {
      const data = await apiRequest("/student/list");
      const normalized = data.map(s => ({
        id: s._id,
        name: s.name,
        standard: s.standard,
        aadhar: s.aadharNumber,
        phone: s.phone,
        batches: (s.batches || []).map(b => ({
          batchId: b.batchId,
          name: b.name,
          subject: b.subject,
          fees: b.fees || 0,
          batchFees: b.batchFees || 0,
          status: b.status || "ACTIVE"
        }))
      }));

      setStudents(normalized);
      refreshSelectedStudent(normalized);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadBatches() {
    const data = await apiRequest("/batch/list");
    setBatches(data.map(b => ({
      _id: b._id,
      name: b.name,
      batchFees: b.batchFees,
      standard: b.standard
    })));
  }

  useEffect(() => {
    loadStudents();
    loadBatches();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchBatch = selectedBatchFilter
      ? s.batches.some(b => b.batchId === selectedBatchFilter)
      : true;
    return matchSearch && matchBatch;
  });

  function StudentsSkeleton() {
    return (
      <div style={{ padding: 20 }}>
        <div className="page-header">
          <div>
            <div className="skeleton" style={{ width: 120, height: 20 }} />
            <div className="skeleton" style={{ width: 200, height: 14, marginTop: 6 }} />
          </div>
          <div className="skeleton" style={{ width: 120, height: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 180, height: 36 }} />
          <div className="skeleton" style={{ width: 150, height: 36 }} />
        </div>
        <div className="card-grid">
          <div className="table-header">
            <div>Student Details</div>
            <div>Total Fees</div>
            <div>Enrolled Batches</div>
            <div style={{ textAlign: "right" }}>Contact Info</div>
          </div>
          {[...Array(6)].map((_, i) => (
            <div className="student-card" key={i}>
              <div className="skeleton" style={{ width: "70%", height: 24 }} />
              <div className="skeleton" style={{ width: "50%", height: 16 }} />
              <div className="skeleton" style={{ width: "90%", height: 24, borderRadius: 99 }} />
              <div className="skeleton" style={{ width: "100%", height: 16 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading && students.length === 0) return <StudentsSkeleton />;

  return (
    <div className="students-container">
      <div className="page-header">
        <div>
          <h2>Students</h2>
          <p>Manage students, track fees, and monitor batches</p>
        </div>
        {/* Navigates to the new Student Registration page we built earlier */}
        <button onClick={() => navigate("/students/new")}>
          + Add Student
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={selectedBatchFilter}
          onChange={(e) => setSelectedBatchFilter(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches.map(b => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
      </div>

      {filteredStudents.length === 0 && (
        <div className="empty-state">
          <h3>No students found</h3>
          <p>Try changing filters or add a new student</p>
        </div>
      )}

      {filteredStudents.length > 0 && (
        <div className="card-grid">
          <div className="table-header">
            <div>Student Details</div>
            <div>Total Fees</div>
            <div>Enrolled Batches</div>
            <div style={{ textAlign: "right" }}>Contact Info</div>
          </div>

          {filteredStudents.map(s => {
            const isStudentLeft = s.batches.length > 0 && s.batches.every(b => b.status === "LEFT");
            
            return (
              <div
                className={`student-card ${isStudentLeft ? "left-card" : ""}`}
                key={s.id}
                onClick={() => navigate(`/students/edit/${s.id}`)}
              >
                {/* 1. STUDENT DETAILS */}
                <div className="card-top">
                  <div>
                    <h3>{s.name}</h3>
                    <span className="subtext">Class {s.standard}</span>
                  </div>
                  <span className={`status ${isStudentLeft ? "left" : "active"}`}>
                    {isStudentLeft ? "LEFT" : "ACTIVE"}
                  </span>
                </div>

                {/* 2. TOTAL FEES */}
                <div className="fee">
                  ₹{s.batches?.reduce((sum, b) => sum + (b.fees || b.batchFees || 0), 0)}
                </div>

                {/* 3. ENROLLED BATCHES */}
                <div className="batch-list">
                  {s.batches.map((b, i) => (
                    <div key={i} className="batch-item">
                      <strong>{b.name}</strong>
                    </div>
                  ))}
                </div>

                {/* 4. CONTACT INFO */}
                <div className="meta">
                  <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z"/></svg>
                  {" " + s.phone}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MOUNT EXTRACTED EDIT COMPONENT ─── */}
      {selectedStudent && (
        <EditStudent
          student={selectedStudent}
          allBatches={batches}
          onClose={() => setSelectedStudent(null)}
          onUpdate={loadStudents}
        />
      )}

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

export default Students;