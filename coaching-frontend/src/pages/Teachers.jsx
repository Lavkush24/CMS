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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [batches, setBatches] = useState([]);
  const [mode, setMode] = useState("none"); // none | existing | new

  const { showToast } = useToast();

  //  LOAD DATA
  async function loadData() {
    try {
        setLoading(true);

        const [t, s, b] = await Promise.all([
            apiRequest("/teacher/list"),
            apiRequest("/teacher/salary"),
            apiRequest("/batch/list")
        ]);

        //  normalize teachers
        const normalizedTeachers = t.map(t => ({
            id: t._id,
            name: t.name,
            subject: t.subject,
            sharePercent: t.sharePercent,
            joinDate: t.joinDate,
            phone: t.phone,
            aadhar: t.aadharNumber
        }));

        setTeachers(normalizedTeachers);
        setSalary(s);
        setBatches(
            b.map(batch => ({
                id: batch._id,
                name: batch.name
            }))
        );

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

    const payload = {
        name: form.name.value.trim(),
        subject: form.subject.value.trim(),
        sharePercent: Number(form.sharePercent.value) || 0,
        joinDate: form.joinDate.value,
        phone: form.phone.value.trim(),
        aadhar: form.aadhar.value.trim(),
        mode
    };

    //  attach batch data based on mode
    if (mode === "existing") {
        payload.batchId = form.batchId.value;
    }

    if (mode === "new") {
        payload.batchName = form.batchName.value.trim();
        payload.fees = Number(form.fees.value) || 0;
        payload.startDate = form.startDate.value;
        payload.timing = form.timing.value.trim();
    }

    try {
        await apiRequest("/teacher/add", "POST", payload);

        setShowModal(false);
        setMode("none"); // reset

        loadData();
        showToast("Teacher added successfully");

    } catch (err) {
        showToast(err.message || "Failed to add teacher", "error");
    }
  }

  async function assignTeacher(e) {
    e.preventDefault();

    const form = e.target;

    const payload = {
        batchId: form.batchId.value,
        teacherId: form.teacherId.value
    };

    try {
        await apiRequest("/batch/assign-teacher", "POST", payload);

        setShowAssignModal(false);
        showToast("Teacher assigned successfully");

    } catch (err) {
        showToast(err.message || "Assignment failed", "error");
    }
  }


  async function updateTeacher(e) {
    e.preventDefault();

    const form = e.target;

    const payload = {
        name: form.name.value.trim(),
        subject: form.subject.value.trim(),
        sharePercent: Number(form.sharePercent.value) || 0,
        phone: form.phone.value.trim(),
        aadhar: form.aadhar.value.trim()
    };

    try {
        await apiRequest(`/teacher/update/${selectedTeacher.id}`, "PUT", payload);

        setSelectedTeacher(null);
        loadData();

        showToast("Teacher updated");

    } catch (err) {
        showToast("Update failed", "error");
    }
  }


  async function deleteTeacher(id) {
    if (!window.confirm("Delete this teacher?")) return;

    try {
        await apiRequest(`/teacher/delete/${id}`, "DELETE");

        loadData();
        showToast("Teacher deleted");

    } catch {
        showToast("Delete failed", "error");
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

            <button onClick={() => setShowAssignModal(true)}>
                Assign Teacher
            </button>

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
                    <input name="subject" placeholder="Subject" required />
                    <input name="sharePercent" placeholder="Share %" required />

                    <input type="date" name="joinDate" required />
                    <input name="phone" placeholder="Phone" required />
                    <input name="aadhar" placeholder="Aadhar" required />


                    <div className="form-group">
                        <label>Batch Option</label>

                        <select value={mode} onChange={(e) => setMode(e.target.value)}>
                            <option value="none">No Batch</option>
                            <option value="existing">Assign Existing Batch</option>
                            <option value="new">Create New Batch</option>
                        </select>
                    </div>

                    {mode === "existing" && (
                        <select name="batchId" required>
                            <option value="">Select Batch</option>
                            {batches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    )}

                    {mode === "new" && (
                        <>
                            <input name="batchName" placeholder="Batch Name" required />
                            <input name="fees" placeholder="Fees" required />
                            <input type="date" name="startDate" required />
                            <input name="timing" placeholder="Timing" required />
                        </>
                    )}

                    <div className="form-actions">
                        <button type="submit">Add Teacher</button>
                        <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                    </div>



                </form>

                </div>
            </div>
        )}

        {showAssignModal && (
            <div className="full-modal">
                <div className="modal-content">

                <h2>Assign Teacher to Batch</h2>

                <form onSubmit={assignTeacher} className="grid-form">

                    <select name="teacherId" required>
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                        {t.name}
                        </option>
                    ))}
                    </select>

                    <select name="batchId" required>
                    <option value="">Select Batch</option>
                    {batches.map(b => (
                        <option key={b.id} value={b.id}>
                        {b.name}
                        </option>
                    ))}
                    </select>

                    <div className="form-actions">
                    <button type="submit">Assign</button>
                    <button type="button" onClick={() => setShowAssignModal(false)}>
                        Cancel
                    </button>
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
                {t.sharePercent}%
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
            title="Edit Teacher"
            onClose={() => setSelectedTeacher(null)}
            >
            <form onSubmit={updateTeacher} className="grid-form">

                <input name="name" defaultValue={selectedTeacher.name} />
                <input name="subject" defaultValue={selectedTeacher.subject} />
                <input name="sharePercent" defaultValue={selectedTeacher.sharePercent} />
                <input name="phone" defaultValue={selectedTeacher.phone} />
                <input name="aadhar" defaultValue={selectedTeacher.aadhar} />

                <div className="form-actions">
                <button type="submit">Update</button>
                <div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteTeacher(selectedTeacher.id);
                    }}
                    >
                    Delete
                </button>
            </div>
                </div>

            </form>
        </Modal>
        )}
    </div>
    );
}

export default Teachers;