import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useApp } from "../context/AppContext";
import ImageUpload from "../components/ImageUpload";
import s from "./Alumni.module.css";

const FeedbackView = () => {
    const { currentUser, notify } = useApp();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        authorName: currentUser?.name || "",
        batchYear: `Class of ${currentUser?.batch || ""}`,
        content: "",
        avatarUrl: currentUser?.avatarUrl || ""
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    async function fetchTestimonials() {
        try {
            const res = await api.get("/testimonials");
            setTestimonials(res.data);
        } catch (err) {
            console.error("Failed to fetch testimonials", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!formData.content.trim()) return notify("Please enter your feedback.", "err");

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                userId: currentUser?.id,
                authorName: formData.authorName || currentUser?.name
            };

            if (editingId) {
                await api.put(`/testimonials/${editingId}`, payload);
                notify("Testimonial updated!", "ok");
            } else {
                await api.post("/testimonials", payload);
                notify("Thank you for your feedback!", "ok");
            }

            setFormData({ ...formData, content: "" });
            setEditingId(null);
            fetchTestimonials();
        } catch (err) {
            notify("Operation failed. Try again later.", "err");
        } finally {
            setSubmitting(false);
        }
    }

    function handleEdit(t) {
        setEditingId(t.id);
        setFormData({
            authorName: t.authorName,
            batchYear: t.batchYear,
            content: t.content,
            avatarUrl: t.avatarUrl
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleDelete = async (id) => {
        if (!await confirm("Delete Feedback?", "Remove this user feedback/testimonial permanently?")) return;
        try {
            await api.delete(`/testimonials/${id}`);
            notify("Testimonial removed.", "ok");
            fetchTestimonials();
        } catch (err) {
            notify("Failed to delete testimonial.", "err");
        }
    }

    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN";

    return (
        <div className={s.viewContainer}>
            <div className={s.profGrid} style={{ gridTemplateColumns: '1fr', gap: '24px', marginTop: '10px' }}>
                {/* ── Submission Form ── */}
                <div className={s.profileCard} style={{ maxWidth: '100%' }}>
                    <h3 className={s.modalTitle}>{editingId ? "✏️ Edit Your Story" : "✨ Share Your Story"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={s.profGrid} style={{ marginBottom: '16px' }}>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Your Name</label>
                                <input
                                    className={s.inp}
                                    value={formData.authorName}
                                    onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>Batch/Title</label>
                                <input
                                    className={s.inp}
                                    value={formData.batchYear}
                                    onChange={e => setFormData({ ...formData, batchYear: e.target.value })}
                                    placeholder="e.g. Class of 2020"
                                />
                            </div>
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Your Feedback / Testimonial</label>
                            <textarea
                                className={s.inp}
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="What would you like to share about your journey?"
                                style={{ minHeight: '120px' }}
                            />
                        </div>
                        <div className={s.formGroup}>
                            <label className={s.formLabel}>Display Picture (Optional)</label>
                            <ImageUpload
                                label="Update Display Photo"
                                onUpload={url => setFormData({ ...formData, avatarUrl: url })}
                                currentImage={formData.avatarUrl}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className={s.btnPrimary}
                                style={{ padding: '12px 24px' }}
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? "Processing..." : (editingId ? "Update Testimonial" : "Submit Testimonial")}
                            </button>
                            {editingId && (
                                <button
                                    className={s.btnOutline}
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({
                                            authorName: currentUser?.name || "",
                                            batchYear: `Class of ${currentUser?.batch || ""}`,
                                            content: "",
                                            avatarUrl: currentUser?.avatarUrl || ""
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* ── Recent Testimonials ── */}
                <div className={s.secHead} style={{ marginTop: '20px' }}>
                    <h2 className={s.secTitle}>Recent Community Voices</h2>
                </div>

                {loading ? (
                    <div className={s.empty}>Loading voices...</div>
                ) : (
                    <div className={s.alumniGrid}>
                        {testimonials.map(t => {
                            const isOwner = t.userId === currentUser?.id;
                            return (
                                <div key={t.id} className={s.postCard} style={{ position: 'relative' }}>
                                    {(isSuper || isOwner) && (
                                        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', zIndex: 5 }}>
                                            {isOwner && (
                                                <button
                                                    onClick={() => handleEdit(t)}
                                                    style={{ background: 'var(--indigo-l)', color: 'var(--indigo-d)', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteTestimonial(t.id)}
                                                style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                            >
                                                {isOwner ? "Delete" : "Remove"}
                                            </button>
                                        </div>
                                    )}
                                    <div className={s.profileTop} style={{ border: 'none', padding: 0, marginBottom: '12px' }}>
                                        {t.avatarUrl ? (
                                            <img src={t.avatarUrl} alt={t.authorName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--indigo-l)', color: 'var(--indigo-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {t.authorName?.charAt(0)}
                                            </div>
                                        )}
                                        <div style={{ marginLeft: '12px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '14px' }}>{t.authorName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{t.batchYear}</div>
                                        </div>
                                    </div>
                                    <p className={s.postDesc} style={{ fontStyle: 'italic' }}>"{t.content}"</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {testimonials.length === 0 && !loading && (
                    <div className={s.empty}>Be the first to share your story!</div>
                )}
            </div>
        </div>
    );
};

export default FeedbackView;
