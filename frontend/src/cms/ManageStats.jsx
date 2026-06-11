import { useState, useEffect } from "react";
import api from "../utils/api";
import s from "../dashboard/dashboard.module.css";

export default function ManageStats() {
    const [stats, setStats] = useState([]);
    const [label, setLabel] = useState("");
    const [value, setValue] = useState("");
    const [sortOrder, setSortOrder] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        try {
            const res = await api.get("/cms/stats");
            setStats(res.data);
        } catch (e) {
            console.error("Failed to load stats", e);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { label, value, sortOrder };
            if (editingId) {
                await api.put(`/cms/stats/${editingId}`, payload);
            } else {
                await api.post("/cms/stats", payload);
            }
            resetForm();
            loadStats();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function startEdit(item) {
        setEditingId(item.id);
        setLabel(item.label);
        setValue(item.value);
        setSortOrder(item.sortOrder || 0);
    }

    function resetForm() {
        setEditingId(null);
        setLabel("");
        setValue("");
        setSortOrder(0);
    }

    const handleDelete = async (id) => {
        if (!await confirm("Delete Stat?", "Remove this counter from the homepage?")) return;
        setStats(prev => prev.filter(s => s.id !== id));
        try {
            await api.delete(`/cms/stats/${id}`);
            loadStats();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className={s.innerCard}>
            <h3 className={s.cardTitle}>📊 Manage Site Statistics</h3>

            <form className={s.formGrid} onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
                <div className={s.formGroup}>
                    <label className={s.label}>Stat Label (e.g. Alumni Network)</label>
                    <input
                        className={s.inp}
                        value={label}
                        onChange={e => setLabel(e.target.value)}
                        placeholder="Alumni Network"
                        required
                    />
                </div>
                <div className={s.formGroup}>
                    <label className={s.label}>Stat Value (e.g. 5,000+)</label>
                    <input
                        className={s.inp}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder="5,000+"
                        required
                    />
                </div>
                <div className={s.formGroup}>
                    <label className={s.label}>Sort Order</label>
                    <input
                        type="number"
                        className={s.inp}
                        value={sortOrder}
                        onChange={e => setSortOrder(parseInt(e.target.value))}
                    />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px" }}>
                    <button className={s.btnPrimary} type="submit" disabled={loading}>
                        {loading ? "Saving..." : editingId ? "Update Stat" : "Add Stat"}
                    </button>
                    {editingId && (
                        <button className={s.btnSecondary} type="button" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className={s.tableWrap}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>Label</th>
                            <th>Value</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map(st => (
                            <tr key={st.id}>
                                <td style={{ fontWeight: 600 }}>{st.label}</td>
                                <td>{st.value}</td>
                                <td>{st.sortOrder}</td>
                                <td>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button className={s.btnSecondary} onClick={() => startEdit(st)}>Edit</button>
                                        <button className={s.btnDanger} onClick={() => deleteStat(st.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {stats.length === 0 && (
                            <tr><td colSpan="4" style={{ textAlign: "center", padding: 20 }}>No statistics added yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
