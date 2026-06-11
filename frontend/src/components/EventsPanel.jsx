import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import { useApp } from "../context/AppContext";
import styles from "./EventsPanel.module.css";
import newBurst from "../assets/new_burst_proper.png";

/* ── Animated Modal Wrapper (Internal to component) ── */
function AnimatedModal({ onClose, children }) {
    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, y: 32, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 32, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

function EventsPanel({
    limit,
    isDashboard = false,
    hideTitle = false,
    category = "",
    title = "",
    isCompact = false,
    isMarquee = false
}) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [regLoading, setRegLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const { currentUser, notify } = useApp();

    const [regForm, setRegForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        comments: ""
    });

    useEffect(() => {
        if (currentUser) {
            const names = currentUser.name ? currentUser.name.split(" ") : ["", ""];
            setRegForm({
                firstName: names[0] || "",
                lastName: names.slice(1).join(" ") || "",
                email: currentUser.email || "",
                phone: currentUser.phone || "",
                comments: ""
            });
        }
    }, [currentUser]);

    const fetchEvents = (isSilent = false) => {
        if (!isSilent) setLoading(true);
        return api.get("/events", { params: { category: category || undefined } })
            .then(res => {
                let data = res.data;
                if (limit && !isMarquee) data = data.slice(0, limit);
                setEvents(data);
            })
            .catch(err => console.error("Events fetch error:", err))
            .finally(() => {
                if (!isSilent) setLoading(false);
            });
    };

    useEffect(() => {
        fetchEvents();
        const intervalId = setInterval(() => fetchEvents(true), 60000);
        return () => clearInterval(intervalId);
    }, [limit, category, isMarquee]);

    useEffect(() => {
        if (selectedEvent && currentUser) {
            // Reset status while fetching to avoid showing old data
            setIsRegistered(false);
            api.get(`/events/${selectedEvent.id}/is-registered`, { params: { userId: currentUser.id } })
                .then(res => setIsRegistered(res.data.registered))
                .catch(err => {
                    console.error("Reg check error:", err);
                    setIsRegistered(false);
                });
        } else {
            setIsRegistered(false);
        }
    }, [selectedEvent, currentUser]);

    const handleRegister = async () => {
        if (!currentUser) {
            notify("Please login to register", "err");
            return;
        }

        if (isRegistered) {
            setRegLoading(true);
            try {
                await api.delete(`/events/${selectedEvent.id}/register`, { params: { userId: currentUser.id } });
                setIsRegistered(false);
                notify("Registration cancelled", "ok");
            } catch (err) {
                console.error("Unreg error:", err);
                notify("Action failed", "err");
            } finally {
                setRegLoading(true);
                setRegLoading(false);
            }
        } else {
            setIsRegistering(true);
        }
    };

    const submitRegistration = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            const payload = {
                ...regForm,
                userId: currentUser.id
            };
            await api.post(`/events/${selectedEvent.id}/register`, payload);
            setIsRegistered(true);
            setIsRegistering(false);
            notify("Successfully registered!", "ok");
        } catch (err) {
            console.error("Reg error:", err);
            notify("Registration failed", "err");
        } finally {
            setRegLoading(false);
        }
    };

    // Helper to check if event is "NEW" (e.g. within last 30 days)
    const isNew = (createdAt, eventDate) => {
        // Fallback to eventDate if createdAt is missing
        const dateToUse = createdAt || eventDate;
        if (!dateToUse) return true;

        const createdDate = new Date(dateToUse);
        if (isNaN(createdDate.getTime())) return true;

        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Show as NEW if created or happening within 60 days
        return diffDays <= 60;
    };

    if (loading) {
        return (
            <div className={styles.wrapper}>
                {!hideTitle && (
                    <div className={styles.header}>
                        <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                        <div className={styles.line}></div>
                    </div>
                )}
                {isMarquee ? (
                    <div className={styles.marqueeContainer}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`${styles.marqueeItem} ${styles.skeleton}`} style={{ height: '80px', marginBottom: '10px' }}></div>
                        ))}
                    </div>
                ) : (
                    <div className={`${styles.timelineContainer} ${isCompact ? styles.compact : ""}`}>
                        <div className={styles.timelineLine}></div>
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`${styles.timelineItem} ${isCompact ? styles.left : (i % 2 === 0 ? styles.left : styles.right)}`}
                            >
                                <div className={styles.timelineDot}></div>
                                <div className={`${styles.timelineContent} ${styles.skeletonCard}`}></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className={styles.wrapper}>
                {!hideTitle && (
                    <div className={styles.header}>
                        <h2 className={styles.title}>{title || "📅 Events"}</h2>
                        <div className={styles.line}></div>
                    </div>
                )}
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                    No {category ? category.toLowerCase() : "upcoming"} events listed here yet.
                    <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
                        (Admin can add or categorize events in the CMS)
                    </p>
                </div>
            </div>
        );
    }

    // Render for Marquee Mode
    if (isMarquee) {
        // Double the list for seamless looping
        const displayList = [...events, ...events];
        return (
            <div className={styles.wrapper} style={{ margin: '20px 0' }}>
                {!hideTitle && (
                    <div className={styles.header} style={{ marginBottom: '30px' }}>
                        <h2 className={styles.title} style={{ fontSize: '1.6rem' }}>{title || "📅 News & Notifications"}</h2>
                        <div className={styles.line}></div>
                    </div>
                )}
                <div className={styles.marqueeContainer}>
                    <div className={styles.marqueeTrack}>
                        {displayList.map((ev, idx) => (
                            <div
                                key={`${ev.id}-${idx}`}
                                className={styles.marqueeItem}
                                onClick={() => setSelectedEvent(ev)}
                            >
                                <div className={styles.marqueeHeader}>
                                    {isNew(ev.createdAt, ev.eventDate) && (
                                        <img src={newBurst} alt="New" className={styles.newBadgeImg} />
                                    )}
                                    <h3 className={styles.marqueeTitle}>{ev.title}</h3>
                                </div>
                                <div className={styles.marqueeDate}>📅 {ev.eventDate}</div>
                                <p className={styles.marqueeDesc}>{ev.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <AnimatePresence>
                    {selectedEvent && (
                        <AnimatedModal onClose={() => { setSelectedEvent(null); setIsRegistering(false); }}>
                            {isRegistering ? (
                                <form onSubmit={submitRegistration} className={styles.regForm}>
                                    <div className={styles.viewerHeader}>
                                        <h2 className={styles.viewerTitle}>Event Registration</h2>
                                        <button type="button" className={styles.closeBtn} onClick={() => setIsRegistering(false)}>✕</button>
                                    </div>
                                    <div className={styles.viewerBody}>
                                        <p className={styles.regSub}>Please confirm your details for <strong>{selectedEvent.title}</strong></p>
                                        <div className={styles.formGrid}>
                                            <div className={styles.formGroup}>
                                                <label>First Name</label>
                                                <input className={styles.inp} value={regForm.firstName} onChange={e => setRegForm({ ...regForm, firstName: e.target.value })} required />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Last Name</label>
                                                <input className={styles.inp} value={regForm.lastName} onChange={e => setRegForm({ ...regForm, lastName: e.target.value })} required />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Email Address</label>
                                                <input className={styles.inp} type="email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Phone Number</label>
                                                <input className={styles.inp} type="tel" value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} required />
                                            </div>
                                            <div className={`${styles.formGroup} ${styles.full}`}>
                                                <label>Comments / Special Requirements</label>
                                                <textarea className={styles.inp} value={regForm.comments} onChange={e => setRegForm({ ...regForm, comments: e.target.value })} rows={3} placeholder="Any notes for the organizers?" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.modalFooter}>
                                        <button type="button" className={styles.footerActionBtn} onClick={() => setIsRegistering(false)}>Cancel</button>
                                        <button type="submit" className={styles.footerRegBtn} disabled={regLoading}>
                                            {regLoading ? "↻ Processing..." : "🚀 Confirm Registration"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className={styles.viewerHeader}>
                                        <h2 className={styles.viewerTitle}>{selectedEvent.title}</h2>
                                        <button className={styles.closeBtn} onClick={() => setSelectedEvent(null)}>✕</button>
                                    </div>
                                    <div className={styles.viewerBody}>
                                        <div className={styles.viewerDate}>📅 {selectedEvent.eventDate}</div>
                                        <div className={styles.viewerLocation}>📍 {selectedEvent.location}</div>
                                        {selectedEvent.imageUrl && (
                                            <div className={styles.viewerImageWrapper}>
                                                <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className={styles.viewerImage} />
                                            </div>
                                        )}
                                        <div className={styles.viewerContent}>
                                            <p>{selectedEvent.description}</p>
                                        </div>
                                    </div>
                                    <div className={styles.modalFooter}>
                                        <button
                                            className={`${styles.footerRegBtn} ${isRegistered ? styles.unreg : ""}`}
                                            onClick={handleRegister}
                                            disabled={regLoading}
                                        >
                                            {regLoading ? "↻ Processing..." : (isRegistered ? "✕ Unregister" : "📝 Register Now")}
                                        </button>
                                        <button className={styles.footerActionBtn} onClick={() => setSelectedEvent(null)}>Close</button>
                                    </div>
                                </>
                            )}
                        </AnimatedModal>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Default Timeline Rendering
    return (
        <div className={styles.wrapper}>
            {!hideTitle && (
                <div className={styles.header}>
                    <h2 className={styles.title}>{title || "📅 Upcoming Events & Circulars"}</h2>
                    <div className={styles.line}></div>
                </div>
            )}

            <div className={`${styles.timelineContainer} ${isCompact ? styles.compact : ""}`}>
                {/* Central Timeline Line */}
                <div className={styles.timelineLine}></div>

                {events.map((ev, index) => {
                    const isEven = isCompact ? true : (index % 2 === 0);
                    return (
                        <motion.div
                            key={ev.id}
                            className={`${styles.timelineItem} ${isEven ? styles.left : styles.right}`}
                            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            {/* Dot on the timeline */}
                            <div className={styles.timelineDot}>
                                <div className={styles.dotPulse}></div>
                            </div>

                            <div className={styles.timelineContent}>
                                <div className={styles.dateBadge} style={{ overflow: 'visible' }}>
                                    <span className={styles.calendarIcon}>📅</span> {ev.eventDate}
                                    {isNew(ev.createdAt, ev.eventDate) && (
                                        <div className={styles.newBadgeImgWrapper}>
                                            <img src={newBurst} alt="New" className={styles.newBadgeImg} />
                                        </div>
                                    )}
                                </div>

                                {ev.imageUrl && (
                                    <div className={styles.imageOverlay}>
                                        <img src={ev.imageUrl} alt={ev.title} className={styles.timelineImg} />
                                    </div>
                                )}

                                <div className={styles.innerContent}>
                                    <h3 className={styles.eventTitle}>{ev.title}</h3>
                                    <div className={styles.meta}>
                                        <span>📍 {ev.location}</span>
                                    </div>
                                    <p className={styles.desc}>{ev.description}</p>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => setSelectedEvent(ev)}
                                    >
                                        View Details <span className={styles.arrow}>→</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {selectedEvent && (
                    <AnimatedModal onClose={() => { setSelectedEvent(null); setIsRegistering(false); }}>
                        {isRegistering ? (
                            <form onSubmit={submitRegistration} className={styles.regForm}>
                                <div className={styles.viewerHeader}>
                                    <h2 className={styles.viewerTitle}>Event Registration</h2>
                                    <button type="button" className={styles.closeBtn} onClick={() => setIsRegistering(false)}>✕</button>
                                </div>
                                <div className={styles.viewerBody}>
                                    <p className={styles.regSub}>Please confirm your details for <strong>{selectedEvent.title}</strong></p>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>First Name</label>
                                            <input className={styles.inp} value={regForm.firstName} onChange={e => setRegForm({ ...regForm, firstName: e.target.value })} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Last Name</label>
                                            <input className={styles.inp} value={regForm.lastName} onChange={e => setRegForm({ ...regForm, lastName: e.target.value })} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Email Address</label>
                                            <input className={styles.inp} type="email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Phone Number</label>
                                            <input className={styles.inp} type="tel" value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} required />
                                        </div>
                                        <div className={`${styles.formGroup} ${styles.full}`}>
                                            <label>Comments / Special Requirements</label>
                                            <textarea className={styles.inp} value={regForm.comments} onChange={e => setRegForm({ ...regForm, comments: e.target.value })} rows={3} placeholder="Any notes for the organizers?" />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <button type="button" className={styles.footerActionBtn} onClick={() => setIsRegistering(false)}>Cancel</button>
                                    <button type="submit" className={styles.footerRegBtn} disabled={regLoading}>
                                        {regLoading ? "↻ Processing..." : "🚀 Confirm Registration"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className={styles.viewerHeader}>
                                    <h2 className={styles.viewerTitle}>{selectedEvent.title}</h2>
                                    <button className={styles.closeBtn} onClick={() => setSelectedEvent(null)}>✕</button>
                                </div>
                                <div className={styles.viewerBody}>
                                    <div className={styles.viewerDate}>📅 {selectedEvent.eventDate}</div>
                                    <div className={styles.viewerLocation}>📍 {selectedEvent.location}</div>
                                    {selectedEvent.imageUrl && (
                                        <div className={styles.viewerImageWrapper}>
                                            <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className={styles.viewerImage} />
                                        </div>
                                    )}
                                    <div className={styles.viewerContent}>
                                        <p>{selectedEvent.description}</p>
                                    </div>
                                </div>
                                <div className={styles.modalFooter}>
                                    <button
                                        className={`${styles.footerRegBtn} ${isRegistered ? styles.unreg : ""}`}
                                        onClick={handleRegister}
                                        disabled={regLoading}
                                    >
                                        {regLoading ? "↻ Processing..." : (isRegistered ? "✕ Unregister" : "📝 Register Now")}
                                    </button>
                                    <button className={styles.footerActionBtn} onClick={() => setSelectedEvent(null)}>Close</button>
                                </div>
                            </>
                        )}
                    </AnimatedModal>
                )}
            </AnimatePresence>
        </div>
    );
}

export default EventsPanel;
