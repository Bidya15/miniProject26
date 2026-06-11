import { useState, useEffect } from "react";
import api from "../utils/api";
import styles from "../dashboard/dashboard.module.css";
import { useApp } from "../context/AppContext";
import ImageUpload from "../components/ImageUpload";

export default function ManageCoordinators() {
    const { notify } = useApp();
    const [coordinators, setCoordinators] = useState([]);
    const [form, setForm] = useState({ id: null, name: "", role: "", department: "", imageUrl: "", linkedInUrl: "" });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { fetchCoordinators(); }, []);

    const fetchCoordinators = async () => {
        try {
            const res = await api.get("/coordinators");
            setCoordinators(res.data);
        } catch (err) {
            console.error(err);
            notify("Failed to load coordinators", "err");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/coordinators/${form.id}`, form);
                notify("Coordinator updated!");
            } else {
                await api.post("/coordinators", form);
                notify("Coordinator added!");
            }
            fetchCoordinators();
            setForm({ id: null, name: "", role: "", department: "", imageUrl: "", linkedInUrl: "" });
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            notify("Error saving coordinator", "err");
        }
    };

    const handleEdit = (c) => {
        setForm(c);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!await confirm("Remove Coordinator?", "Delete this coordinator from the department board?")) return;
        try {
            await api.delete(`/coordinators/${id}`);
            notify("Coordinator removed");
            fetchCoordinators();
        } catch (err) {
            console.error(err);
            notify("Error deleting coordinator", "err");
        }
    };

    return (
        <div className={styles.manageSection}>
            <div className={styles.sectionHeaderWrap}>
                <h3>👔 Manage Coordinators</h3>
                <p>Add or update the coordinators guiding the alumni network.</p>
            </div>

            <div className={styles.mcCard}>
                <h4>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                    {isEditing ? "Update Coordinator" : "Add New Coordinator"}
                </h4>
                <form onSubmit={handleSave} className={styles.mcForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.fGroup}>
                            <label>Name</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. John Doe" />
                        </div>
                        <div className={styles.fGroup}>
                            <label>Role</label>
                            <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required placeholder="e.g. Coordinator, Head" />
                        </div>
                        <div className={styles.fGroup}>
                            <label>Department / Batch</label>
                            <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required placeholder="e.g. Computer Science, 2024" />
                        </div>
                        <div className={styles.fGroup}>
                            <ImageUpload
                                label="Upload Image or Provide URL"
                                onUpload={(url) => setForm({ ...form, imageUrl: url })}
                                currentImage={form.imageUrl}
                            />
                        </div>
                        <div className={`${styles.fGroup} ${styles.fullSpan}`}>
                            <label>LinkedIn URL</label>
                            <input value={form.linkedInUrl} onChange={e => setForm({ ...form, linkedInUrl: e.target.value })} placeholder="https://linkedin.com/in/..." />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className={styles.saveBtn} style={{ flex: 1 }}>
                            {isEditing ? "Update Coordinator" : "Add Coordinator"}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                className={styles.btnDanger}
                                style={{ padding: '1rem', borderRadius: '12px' }}
                                onClick={() => { setIsEditing(false); setForm({ id: null, name: "", role: "", department: "", imageUrl: "", linkedInUrl: "" }) }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className={styles.listGrid} style={{ marginTop: 30 }}>
                {coordinators.map(c => (
                    <div key={c.id} className={styles.listItemCard}>
                        {c.imageUrl ? (
                            c.imageUrl.startsWith("data:application/pdf") || c.imageUrl.includes(".pdf") ? (
                                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📄</div>
                            ) : (
                                <img src={c.imageUrl} alt={c.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
                            )
                        ) : (
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>👤</div>
                        )}
                        <div className={styles.listItemContent}>
                            <h4>{c.name}</h4>
                            <div className={styles.listMeta}>{c.role} • {c.department}</div>
                        </div>
                        <div className={styles.listActions} style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEdit(c)} className={styles.btnPrimary} style={{ padding: '6px 12px', fontSize: '12px' }}>✎ Edit</button>
                            <button onClick={() => handleDelete(c.id)} className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '12px' }}>✕ Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
