import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import "./Students.css";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import Table from "../components/Table";
import { useToast } from "../context/ToastContext";

function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { showToast } = useToast();

  async function loadStudents() { 
    setLoading(true);
    const data = await apiRequest("/student/list");
    setStudents(data);
    setLoading(false);
  }

  async function loadBatches() {
    setLoading(true);
    const data = await apiRequest("/batch/list"); 
    setBatches(data);
    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
    loadBatches();
  }, []);

  async function addStudent(e) {
    e.preventDefault();

    const form = e.target;

    const newStudent = {
      name: form.name.value,
      standard: form.standard.value,
      phone: form.phone.value,
      feePaid: form.feePaid.value,
      aadhar: form.aadhar.value,
      batchId: form.batchId.value //  FIXED
    };

    if (!newStudent.name || !newStudent.standard) {
      alert("Name and Class are required");
      return;
    }

    if (!newStudent.batchId) {
      alert("Please select a batch");
      return;
    }

    if (!newStudent.aadhar) {
      alert("Aadhar is required");
      return;
    }

    console.log("Submitting:", newStudent);
    try {
      await apiRequest("/student/add", "POST", newStudent);
  
      setShowModal(false);
      loadStudents();
  
      showToast("Student added successfully", "success");
    }
    catch(e) {
      showToast("Error adding student", "error");
    }
  }

  async function leaveStudent(id) {
    try {
      await apiRequest(`/student/leave/${id}`, "PUT");
      loadStudents();

      showToast("Student marked as left");
    } catch {
      showToast("Error updating student", "error");
    }
  }


  const filteredStudents = students.filter(s => {
    const matchSearch = s.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchBatch = selectedBatch
      ? s.batch === selectedBatch
      : true;

    return matchSearch && matchBatch;
  });

  function StudentsSkeleton() {
    return (
      <div style={{ padding: 20 }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <div className="skeleton" style={{ width: 120, height: 20 }} />
            <div className="skeleton" style={{ width: 200, height: 14, marginTop: 6 }} />
          </div>
          <div className="skeleton" style={{ width: 120, height: 36 }} />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 180, height: 36 }} />
          <div className="skeleton" style={{ width: 150, height: 36 }} />
        </div>

        {/* Cards */}
        <div className="card-grid">
          {[...Array(6)].map((_, i) => (
            <div className="student-card" key={i}>

              {/* Name */}
              <div className="skeleton" style={{ width: "60%", height: 16 }} />

              {/* Class */}
              <div className="skeleton" style={{ width: "40%", height: 12, marginTop: 6 }} />

              {/* Fee */}
              <div className="skeleton" style={{ width: "50%", height: 22, marginTop: 12 }} />

              {/* Meta */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <div className="skeleton" style={{ width: "30%", height: 12 }} />
                <div className="skeleton" style={{ width: "30%", height: 12 }} />
              </div>

            </div>
          ))}
        </div>

      </div>
    );
  }
  // console.log(batches);
  // console.log(filteredStudents);
  
  if (loading) return <StudentsSkeleton />;

  return (
    <div className="students-container">
      <div className="page-header">
        <div>
          <h2>Students</h2>
          <p>Manage students, track fees, and monitor batches</p>
        </div>

        <button onClick={() => setShowModal(true)}>
          + Add Student
        </button>
      </div>

      {showModal && (
        <div className="full-modal">
          <div className="modal-content">

            <h2>Add Student</h2>

            <form onSubmit={addStudent} className="grid-form">

              <input name="name" placeholder="Full Name" required />

              <input name="standard" placeholder="Class" required />

              <input name="phone" placeholder="Phone" />

              <input name="aadhar" placeholder="Aadhar ID" />

              <input name="feePaid" placeholder="Fee Paid" />

              {/* <input type="date" name="joinDate" /> */}

              <select name="batchId">
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <div className="form-actions">
                <button type="submit">Add Student</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}



      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: "10px", padding: "8px" }}
        />

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          <option value="">All Batches</option>

          {batches.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

       {filteredStudents.length === 0 && (
        <div className="empty-state">
          <h3>No students found</h3>
          <p>Try changing filters or add a new student</p>
        </div>
      )}

      <div className="card-grid">
        {filteredStudents.map(s => (
          <div
            className="student-card"
            key={s.id}
            onClick={() => setSelectedStudent(s)}
          >

            {/* TOP */}
            <div className="card-top">
              <div>
                <h3>{s.name}</h3>
                <span className="subtext">Class {s.standard}</span>
              </div>

              <span className={`status ${s.status === "LEFT" ? "left" : "active"}`}>
                {s.status || "ACTIVE"}
              </span>
            </div>

            {/* MAIN */}
            <div className="fee">
              {/* <small> Fee </small> */}
              ₹{s.feePaid}
            </div>


            {/* META */}
            <div className="meta">
              <span>{s.phone}</span>
              <span>
                {batches.find(b => b.id === s.batch)?.name || "No Batch"}
              </span>
            </div>


            <div className="card-footer">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  leaveStudent(s.id);
                }}
              >
                Mark Leave
              </button>
            </div>

          </div>
        ))}
      </div>


      {selectedStudent && (
        <div className="full-modal">
          <div className="modal-content">

            <div className="modal-header">
              <h2>Edit Student</h2>
              <button onClick={() => setSelectedStudent(null)}>✕</button>
            </div>

            <form className="grid-form">

              <div className="form-group">
                <label>Name</label>
                <input defaultValue={selectedStudent.name} />
              </div>
              <div className="form-group">
                <label>Class</label>
                <input defaultValue={selectedStudent.standard} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input defaultValue={selectedStudent.phone} />
              </div>
              <div className="form-group">
                <label>Aadhar number</label>
                <input defaultValue={selectedStudent.aadhar} />
              </div>

              <div className="form-actions">
                <button>Update</button>
                <button onClick={() => setSelectedStudent(null)}>
                  Close
                </button>
              </div>

            </form>
          </div>
        </div>
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