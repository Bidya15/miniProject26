import { useState } from "react";
import { useApp } from "../context/AppContext";
import d from "./dashboard.module.css";

export default function EmailCampaign() {
    const { notify, api } = useApp();
    const [form, setForm] = useState({
        subject: "",
        message: "",
        department: ""
    });
    const [sending, setSending] = useState(false);

    const departments = ["CSE", "IT", "ECE", "EEE", "Mechanical", "Civil", "Accounts", "Administration"];

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.subject || !form.message) return notify("Please fill all required fields.", "err");

        setSending(true);
        try {
            const res = await api.post("/admin/email/campaign", form);
            notify(res.data, "ok");
            setForm({ subject: "", message: "", department: "" });
        } catch (err) {
            notify(err.response?.data || "Failed to send campaign", "err");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className={d.innerCard}>
            <div className={d.contentBox}>
                <div className={d.contentBoxTitle}>📧 Create Email Campaign</div>
                <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '20px' }}>
                    Send a bulk email to all approved alumni. You can optionally filter by department.
                </p>

                <form onSubmit={handleSubmit} className="flex-col gap-20">
                    <div className={d.formGrid}>
                        <div className={d.formGroup + " " + d.fullSpan}>
                            <label className={d.label}>Campaign Subject</label>
                            <input
                                className={d.inp}
                                value={form.subject}
                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                placeholder="e.g. Annual Alumni Meet 2026"
                                required
                            />
                        </div>

                        <div className={d.formGroup}>
                            <label className={d.label}>Target Department (Optional)</label>
                            <select
                                className={d.inp}
                                value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                            </select>
                        </div>

                        <div className={d.formGroup + " " + d.fullSpan}>
                            <label className={d.label}>Email Content</label>
                            <textarea
                                className={d.inp}
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                rows={10}
                                placeholder="Write your message here..."
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-10">
                        <button type="submit" className="btn btn-primary" disabled={sending}>
                            {sending ? "🚀 Sending..." : "✉️ Send Campaign"}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setForm({ subject: "", message: "", department: "" })}>
                            Clear Draft
                        </button>
                    </div>
                </form>
            </div>

            <div className={d.contentBox} style={{ marginTop: '24px', background: 'var(--blue-50)', borderColor: 'var(--blue-200)' }}>
                <div className={d.contentBoxTitle} style={{ color: 'var(--blue-700)' }}>💡 Best Practices</div>
                <ul style={{ fontSize: '13px', color: 'var(--blue-800)', paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Ensure your subject line is concise and relevant.</li>
                    <li>Avoid "spammy" language to improve delivery rates.</li>
                    <li>Use the department filter for more targeted communication.</li>
                    <li>The email will be sent as a BCC to all selected alumni for privacy.</li>
                </ul>
            </div>
        </div>
    );
}
