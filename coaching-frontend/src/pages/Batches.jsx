import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useToast } from "../context/ToastContext";
import "./Batches.css";

function Batches() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  async function loadData() {
    try {
      setLoading(true);

      const [b, t] = await Promise.all([
        apiRequest("/batch/list"),
        apiRequest("/teacher/list")
      ]);

      // normalize batches
      const normalizedBatches = b.map(batch => ({
        id: batch._id,
        name: batch.name,
        fees: batch.fees,
        standard: batch.standard,
        subject: batch.subject,
        timing: batch.batchTiming,
        teachers: batch.teachers || [] // IMPORTANT
      }));

      //  normalize teachers
      const normalizedTeachers = t.map(t => ({
        id: t._id,
        name: t.name
      }));

      setBatches(normalizedBatches);
      setTeachers(normalizedTeachers);

    } catch {
      showToast("Failed to load batches", "error");
    } finally {
      setLoading(false);
    }
  }

  async function addBatch(e) {
    e.preventDefault();

    const form = e.target;

    const payload = {
      name: form.name.value.trim(),
      fees: Number(form.fees.value) || 0,
      standard: form.standard.value.trim(),
      subject: form.subject.value.trim(),
      startDate: form.startDate.value,
      timing: form.timing.value
    };

    try {
      await apiRequest("/batch/add", "POST", payload);

      setShowModal(false);
      loadData();

      showToast("Batch created successfully");

    } catch {
      showToast("Failed to create batch", "error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);


  async function updateBatch(e) {
    e.preventDefault();

    const form = e.target;

    const payload = {
      name: form.name.value.trim(),
      fees: Number(form.fees.value) || 0,
      standard: form.standard.value.trim(),
      subject: form.subject.value.trim(),
      timing: form.timing.value
    };

    try {
      await apiRequest(`/batch/update/${selectedBatch.id}`, "PUT", payload);

      setSelectedBatch(null);
      loadData();

      showToast("Batch updated successfully");

    } catch {
      showToast("Failed to update batch", "error");
    }
  }


  async function removeTeacherFromBatch(batchId, teacherId) {
    if (!window.confirm("Remove this teacher from batch?")) return;
    try {
      await apiRequest("/batch/remove-teacher", "DELETE", {
        batchId,
        teacherId
      });

      showToast("Teacher removed");

      //  update UI instantly
      setSelectedBatch(prev => ({
        ...prev,
        teachers: prev.teachers.filter(t => t.id !== teacherId)
      }));

      loadData();

    } catch {
      showToast("Failed to remove teacher", "error");
    }
  }

//   console.log(batches);

  const filtered = batches.filter(b =>
    (b.name || '').toLowerCase().includes(search.toLowerCase())
  );

  function BatchesSkeleton() {
    return (
        <div className="teachers-container">

        {/* Header */}
        <div className="page-header">
            <div>
            <div className="skeleton" style={{ width: 120, height: 20 }} />
            <div className="skeleton" style={{ width: 200, height: 14, marginTop: 6 }} />
            </div>
            <div className="skeleton" style={{ width: 120, height: 36 }} />
        </div>

        {/* Stats */}
        <div className="stats-strip">
            {[...Array(3)].map((_, i) => (
            <div className="stat" key={i}>
                <div className="skeleton" style={{ width: 100, height: 12 }} />
                <div className="skeleton" style={{ width: 80, height: 20, marginTop: 8 }} />
            </div>
            ))}
        </div>

        <div className="search-bar">
            <div className="skeleton" style={{ width: 180, height: 36 }} />
        </div>

        {/* Cards */}
        <div className="card-grid">
            {[...Array(6)].map((_, i) => (
            <div className="teacher-card" key={i}>
                <div className="skeleton" style={{ width: "60%", height: 16 }} />
                <div className="skeleton" style={{ width: "40%", height: 12, marginTop: 6 }} />

                <div className="skeleton" style={{ width: "70%", height: 24, marginTop: 12 }} />

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <div className="skeleton" style={{ width: "30%", height: 14 }} />
                <div className="skeleton" style={{ width: "30%", height: 14 }} />
                </div>
            </div>
            ))}
        </div>

        </div>
    );
  }

  if (loading) return <BatchesSkeleton />;

  return (
    <div className="batches-container">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2>Batches</h2>
          <p>Manage batches and schedules</p>
        </div>

        <button onClick={() => setShowModal(true)}>
          + Add Batch
        </button>
      </div>


      {showModal && (
        <div className="full-modal">
          <div className="modal-content">

            <h2>Add Batch</h2>

            <form onSubmit={addBatch} className="grid-form">

              <input name="name" placeholder="Batch Name" required />
              <input name="fees" placeholder="Fees" required />
              <input name="standard" placeholder="Standard" required />
              <input name="subject" placeholder="Subject" required />
              <input type="date" name="startDate" required />
              <input name="timing" type="time" placeholder="Timing" required />

              <div className="form-actions">
                <button type="submit">Create Batch</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* STATS */}
      <div className="stats-strip">
        <div className="stat">
          <p>Total Batches</p>
          <h3>{batches.length}</h3>
        </div>

        <div className="stat">
          <p>Avg Fee</p>
          <h3>
            ₹
            {Math.round(
              batches.reduce((s, b) => s + Number(b.fees || 0), 0) /
              (batches.length || 1)
            )}
          </h3>
        </div>
      </div>

      {/* SEARCH */}
      <div className="search-bar">
        <input
            placeholder="Search batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="card-grid">
        {filtered.map(b => (
          <div
            className="batch-card"
            key={b.id}
            onClick={() => setSelectedBatch(b)}
          >

            <div className="card-header">
              <h3>{b.name}</h3>
              <span className="badge">
                ₹{b.fees}
              </span>
            </div>

            <div className="meta">
              <p>
                {b.teachers.length > 0
                  ? b.teachers.map(t => t.name).join(", ")
                  : "No teacher"}
              </p>
              <p>{b.batchTiming || b.timing}</p>
            </div>

          </div>
        ))}
      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <div className="empty">
          <h3>No batches found</h3>
        </div>
      )}

      {/* DETAILS */}
      {selectedBatch && (
        <div className="full-modal">
          <div className="modal-content">

            <div className="modal-header">
              <h2>Edit Batch</h2>
              <button onClick={() => setSelectedBatch(null)}>✕</button>
            </div>

            <form onSubmit={updateBatch} className="grid-form">

              <div className="form-group">
                <label>Name</label>
                <input name="name" defaultValue={selectedBatch.name} />
              </div>

              <div className="form-group">
                <label>Standard</label>
                <input name="standard" defaultValue={selectedBatch.standard} />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input name="subject" defaultValue={selectedBatch.subject} />
              </div>

              <div className="form-group">
                <label>Fees</label>
                <input name="fees" defaultValue={selectedBatch.fees} />
              </div>

              <div className="form-group">
                {/* <label>Current Timing</label>
                <input defaultValue={selectedBatch.timing} /> */}
                <label>Timing</label>
                <input name="timing" type="time" defaultValue={selectedBatch.timing} />
              </div>

              {/*  TEACHERS SECTION */}
              <div className="form-group">
                <label>Teachers</label>

                {selectedBatch.teachers.length === 0 && (
                  <p>No teachers assigned</p>
                )}

                {selectedBatch.teachers.map(t => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span>{t.name}</span>

                    <button
                      type="button"
                      onClick={() => removeTeacherFromBatch(selectedBatch.id, t.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit">Update</button>
                <button type="button" onClick={() => setSelectedBatch(null)}>
                  Close
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default Batches;