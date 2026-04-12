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
      setBatches(b);
      setTeachers(t);
      setLoading(false);
      
    } catch {
      showToast("Failed to load batches", "error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

//   console.log(batches);
  const getTeacherName = (id) =>
    teachers.find(t => t.id === id)?.name || "Unknown";

  const filtered = batches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
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
              <p>{getTeacherName(b.teacherId)}</p>
              <p>{b.timing}</p>
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

            <h2>{selectedBatch.name}</h2>

            <p><strong>Teacher:</strong> {getTeacherName(selectedBatch.teacherId)}</p>
            <p><strong>Fee:</strong> ₹{selectedBatch.fees}</p>
            <p><strong>Timing:</strong> {selectedBatch.timing}</p>

            <button onClick={() => setSelectedBatch(null)}>
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Batches;