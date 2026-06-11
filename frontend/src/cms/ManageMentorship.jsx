import { useState, useEffect } from "react";
import api from "../utils/api";
import s from "../dashboard/dashboard.module.css";
import { fmtDate } from "../utils/helpers";

export default function ManageMentorship() {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const res = await api.get("/posts");
            // Filter only mentorship posts
            const mentorshipPosts = res.data.filter(p => p.postType === "MENTORSHIP" || p.postType === "WEBINAR");
            setMentors(mentorshipPosts);
        } catch (e) {
            console.error("Failed to load mentorship posts", e);
        } finally {
            setLoading(false);
        }
    }

    async function deletePost(id) {
        if (!await confirm("Remove Listing?", "Permanently delete this mentorship opportunity?")) return;
        try {
            await api.delete(`/posts/${id}`);
            loadData();
        } catch (err) {
            console.error(err);
        }
    }

    const filtered = mentors.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.alumniName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.company && m.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className={s.innerCard}>
            <div className={s.cmHeader} style={{ padding: 0, marginBottom: "20px" }}>
                <div>
                    <h3 className={s.cardTitle}>🤝 Mentorship & Webinars</h3>
                    <p className={s.cmSub}>Manage professional guidance programs and digital summits</p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                    <input
                        className={s.inp}
                        style={{ width: "250px" }}
                        placeholder="🔍 Search mentors, topics..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading mentorship data...</div>
            ) : (
                <div className={s.tableWrap}>
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th>Program / Topic</th>
                                <th>Type</th>
                                <th>Mentor / Host</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{m.title}</div>
                                        <div style={{ fontSize: 11, color: "var(--gray-500)" }}>
                                            {m.company || "General Professional Services"}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            background: m.postType === "MENTORSHIP" ? "var(--indigo-100)" : "var(--amber-100)",
                                            color: m.postType === "MENTORSHIP" ? "var(--indigo-700)" : "var(--amber-700)"
                                        }}>
                                            {m.postType === "MENTORSHIP" ? "👨‍🏫 Mentorship" : "📹 Webinar"}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "13px" }}>{m.alumniName}</div>
                                        <div style={{ fontSize: "11px", color: "var(--gray-400)" }}>{fmtDate(m.createdAt)}</div>
                                    </td>
                                    <td>
                                        <button className={s.btnDanger} style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => deletePost(m.id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan="4" style={{ textAlign: "center", padding: 20 }}>No listings found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
