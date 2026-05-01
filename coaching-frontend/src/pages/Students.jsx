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
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { showToast } = useToast();
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [newEnrollment, setNewEnrollment] = useState({
    batchId: "",
    feesPaid: ""
  });

  const [form, setForm] = useState({
    name: "",
    standard: "",
    subject: "",
    phone: "",
    aadhar: "",
    batches: [] 
  });

  // console.log("Batch object:", batches[0]);


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

        //  IMPORTANT
        batches: (s.batches || []).map(b => ({
          batchId: b.batchId,
          name: b.name,
          subject: b.subject,
          feesPaid: b.feesPaid || 0,
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


  // console.log();

  async function loadBatches() {
    setLoading(true);

    const data = await apiRequest("/batch/list");

    const normalized = data.map(b => ({
      _id: b._id,
      name: b.name
    }));

    setBatches(normalized);
    // console.log(batches);
    setLoading(false);
  }
  
  useEffect(() => {
    loadStudents();
    loadBatches();
    // console.log(students);
  }, []);

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

  async function leaveBatch(studentId, batchId) {
    if (!window.confirm("Leave this batch?")) return;

    try {
      await apiRequest("/student/leave-batch", "PUT", {
        studentId,
        batchId
      });

      loadStudents();

    } catch {
      alert("Failed to leave batch");
    }
  }

  async function addBatchToStudent(studentId, batchId) {
     try {
      await apiRequest("/student/enroll", "POST", {
        studentId,
        batchId
      });

      loadStudents();
      
    } catch {
      alert("Failed to add student to batch");
    }  
  }

  async function handleAddBatch() {
    const { batchId, feesPaid } = newEnrollment;

    if (!batchId ) {
      alert("Select batch");
      return;
    }

    await apiRequest("/student/enroll", "POST", {
      studentId: selectedStudent.id,
      batchId,
      feesPaid: Number(feesPaid)
    });

    await loadStudents();

    setNewEnrollment({
      batchId: "",
      feesPaid: ""
    });
  }
  
  function handleChange(e) {
    const { name, value } = e.target;

    const updated = {
      ...form,
      [name]: value
    };

    setForm(updated);

    //  Only depend on standard now
    if (name === "standard" && updated.standard) {
      fetchBatches(updated.standard);
    }
  }



  function openEditStudent(student) {
    setEditStudent({
      ...student,
      newBatchId: "" // for adding new batch
    });
    setShowEditModal(true);
  }

  async function addStudent(e) {
    e.preventDefault();

    if (!form.name || !form.standard) {
      alert("Name and Class are required");
      return;
    }

    if (!form.aadhar) {
      alert("Aadhar is required");
      return;
    }

    // console.log("Submitting:", e);
    try {
      await apiRequest("/student/add", "POST", {
        name: form.name,
        standard: form.standard,
        phone: form.phone,
        aadhar: form.aadhar,
        batches: form.batches
      });
  
      setShowModal(false);
      loadStudents();

      setForm({
        name: "",
        standard: "",
        subject: "",
        phone: "",
        aadhar: "",
        batchId: "",
        feePaid: ""
      });
  
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

  async function updateStudent(e) {
    e.preventDefault();
    const form = e.target;

    const updated = {
      name: form.name.value.trim(),
      standard: form.standard.value.trim(),
      phone: form.phone.value.trim(),
      aadhar: form.aadhar.value.trim()
    };

    try {
      await apiRequest(
        `/student/update/${selectedStudent.id}`,
        "PUT",
        updated
      );

      setSelectedStudent(null);
      loadStudents();

      showToast("Student updated successfully", "success");

    } catch (err) {
      showToast("Error updating student", "error");
    }
  }


  function addBatch(batchId) {
    const batch = filteredBatches.find(b => b._id === batchId);

    if (!batch) return;

    // prevent duplicate
    if (selectedBatches.some(b => b.batchId === batchId)) {
      showToast("Batch already added");
      return;
    }

    setSelectedBatches(prev => [
      ...prev,
      {
        batchId: batch._id,
        name: batch.name,
        feesPaid: batch.fees
      }
    ]);
  }

  function removeBatch(batchId) {
    setSelectedBatches(prev =>
      prev.filter(b => b.batchId !== batchId)
    );
  }

  const filteredStudents = students.filter(s => {
    const matchSearch = s.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchBatch = selectedBatch
      ? s.batchId === selectedBatch
      : true;

    return matchSearch && matchBatch;
  });

  // console.log(filteredStudents);
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
  // console.log(filteredBatches);
  // console.log(selectedStudent);
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

              {/* NAME */}
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
              />

              {/* STANDARD */}
              <input
                name="standard"
                value={form.standard}
                onChange={handleChange}
                placeholder="Standard"
              />

              <div className="batch-select">
                <select
                  onChange={(e) => {
                    const batchId = e.target.value;
                    if (!batchId) return;

                    const batch = filteredBatches.find(b => b._id === batchId);
                    if (!batch) return;

                    setForm(prev => {
                      //  prevent duplicate
                      if (prev.batches.some(b => b.batchId === batchId)) {
                        return prev;
                      }

                      return {
                        ...prev,
                        batches: [
                          ...prev.batches,
                          {
                            batchId: batch._id,
                            name: batch.name,
                            feesPaid: batch.fees
                          }
                        ]
                      };
                    });

                    e.target.value = ""; // reset dropdown
                  }}
                >
                  <option value="">Select Batch</option>

                  {filteredBatches.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.name} (₹{b.fees})
                    </option>
                  ))}
                </select>

              </div>

              {/* SELECTED BATCHES */}
              <div className="selected-batches">
                {form.batches.map(b => (
                  <div key={b.batchId} className="batch-chip">

                    <span>
                      {b.name} — ₹{b.feesPaid}
                    </span>

                    <button
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          batches: prev.batches.filter(x => x.batchId !== b.batchId)
                        }));
                      }}
                    >
                      ✕
                    </button>

                  </div>

                ))}
              </div>

              {/* PHONE */}
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone"
              />

              {/* AADHAR */}
              <input
                name="aadhar"
                value={form.aadhar}
                onChange={handleChange}
                placeholder="Aadhar ID"
              />

              {/* ACTIONS */}
              <div className="form-actions">
                <button type="submit">Add Student</button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                >
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
            key={s._id}
            onClick={() => setSelectedStudent(s)}
          >

            {/* TOP */}
            <div className="card-top">
              <div>
                <h3>{s.name}</h3>
                <span className="subtext">Class {s.standard}</span>
              </div>

             <span className={`status ${s.batches.status === "LEFT" ? "left" : "active"}`}>
              {s.status}
            </span>
            </div>

            {/*  TOTAL FEES */}
            <div className="fee">
              ₹{s.batches?.reduce((sum, b) => sum + (b.feesPaid || 0), 0)}
            </div>

            {/* BATCH LIST */}
            <div className="batch-list">
              {s.batches.map((b, i) => (
                <div key={i} className="batch-item">

                  <div>
                    <strong>{b.name}</strong>
                  </div>

                  <div className="batch-actions">

                    <span className={`status ${b.status === "LEFT" ? "left" : "active"}`}>
                      {b.status}
                    </span>

                    {b.status === "ACTIVE" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          leaveBatch(s.id, b.batchId);
                        }}
                      >
                        Leave
                      </button>
                    )}

                  </div>
                </div>
              ))}
            </div>

            {/* META */}
            <div className="meta">
              <span> 
              <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M224.2 89C216.3 70.1 195.7 60.1 176.1 65.4L170.6 66.9C106 84.5 50.8 147.1 66.9 223.3C104 398.3 241.7 536 416.7 573.1C493 589.3 555.5 534 573.1 469.4L574.6 463.9C580 444.2 569.9 423.6 551.1 415.8L453.8 375.3C437.3 368.4 418.2 373.2 406.8 387.1L368.2 434.3C297.9 399.4 241.3 341 208.8 269.3L253 233.3C266.9 222 271.6 202.9 264.8 186.3L224.2 89z"/></svg>
               {" " + s.phone}</span>
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

            {/*  BASIC INFO */}
            <form className="grid-form" onSubmit={updateStudent}>

              <div className="form-group">
                <label>Name</label>
                <input name="name" defaultValue={selectedStudent.name} />
              </div>

              <div className="form-group">
                <label>Standard</label>
                <input name="standard" defaultValue={selectedStudent.standard} />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input name="phone" defaultValue={selectedStudent.phone} />
              </div>

              <div className="form-group">
                <label>Aadhar number</label>
                <input name="aadhar" defaultValue={selectedStudent.aadhar} />
              </div>

              <div className="form-actions">
                <button type="submit">Update Info</button>
              </div>

            </form>

            {/*  BATCH MANAGEMENT */}
            <div className="batch-section">

              <h3>Enrolled Batches</h3>
              {selectedStudent.batches?.map((b, i) => (
                <div key={i} className="batch-item">

                  <div>
                    <strong>{"Batch : " + b.name + " "}</strong>
                    <br />
                    <small>
                      ₹{b.feesPaid + " "}
                      {b.feesPaid !== b.defaultFees && (
                        <span>
                         (default ₹{b.defaultFees})
                        </span>
                      )}
                    </small>
                  </div>

                  <div className="batch-actions">

                    <span className={`status ${b.status === "LEFT" ? "left" : "active"}`}>
                      {b.status}
                    </span>

                    {b.status === "ACTIVE" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          leaveBatch(selectedStudent.id, b.batchId);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div> 
                </div>
              ))}
            </div>

            {/*  ADD NEW BATCH */}
            <div className="add-batch">
              <input
                type="number"
                placeholder="Fee"
                value={newEnrollment.feesPaid}
                onChange={(e) =>
                  setNewEnrollment(prev => ({
                    ...prev,
                    feesPaid: e.target.value
                  }))
                }
              />

              <select
                value={newEnrollment.batchId}
                onChange={(e) => {
                  const batch = batches.find(b => b._id === e.target.value);

                  if (!batch) return;

                  setNewEnrollment({
                    batchId: batch._id,
                    feesPaid: batch.fees   // auto-fill default
                  });
                }}
              >
                <option value="">Select batch</option>

                {batches.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.name} (₹{b.fees})
                  </option>
                ))}
              </select>

              <button onClick={handleAddBatch}>
                Add
              </button>
            </div>

            {/* FOOTER */}
            <div className="card-footer">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  leaveStudent(selectedStudent.id);
                }}
              >
                Mark Leave
              </button>
            </div>

            <div className="form-actions">
              <button onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </div>
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