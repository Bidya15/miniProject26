import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import styles from "./NetworkingHub.module.css";
import { useState, useEffect, useRef } from "react";
import { AlumniCard } from "./Alumni";

/**
 * NetworkingHub: Facilitates professional connections and mentorship.
 * Uses a clean, multi-section layout with real-time data from the backend.
 */

export default function NetworkingHub() {
    const { notify, users, posts, sendConnectionRequest, currentUser, connections = [], sentConnections = [], sendMentorshipRequest, mentorshipRequests = [] } = useApp();

    const [reqModal, setReqModal] = useState(null); // { mentorId, postId, title }
    const [reqNote, setReqNote] = useState("");

    // Search & Filter State
    const [q, setQ] = useState("");
    const [batch, setBatch] = useState("");
    const [city, setCity] = useState("");
    const [company, setComp] = useState("");
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 9;

    // Data Filtering: Separating concerns for clarity (excluding own profile/posts)
    const approvedAlumni = users.filter(user =>
        user.role === "ROLE_ALUMNI" &&
        user.status === "APPROVED" &&
        user.id !== currentUser?.id
    );

    const filteredAlumni = approvedAlumni.filter(u => {
        // Exclude already connected alumni
        const isConnected = 
            connections.some(c => c.status === "ACCEPTED" && c.sender?.id === u.id) ||
            sentConnections.some(c => c.status === "ACCEPTED" && c.receiver?.id === u.id);
        
        if (isConnected) return false;

        if (q && !u.name.toLowerCase().includes(q.toLowerCase()) && !u.techStack?.toLowerCase().includes(q.toLowerCase())) return false;
        if (batch && String(u.batch) !== batch) return false;
        if (city && u.location && !u.location.toLowerCase().includes(city.toLowerCase())) return false;
        if (company && u.company && !u.company.toLowerCase().includes(company.toLowerCase())) return false;
        return true;
    });

    const total = Math.max(1, Math.ceil(filteredAlumni.length / PAGE_SIZE));
    const pg = Math.min(page, total);
    const slice = filteredAlumni.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE);
    const batches = [...new Set(approvedAlumni.map(u => u.batch))].sort();

    const mentorshipPosts = posts.filter(post =>
        post.postType === "MENTORSHIP" &&
        post.user?.id !== currentUser?.id
    );
    const trendingWebinars = posts.filter(post =>
        post.postType === "WEBINAR" &&
        post.user?.id !== currentUser?.id
    );

    return (
        <div className={styles.hubContainer}>
            {/* Page Header */}
            <header className={styles.hubHeader}>
                <div className={styles.headerContext}>
                    <h1 className={styles.hubTitle}>Networking & Mentorship</h1>
                    <p className={styles.hubSubtitle}>
                        Expand your professional reach by connecting with verified Aecians across the globe.
                    </p>
                </div>
            </header>


            {reqModal && (
                <div className="overlay" onClick={e => e.target === e.currentTarget && setReqModal(null)}>
                    <div className="modal" style={{ maxWidth: "420px" }}>
                        <div className="modal-title">Request Mentorship</div>
                        <p style={{ fontSize: "14px", color: "var(--gray-500)", marginBottom: "16px" }}>
                            Requesting: <strong>{reqModal.title}</strong>
                        </p>
                        <div className="form-group">
                            <label>Add a note (optional)</label>
                            <textarea
                                className="inp"
                                placeholder="Tell the mentor what you'd like to discuss..."
                                value={reqNote}
                                onChange={e => setReqNote(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReqModal(null)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2 }}
                                onClick={async () => {
                                    await sendMentorshipRequest(reqModal.mentorId, reqModal.postId, reqNote);
                                    setReqModal(null);
                                    setReqNote("");
                                }}
                            >
                                Send Request 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. Global Alumni Network Section */}
            <section className={styles.hubSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Global Alumni Network</h2>
                    <p className={styles.sectionDesc}>Search and connect with industry professionals for peer-to-peer networking.</p>
                </div>

                {/* Search Filters */}
                <div className="directory-container" style={{ marginBottom: '24px' }}>
                    <div className="filter-row">
                        <input className="inp" placeholder="🔍 Search name or skills…" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
                        <input className="inp" placeholder="📍 City" value={city} onChange={e => { setCity(e.target.value); setPage(1) }} />
                        <input className="inp" placeholder="🏢 Company" value={company} onChange={e => { setComp(e.target.value); setPage(1) }} />
                        <select className="inp" value={batch} onChange={e => { setBatch(e.target.value); setPage(1) }}>
                            <option value="">All Batches</option>
                            {batches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <button className="btn btn-outline" onClick={() => { setQ(""); setBatch(""); setCity(""); setComp(""); setPage(1); }}>Reset</button>
                    </div>
                    <div className={styles.resultCount}>
                        {filteredAlumni.length} alumni found
                    </div>
                </div>

                <div className={styles.carouselWrapper}>
                    {total > 1 && (
                        <button 
                            className={`${styles.scrollBtn} ${styles.scrollBtnLeft}`}
                            style={{ visibility: pg === 1 ? 'hidden' : 'visible' }}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            title="Previous Page"
                        >
                            ◀
                        </button>
                    )}

                    <div className={styles.alumniGrid}>
                        {slice.length > 0 ? slice.map((alumni) => (
                            <AlumniCard key={alumni.id} user={alumni} />
                        )) : (
                            <div className={styles.emptyState}>No alumni match your search criteria.</div>
                        )}
                    </div>

                    {total > 1 && (
                        <button 
                            className={`${styles.scrollBtn} ${styles.scrollBtnRight}`}
                            style={{ visibility: pg === total ? 'hidden' : 'visible' }}
                            onClick={() => setPage(p => Math.min(total, p + 1))}
                            title="Next Page"
                        >
                            ▶
                        </button>
                    )}
                </div>

                <div className="pager" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                    {Array.from({ length: total }, (_, i) => i + 1).map(n => (
                        <div 
                            key={n} 
                            onClick={() => setPage(n)}
                            style={{ 
                                width: '8px', height: '8px', borderRadius: '50%', 
                                background: n === pg ? 'var(--indigo)' : 'var(--gray-300)',
                                cursor: 'pointer'
                            }} 
                        />
                    ))}
                </div>
            </section>

            {/* 2. Structured Mentorship Section */}
            <section className={styles.hubSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Professional Mentorship</h2>
                    <p className={styles.sectionDesc}>Request one-on-one guidance from seniors verified in their respective domains.</p>
                </div>

                <div className={styles.unifiedGrid}>
                    {mentorshipPosts.length > 0 ? mentorshipPosts.map((mentor, index) => (
                        <motion.div
                            key={mentor.id}
                            className={styles.programCard}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <div className={styles.cardInfo}>
                                <h3 className={styles.programTitle}>{mentor.title}</h3>
                                <p className={styles.mentorName}>Mentor: {mentor.user?.name || "AEC Alumni"}</p>
                                <p className={styles.mentorExpertise}>Focus: {mentor.company || "General Professional Services"}</p>
                            </div>
                            <button
                                className={styles.mentorshipBtn}
                                onClick={() => {
                                    const existing = mentorshipRequests.find(r =>
                                        (r.post?.id === mentor.id || r.post_id === mentor.id) &&
                                        (r.mentee?.id === currentUser?.id || r.mentee_id === currentUser?.id)
                                    );
                                    if (existing) {
                                        notify("You have already requested this session.", "info");
                                    } else {
                                        setReqModal({ mentorId: mentor.user.id, postId: mentor.id, title: mentor.title });
                                    }
                                }}
                            >
                                {mentorshipRequests.some(r =>
                                    (r.post?.id === mentor.id || r.post_id === mentor.id) &&
                                    (r.mentee?.id === currentUser?.id || r.mentee_id === currentUser?.id)
                                ) ? "✓ Requested" : "Request Session"}
                            </button>
                        </motion.div>
                    )) : (
                        <div className={styles.emptyState}>No active mentorship programs currently listed.</div>
                    )}
                </div>
            </section>

            {/* 3. Knowledge Exchange (Webinars) Section */}
            <section className={styles.hubSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Digital Summits & Webinars</h2>
                    <p className={styles.sectionDesc}>Join live sessions hosted by alumni experts to stay ahead in your career.</p>
                </div>

                <div className={styles.unifiedGrid}>
                    {trendingWebinars.length > 0 ? trendingWebinars.map((webinar, index) => (
                        <motion.div
                            key={webinar.id}
                            className={styles.webinarCard}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <div className={styles.cardInfo}>
                                <h3 className={styles.webinarTitle}>{webinar.title}</h3>
                                <p className={styles.webinarMeta}>
                                    📅 {new Date(webinar.webinarDate).toLocaleDateString()} | 🕒 {webinar.location || "Online"}
                                </p>
                            </div>
                            <button
                                className={styles.webinarBtn}
                                onClick={() => window.open(webinar.webinarLink, "_blank")}
                            >
                                Secure a Seat
                            </button>
                        </motion.div>
                    )) : (
                        <div className={styles.emptyState}>No upcoming webinars scheduled for this month.</div>
                    )}
                </div>
            </section>
        </div>
    );
}
