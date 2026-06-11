import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import api from "../utils/api";
import ImageUpload from "../components/ImageUpload";
import s from "../dashboard/dashboard.module.css";
import { DraggableBox } from "../dashboard/Admin";

export default function ManageEvents() {
    const { fetchEventRegistrations, eventRegistrations, deleteEventRegistration, notify } = useApp();
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [location, setLocation] = useState("");
    const [desc, setDesc] = useState("");
    const [img, setImg] = useState("");
    const [category, setCategory] = useState("UPCOMING");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selEvent, setSelEvent] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);

    // Registration editing
    const [editingRegId, setEditingRegId] = useState(null);
    const [regForm, setRegForm] = useState({ firstName: "", lastName: "", email: "", phone: "", comments: "" });

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        try {
            const res = await api.get("/events");
            setEvents(res.data);
        } catch (e) {
            console.error("Failed to load events", e);
        }
    }

    const resetForm = () => {
        setTitle("");
        setEventDate("");
        setLocation("");
        setDesc("");
        setImg("");
        setCategory("UPCOMING");
        setEditingId(null);
    };

    const handleEdit = (ev) => {
        setEditingId(ev.id);
        setTitle(ev.title);
        setEventDate(ev.eventDate);
        setLocation(ev.location);
        setDesc(ev.description || "");
        setImg(ev.imageUrl || "");
        setCategory(ev.category || "UPCOMING");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleViewParticipants = (ev) => {
        setSelEvent(ev);
        fetchEventRegistrations(ev.id);
        setShowParticipants(true);
        setEditingRegId(null); // Reset reg editing
    };

    const handleEditReg = (reg) => {
        setEditingRegId(reg.id);
        setRegForm({
            firstName: reg.firstName,
            lastName: reg.lastName,
            email: reg.email,
            phone: reg.phone,
            comments: reg.comments || ""
        });
    };

    const handleSaveReg = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/events/registrations/${editingRegId}`, regForm);
            setEditingRegId(null);
            fetchEventRegistrations(selEvent.id);
            notify("Registration updated!", "ok");
        } catch (err) { notify("Update failed", "err"); }
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title,
                eventDate,
                location,
                description: desc,
                imageUrl: img,
                category
            };

            if (editingId) {
                await api.put(`/events/${editingId}`, payload);
            } else {
                await api.post("/events", payload);
            }

            resetForm();
            loadEvents();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id) => {
        if (!await confirm("Delete Event?", "Permanently remove this event and all its registrations?")) return;
        try {
            await api.delete(`/events/${id}`);
            loadEvents();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className={s.innerCard}>
            <h3 className={s.cardTitle}>📅 {editingId ? "Edit Event" : "Manage Campus Events"}</h3>

            <form className={s.formGrid} onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
                <div className={s.formGroup}>
                    <label className={s.label}>Event Title</label>
                    <input className={s.inp} value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className={s.formGroup}>
                    <label className={s.label}>Event Date (e.g. 16 Mar 2025)</label>
                    <input className={s.inp} value={eventDate} onChange={e => setEventDate(e.target.value)} required />
                </div>
                <div className={s.formGroup}>
                    <label className={s.label}>Location</label>
                    <input className={s.inp} value={location} onChange={e => setLocation(e.target.value)} required />
                </div>
                <div className={s.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={s.label}>Event Description</label>
                    <textarea className={s.inp} value={desc} onChange={e => setDesc(e.target.value)} required rows={4} />
                </div>
                <div className={s.formGroup}>
                    <label className={s.label}>Category</label>
                    <select className={s.inp} value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="UPCOMING">Upcoming Events & Circulars</option>
                        <option value="REUNION">Events & Reunions</option>
                        <option value="QUICK_NOTE">Quick Note (Horizontal Marquee)</option>
                    </select>
                </div>
                <div className={s.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={s.label}>Event Banner Image</label>
                    <ImageUpload label="Upload Event Banner" onImageChange={setImg} currentImage={img} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px" }}>
                    <button className={s.btnPrimary} type="submit" disabled={loading}>
                        {loading ? "Saving..." : editingId ? "Update Event" : "Add Event"}
                    </button>
                    {editingId && (
                        <button className={s.btnSecondary} type="button" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <DraggableBox className={s.tableWrap}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title & Date</th>
                            <th>Location</th>
                            <th>Category</th>
                            <th style={{ textAlign: 'right', paddingRight: '40px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(ev => (
                            <tr key={ev.id} style={editingId === ev.id ? { background: "var(--indigo-50)" } : {}}>
                                <td>
                                    {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 6 }} />}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{ev.title}</div>
                                    <div style={{ fontSize: 11, color: "var(--gray-500)" }}>{ev.eventDate}</div>
                                </td>
                                <td>{ev.location}</td>
                                <td>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        background: ev.category === "REUNION" ? "var(--amber-100)" : ev.category === "QUICK_NOTE" ? "var(--rose-100)" : "var(--indigo-100)",
                                        color: ev.category === "REUNION" ? "var(--amber-700)" : ev.category === "QUICK_NOTE" ? "var(--rose-700)" : "var(--indigo-700)"
                                    }}>
                                        {ev.category === "UPCOMING" ? "Upcoming" : ev.category === "REUNION" ? "Reunion" : "Quick Note"}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className={s.tdActions} style={{ justifyContent: 'flex-end', paddingRight: '20px' }}>
                                        <button className={`${s.btnPrimary} ${s.btnSmall}`} onClick={() => handleEdit(ev)}>Edit</button>
                                        <button className={`${s.btnSecondary} ${s.btnSmall}`} onClick={() => handleViewParticipants(ev)}>👥 Participants ({ev.registrationCount || 0})</button>
                                        <button className={`${s.btnDanger} ${s.btnSmall}`} onClick={() => handleDelete(ev.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: "center", padding: 20 }}>No events scheduled</td></tr>
                        )}
                    </tbody>
                </table>
            </DraggableBox>

            {showParticipants && selEvent && (
                <div className="modal-overlay" style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }} onClick={() => setShowParticipants(false)}>
                    <div style={{
                        background: "white", padding: "20px", borderRadius: "12px", width: "90%", maxWidth: "800px",
                        maxHeight: "80vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Participants: {selEvent.title}</h3>
                                <p style={{ margin: "5px 0 0", fontSize: "14px", color: "var(--gray-500)" }}>Verified registration details</p>
                            </div>
                            <button onClick={() => setShowParticipants(false)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
                        </div>
                        <div className={s.modalBody}>
                            {editingRegId ? (
                                <form onSubmit={handleSaveReg} className={s.formGrid} style={{ background: "var(--gray-50)", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                                    <div className={s.formGroup}>
                                        <label className={s.label}>First Name</label>
                                        <input className={s.inp} value={regForm.firstName} onChange={e => setRegForm({ ...regForm, firstName: e.target.value })} required />
                                    </div>
                                    <div className={s.formGroup}>
                                        <label className={s.label}>Last Name</label>
                                        <input className={s.inp} value={regForm.lastName} onChange={e => setRegForm({ ...regForm, lastName: e.target.value })} required />
                                    </div>
                                    <div className={s.formGroup}>
                                        <label className={s.label}>Email</label>
                                        <input className={s.inp} value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
                                    </div>
                                    <div className={s.formGroup}>
                                        <label className={s.label}>Phone</label>
                                        <input className={s.inp} value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} required />
                                    </div>
                                    <div className={s.formGroup} style={{ gridColumn: "1 / -1" }}>
                                        <label className={s.label}>Comments</label>
                                        <input className={s.inp} value={regForm.comments} onChange={e => setRegForm({ ...regForm, comments: e.target.value })} />
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button className={s.btnPrimary} type="submit">Save Changes</button>
                                        <button className={s.btnSecondary} type="button" onClick={() => setEditingRegId(null)}>Cancel</button>
                                    </div>
                                </form>
                            ) : null}

                            <DraggableBox className={s.tableWrap}>
                                <table className={s.table}>
                                    <thead>
                                        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Comments</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {eventRegistrations.map(r => (
                                            <tr key={r.id} style={editingRegId === r.id ? { background: "var(--indigo-50)" } : {}}>
                                                <td>{r.firstName} {r.lastName}</td>
                                                <td>{r.email}</td>
                                                <td>{r.phone}</td>
                                                <td><div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.comments}>{r.comments || "—"}</div></td>
                                                <td>
                                                    <div className={s.tdActions}>
                                                        <button className={`${s.btnPrimary} ${s.btnSmall}`} style={{ padding: "4px 10px" }} onClick={() => handleEditReg(r)}>Edit</button>
                                                        <button className={`${s.btnDanger} ${s.btnSmall}`} style={{ padding: "4px 10px" }} onClick={async () => { if (await confirm("Remove Registration?", "Delete this student's registration for this event?")) deleteEventRegistration(r.id); }}>Remove</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {!eventRegistrations.length && <tr><td colSpan="5" style={{ textAlign: "center", padding: 20 }}>No participants registered yet.</td></tr>}
                                    </tbody>
                                </table>
                            </DraggableBox>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
