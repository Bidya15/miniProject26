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
            await api.post("/testimonials", {
                authorName,
                batchYear,
                content,
                avatarUrl: img
            });
            setAuthorName("");
            setBatchYear("");
            setContent("");
            setImg("");
            loadData();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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
            <h3 className={s.cardTitle}>💬 Manage Testimonials</h3>

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
                <div style={{ gridColumn: "1 / -1" }}>
                    <button className={s.btnPrimary} type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add Testimonial"}
                    </button>
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
                                    {m.avatarUrl && <img src={m.avatarUrl} alt={m.authorName} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "50%" }} />}
                                </td>
                                <td>
                                    <div style={{ fontSize: 12, fontStyle: "italic", color: "var(--gray-600)" }}>"{m.content}"</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{m.authorName}</div>
                                    <div style={{ fontSize: 11, color: "var(--gray-500)" }}>{m.batchYear}</div>
                                </td>
                                <td>
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
