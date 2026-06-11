import { useState, useEffect } from "react";
import api from "../utils/api";
import s from "../dashboard/dashboard.module.css";
import { fmtDate, POST_TYPE_META } from "../utils/helpers";

export default function ManageJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const res = await api.get("/posts");
            // Filter only jobs and referrals
            const careerPosts = res.data.filter(p => p.postType === "JOB" || p.postType === "REFERRAL");
            setJobs(careerPosts);
        } catch (e) {
            console.error("Failed to load jobs", e);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id) => {
        if (!await confirm("Delete Career?", "Are you sure you want to remove this job/career listing?")) return;
        try {
            setJobs(prev => prev.filter(j => j.id !== id));
            await api.delete(`/posts/${id}`);
            loadData();
        } catch (err) {
            console.error(err);
        }
    }

    const filtered = jobs.filter(j =>
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.alumniName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={s.innerCard}>
            <div className={s.cmHeader} style={{ padding: 0, marginBottom: "20px" }}>
                <div>
                    <h3 className={s.cardTitle}>💼 Career Listings & Referrals</h3>
                    <p className={s.cmSub}>Moderate job opportunities and alumni referrals shared on the portal</p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                    <input
                        className={s.inp}
                        style={{ width: "250px" }}
                        placeholder="🔍 Search jobs, companies..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading career data...</div>
            ) : (
                <div className={s.tableWrap}>
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th>Listing / Company</th>
                                <th>Type</th>
                                <th>Posted By</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(j => (
                                <tr key={j.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{j.title}</div>
                                        <div style={{ fontSize: 11, color: "var(--gray-500)" }}>
                                            🏢 {j.company || "Direct Listing"} • 📍 {j.location || "Remote"}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            background: j.postType === "REFERRAL" ? "var(--indigo-100)" : "var(--emerald-100)",
                                            color: j.postType === "REFERRAL" ? "var(--indigo-700)" : "var(--emerald-700)"
                                        }}>
                                            {j.postType === "REFERRAL" ? "🤝 Referral" : "💼 Job"}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: "13px" }}>{j.alumniName}</div>
                                        <div style={{ fontSize: "11px", color: "var(--gray-400)" }}>{fmtDate(j.createdAt)}</div>
                                    </td>
                                    <td>
                                        <button className={s.btnDanger} style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => deleteJob(j.id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan="4" style={{ textAlign: "center", padding: 20 }}>No career listings found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
