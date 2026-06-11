import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import s from "../dashboard/Alumni.module.css";

/**
 * Shared NewPostModal: Allows alumni to create Job, Referral, Mentorship, or Webinar posts.
 */
export default function NewPostModal({ onClose, initialData = null, defaultType = "JOB", lockType = false }) {
    const { addPost, updatePost } = useApp();
    const [form, setForm] = useState(initialData || {
        postType: defaultType,
        title: "",
        description: "",
        company: "",
        location: "",
        experience: "",
        applyUrl: "",
        webinarDate: "",
        webinarLink: "",
    });

    const isCareer = form.postType === "JOB" || form.postType === "REFERRAL";
    const isService = form.postType === "MENTORSHIP" || form.postType === "WEBINAR";

    const change = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

    async function submit(e) {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) return;
        if (initialData) {
            await updatePost(initialData.id, form);
        } else {
            await addPost(form);
        }
        onClose();
    }

    const modalTitle = initialData ? "Edit Post" :
        form.postType === "JOB" ? "Post Job Opening" :
            form.postType === "REFERRAL" ? "Share Referral" :
                form.postType === "MENTORSHIP" ? "Offer Mentorship" :
                    form.postType === "WEBINAR" ? "Schedule Webinar" : "Create Story";

    return (
        <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div className={`${s.modal} ${form.postType !== "SUCCESS_STORY" ? s.modalLg : ""}`}>
                <div className={s.modalHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "28px" }}>
                            {form.postType === "JOB" ? "💼" : form.postType === "REFERRAL" ? "🤝" : form.postType === "MENTORSHIP" ? "🎓" : "🎬"}
                        </span>
                        <h2 className={s.modalTitle} style={{ margin: 0 }}>{modalTitle}</h2>
                    </div>
                    <button className={s.btnGhost} onClick={onClose} type="button" style={{ borderRadius: "50%", width: "40px", height: "40px" }}>✕</button>
                </div>

                <form onSubmit={submit} style={{ paddingTop: "24px" }}>
                    {!lockType && (
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Classification</label>
                            <select className={s.inp} value={form.postType} onChange={change("postType")}>
                                <option value="JOB">💼 Job Opening</option>
                                <option value="REFERRAL">🤝 Referral</option>
                                <option value="MENTORSHIP">🎓 Mentorship</option>
                                <option value="WEBINAR">🎬 Webinar/Event</option>
                                <option value="SUCCESS_STORY">🏆 Success Story</option>
                            </select>
                        </div>
                    )}

                    <div className={s.formSection}>
                        <div className={s.formSectionTitle}>
                            <span>📝</span> Primary Details
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>{isCareer ? "Position / Role Title *" : isService ? "Program / Topic Title *" : "Headline *"}</label>
                            <input
                                className={s.inp}
                                value={form.title}
                                onChange={change("title")}
                                placeholder={form.postType === "MENTORSHIP" ? "e.g. System Design Mentorship" : "e.g. Senior Product Manager"}
                                required
                            />
                        </div>

                        <div className={s.formGroup} style={{ marginBottom: 0 }}>
                            <label className={s.formLabel}>Description / Context *</label>
                            <textarea
                                className={s.inp}
                                value={form.description}
                                onChange={change("description")}
                                placeholder="Provide comprehensive details about this opportunity or service..."
                                rows={4}
                                required
                            />
                        </div>
                    </div>

                    {(isCareer || form.postType === "MENTORSHIP") && (
                        <div className={s.formSection}>
                            <div className={s.formSectionTitle}>
                                <span>🏢</span> Professional Context
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>
                                        {form.postType === "MENTORSHIP" ? "Domain / Focus Area" : "Company / Organization"}
                                    </label>
                                    <input
                                        className={s.inp}
                                        value={form.company}
                                        onChange={change("company")}
                                        placeholder={form.postType === "MENTORSHIP" ? "e.g. Frontend Development" : "e.g. Google / Infosys"}
                                    />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Location / Format</label>
                                    <input
                                        className={s.inp}
                                        value={form.location}
                                        onChange={change("location")}
                                        placeholder="e.g. Remote / Guwahati"
                                    />
                                </div>

                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>
                                        {form.postType === "MENTORSHIP" ? "Guidance Type" : "Experience Level"}
                                    </label>
                                    <input
                                        className={s.inp}
                                        value={form.experience}
                                        onChange={change("experience")}
                                        placeholder={form.postType === "MENTORSHIP" ? "e.g. Career / Technical" : "e.g. 2+ Yrs / Fresher"}
                                    />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>
                                        {form.postType === "MENTORSHIP" ? "Connect Link (Ops)" : "Application Link"}
                                    </label>
                                    <input
                                        className={s.inp}
                                        type="url"
                                        value={form.applyUrl}
                                        onChange={change("applyUrl")}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {form.postType === "WEBINAR" && (
                        <div className={s.formSection}>
                            <div className={s.formSectionTitle}>
                                <span>📅</span> Schedule & Access
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Date & Time</label>
                                    <input className={s.inp} type="datetime-local" value={form.webinarDate} onChange={change("webinarDate")} />
                                </div>
                                <div className={s.formGroup}>
                                    <label className={s.formLabel}>Meeting Link</label>
                                    <input className={s.inp} type="url" value={form.webinarLink} onChange={change("webinarLink")} placeholder="https://zoom.us/..." />
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "16px", marginTop: "32px", borderTop: "1px solid var(--gray-100)", paddingTop: "24px" }}>
                        <button type="button" className={`${s.btn} ${s.btnOutline} ${s.btnLg}`} style={{ flex: 1, fontWeight: 700 }} onClick={onClose}>
                            Discard
                        </button>
                        <button type="submit" className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} style={{ flex: 2, fontWeight: 800 }}>
                            {initialData ? "Save Changes" : `Publish ${form.postType.toLowerCase().replace('_', ' ')}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
