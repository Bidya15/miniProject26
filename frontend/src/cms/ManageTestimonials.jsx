import { useState, useEffect } from "react";
import api from "../utils/api";
import ImageUpload from "../components/ImageUpload";
import s from "../dashboard/dashboard.module.css";

export default function ManageTestimonials() {
    const [items, setItems] = useState([]);
    const [authorName, setAuthorName] = useState("");
    const [batchYear, setBatchYear] = useState("");
    const [content, setContent] = useState("");
    const [img, setImg] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const res = await api.get("/testimonials");
            setItems(res.data);
        } catch (e) {
            console.error("Failed to load testimonials", e);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                authorName,
                batchYear,
                content,
                avatarUrl: img
            };
            if (editingId) {
                await api.put(`/testimonials/${editingId}`, payload);
            } else {
                await api.post("/testimonials", payload);
            }
            setAuthorName("");
            setBatchYear("");
            setContent("");
            setImg("");
            setEditingId(null);
            loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function handleEdit(t) {
        setEditingId(t.id);
        setAuthorName(t.authorName || "");
        setBatchYear(t.batchYear || "");
        setContent(t.content || "");
        setImg(t.avatarUrl || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        setEditingId(null);
        setAuthorName("");
        setBatchYear("");
        setContent("");
        setImg("");
    }

    async function deleteItem(id) {
        if (!await confirm("Delete Testimonial?", "Remove this testimonial from the public site?")) return;
        try {
            await api.delete(`/testimonials/${id}`);
            loadData();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className={s.innerCard}>
            <h3 className={s.cardTitle}>{editingId ? "✏️ Edit Testimonial" : "💬 Manage Testimonials"}</h3>

            <form className={s.formGrid} onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
                <div className={s.formGroup}>
                    <label className={s.label}>Author Name</label>
                    <input className={s.inp} value={authorName} onChange={e => setAuthorName(e.target.value)} required />
                </div>
                <div className={s.formGroup}>
                    <label className={s.label}>Batch Details (e.g. Class of 2020)</label>
                    <input className={s.inp} value={batchYear} onChange={e => setBatchYear(e.target.value)} />
                </div>
                <div className={s.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={s.label}>Quote/Testimonial Content</label>
                    <textarea className={s.inp} value={content} onChange={e => setContent(e.target.value)} required rows={4} />
                </div>
                <div className={s.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={s.label}>Author Avatar</label>
                    <ImageUpload label="Upload Avatar" onImageChange={setImg} currentImage={img} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px" }}>
                    <button className={s.btnPrimary} type="submit" disabled={loading}>
                        {loading ? "Processing..." : (editingId ? "Update Testimonial" : "Add Testimonial")}
                    </button>
                    {editingId && (
                        <button className={s.btnOutline} type="button" onClick={cancelEdit}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className={s.tableWrap}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Quote/Content</th>
                            <th>Author</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(m => (
                            <tr key={m.id}>
                                <td>
                                    {m.avatarUrl && m.avatarUrl !== "/aec_logo_v1.png" && <img src={m.avatarUrl} alt={m.authorName} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "50%" }} />}
                                </td>
                                <td>
                                    <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--gray-600)" }}>"{m.content}"</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{m.authorName}</div>
                                    <div style={{ fontSize: 11, color: "var(--gray-500)" }}>{m.batchYear}</div>
                                </td>
                                <td style={{ display: "flex", gap: "10px" }}>
                                    <button className={s.btnPrimary} style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(m)}>Edit</button>
                                    <button className={s.btnDanger} onClick={() => deleteItem(m.id)}>Remove</button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan="4" style={{ textAlign: "center", padding: 20 }}>No testimonials found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
