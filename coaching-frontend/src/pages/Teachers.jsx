import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import "./Teachers.css";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [salary, setSalary] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const { showToast } = useToast();

  //  LOAD DATA
  async function loadData() {
      try {
          setLoading(true);
          
          const [t, s] = await Promise.all([
              apiRequest("/teacher/list"),
              apiRequest("/teacher/salary")
            ]);
            
            setTeachers(t);
            setSalary(s);
            
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
    // console.log(teachers);
    
  async function addTeacher(e) {
    e.preventDefault();

    const form = e.target;

    const newTeacher = {
      name: form.name.value,
      sharePercent: Number(form.sharePercent.value),
      subject: form.subject.value,
      joinDate: form.joinDate.value,
      phone: form.phone.value,
      aadhar: form.aadhar.value,
      batchName: form.batchName.value,
      fee: Number(form.fee.value),
      timing: form.timing.value
    };

    try {
      await apiRequest("/teacher/add", "POST", newTeacher);

      setShowModal(false);
      loadData();

      showToast("Teacher added successfully");
    } catch {
      showToast("Failed to add teacher", "error");
    }
  }

  function TeachersSkeleton() {
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

  if (loading) return <TeachersSkeleton />;

 return (
    <div className="teachers-container">
        <div className="page-header">
            <div>
                <h2>Teachers</h2>
                <p>Manage teachers, batches and earnings</p>
            </div>

            <button onClick={() => setShowModal(true)}>
                + Add Teacher
            </button>
        </div>

        {showModal && (
            <div className="full-modal">
                <div className="modal-content wide">

                <h2>Add Teacher</h2>

                <form onSubmit={addTeacher} className="grid-form">

                    <input name="name" placeholder="Name" required />
                    <input name="subject" placeholder="Subject" />
                    <input name="sharePercent" placeholder="Share %" />

                    <input type="date" name="joinDate" />
                    <input name="phone" placeholder="Phone" />
                    <input name="aadhar" placeholder="Aadhar" />

                    <input name="batchName" placeholder="Batch Name" />
                    <input name="fee" placeholder="Fee" />
                    <input name="timing" placeholder="Timing" />

                    <div className="form-actions">
                    <button type="submit">Add Teacher</button>
                    <button onClick={() => setShowModal(false)}>Cancel</button>
                    </div>

                </form>

                </div>
            </div>
        )}


        {/* EMPTY STATE */}
        {filteredTeachers.length === 0 && (
        <div className="empty">
            <h3>No teachers found</h3>
            <p>Try searching or add a new teacher</p>
        </div>
        )}


        <div className="stats-strip">
            <div className="stat">
                <p>Total Teachers</p>
                <h3>{teachers.length}</h3>
            </div>

            <div className="stat">
                <p>Total Revenue</p>
                <h3>₹{salary.reduce((s, t) => s + t.totalRevenue, 0)}</h3>
            </div>

            <div className="stat">
                <p>Top Performer</p>
                <h3>
                {mergedTeachers.sort((a,b)=>b.totalRevenue-a.totalRevenue)[0]?.name || "N/A"}
                </h3>
            </div>
        </div>

        {/* CARD GRID */}
        <div className="card-grid">
        {filteredTeachers.map(t => (
            <div
            className="teacher-card"
            key={t.id}
            onClick={() => setSelectedTeacher(t)}
            >

            {/* HEADER */}
            <div className="card-header">
                <div>
                <h3>{t.name}</h3>
                <span className="subject">{t.subject}</span>
                </div>

                <span className={`badge ${t.totalRevenue > 5000 ? "high" : "low"}`}>
                {t.rate}%
                </span>
            </div>

            {/* MAIN */}
            <div className="main-metric">
                ₹{t.teacherEarning.toFixed(2)}
                <small>Teacher Earning</small>
            </div>

            {/* EXTRA */}
            <div className="extra-metrics">
                <div>
                <p>Total</p>
                <strong>₹{t.totalRevenue}</strong>
                </div>

                <div>
                <p>Owner</p>
                <strong>₹{t.ownerEarning}</strong>
                </div>
            </div>

            </div>
        ))}
        </div>


        {/* DETAILS MODAL */}
        {selectedTeacher && (
        <Modal
            title={selectedTeacher.name}
            onClose={() => setSelectedTeacher(null)}
        >
            <div className="details">

            <div className="detail-row">
                <span>Subject</span>
                <strong>{selectedTeacher.subject || "N/A"}</strong>
            </div>

            <div className="detail-row">
                <span>Share</span>
                <strong>{selectedTeacher.rate}%</strong>
            </div>

            <div className="detail-row">
                <span>Join Date</span>
                <strong>{selectedTeacher.joinDate || "N/A"}</strong>
            </div>

            <div className="detail-row">
                <span>Phone</span>
                <strong>{selectedTeacher.phone || "N/A"}</strong>
            </div>

            <div className="detail-row">
                <span>Aadhar</span>
                <strong>{selectedTeacher.aadhar || "N/A"}</strong>
            </div>

            </div>
        </Modal>
        )}
    </div>
    );
}

export default Teachers;