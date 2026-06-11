import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useAnimationFrame, animate } from "framer-motion";
import { useApp, DEPARTMENTS } from "../context/AppContext";
import PublicNav from "../components/PublicNav";
import Footer from "../components/Footer";
import EventsPanel from "../components/EventsPanel";
import QuickNote from "../components/QuickNote";
import QuickWidgets from "../components/QuickWidgets";
import MessageDesk from "../components/MessageDesk";
import api from "../utils/api";
import styles from "./Home.module.css";

/* ── Shared animation variants ───────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13 } },
};

/* ── Animated Counter Component ───────────────────────────── */
function AnimatedCounter({ valueStr }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [display, setDisplay] = useState(0);

    const match = String(valueStr).match(/\d+/);
    const hasNum = !!match;
    const num = hasNum ? parseInt(match[0], 10) : 0;
    const suffix = hasNum ? String(valueStr).replace(match[0], '') : String(valueStr);

    useEffect(() => {
        if (isInView && hasNum) {
            const controls = animate(0, num, {
                duration: 2,
                ease: "easeOut",
                onUpdate: (val) => setDisplay(Math.round(val))
            });
            return () => controls.stop();
        }
    }, [isInView, num, hasNum]);

    if (!hasNum) return <span ref={ref}>{valueStr}</span>;

    return <span ref={ref}>{display}{suffix}</span>;
}

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

/* ── Section reveal wrapper ──────────────────────────────── */
function Reveal({ children, delay = 0, className, style }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px 0px" });
    return (
        <motion.div
            ref={ref}
            className={className}
            style={style}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
        >
            {children}
        </motion.div>
    );
}

/* ── Staggered children reveal ───────────────────────────── */
function StaggerReveal({ children, className, style }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px 0px" });
    return (
        <motion.div
            ref={ref}
            className={className}
            style={style}
            variants={stagger}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
        >
            {children}
        </motion.div>
    );
}

/* ── Reusable Snap Slider ────────────────────────────────────
   - Shows 3 cards: left (dimmed) · center (active) · right (dimmed)
   - Auto-advances every 4s; pauses 2s after any user interaction
   - Mouse drag + touch swipe (60px threshold)
   - Arrow buttons + dot indicators
────────────────────────────────────────────────────────── */
function Slider({ items, renderCard }) {
    const total = items.length;
    const [idx, setIdx] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const dragStartX = useRef(null);   // null = not dragging
    const timerRef = useRef(null);
    const pauseRef = useRef(false);

    function next() { setIdx(i => (i + 1) % total); }
    function prev() { setIdx(i => (i - 1 + total) % total); }

    function resetAuto(pauseMs = 2000) {
        clearInterval(timerRef.current);
        pauseRef.current = true;
        setTimeout(() => {
            pauseRef.current = false;
            timerRef.current = setInterval(() => { if (!pauseRef.current) next(); }, 4000);
        }, pauseMs);
    }

    useEffect(() => {
        timerRef.current = setInterval(() => { if (!pauseRef.current) next(); }, 4000);
        return () => clearInterval(timerRef.current);
    }, [total]);

    function onPointerDown(e) {
        dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
        setDragOffset(0);
    }
    function onPointerMove(e) {
        if (dragStartX.current == null) return;
        const x = e.clientX ?? e.touches?.[0]?.clientX;
        setDragOffset(x - dragStartX.current);
    }
    function onPointerUp() {
        if (dragStartX.current == null) return;
        if (dragOffset < -60) { prev(); resetAuto(); }
        else if (dragOffset > 60) { next(); resetAuto(); }
        dragStartX.current = null;
        setDragOffset(0);
    }

    const positions = [-1, 0, 1];
    return (
        <div
            style={{ position: "relative", userSelect: "none" }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
        >
            <div style={{ display: "flex", gap: 24, justifyContent: "center", alignItems: "stretch", overflow: "hidden", padding: "12px 0" }}>
                {positions.map(pos => {
                    const i = (idx + pos + total) % total;
                    const isCenter = pos === 0;
                    return (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                scale: isCenter ? 1 : 0.88,
                                opacity: isCenter ? 1 : 0.45,
                                filter: isCenter ? "blur(0px)" : "blur(1.5px)",
                                x: dragOffset * 0.25,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{ flex: isCenter ? "0 0 54%" : "0 0 22%", minWidth: 0 }}
                        >
                            {renderCard(items[i], isCenter, i, pos)}
                        </motion.div>
                    );
                })}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                {items.map((_, i) => (
                    <motion.button
                        key={i}
                        onClick={() => { setIdx(i); resetAuto(); }}
                        animate={{ scale: i === idx ? 1.4 : 1, opacity: i === idx ? 1 : 0.4 }}
                        transition={{ duration: 0.2 }}
                        style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--home-accent)", border: "none", cursor: "pointer", padding: 0 }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Hero Slider ─────────────────────────────────────────── */
function HeroSlider() {
    const { homeContent, cmsLoading } = useApp();
    const images = homeContent?.bgImages ?? [];
    const [index, setIndex] = useState(0);
    const timeoutRef = useRef(null);

    function resetTimeout() { clearTimeout(timeoutRef.current); }

    useEffect(() => {
        resetTimeout();
        if (images.length > 1) {
            timeoutRef.current = setTimeout(() => setIndex(prev => (prev + 1) % images.length), 4500);
        }
        return () => resetTimeout();
    }, [index, images.length]);

    // While fetching: show a shimmer placeholder so layout doesn't jump
    if (cmsLoading && images.length === 0) {
        return (
            <div className={styles.heroSliderBox}>
                <div
                    className="skeleton"
                    style={{ width: "100%", height: "100%", borderRadius: 20 }}
                    aria-label="Loading images…"
                />
            </div>
        );
    }

    // Backend offline / no images configured — render nothing (no Unsplash stock photos)
    if (!images.length) return null;

    return (
        <div className={styles.heroSliderBox}>
            <AnimatePresence mode="popLayout">
                <motion.img
                    key={index}
                    src={images[index]}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className={styles.heroSliderImg}
                />
            </AnimatePresence>

            {images.length > 1 && (
                <>
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${styles.heroArrow} ${styles.heroArrowL}`}
                        onClick={() => { resetTimeout(); setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
                    >
                        ‹
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${styles.heroArrow} ${styles.heroArrowR}`}
                        onClick={() => { resetTimeout(); setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); }}
                    >
                        ›
                    </motion.button>
                    <div className={styles.heroIndicators}>
                        {images.map((_, i) => (
                            <motion.button
                                key={i}
                                animate={{ scale: i === index ? 1.5 : 1, opacity: i === index ? 1 : 0.5 }}
                                transition={{ duration: 0.25 }}
                                className={`${styles.heroIndicator} ${i === index ? styles.heroIndicatorActive : ''}`}
                                onClick={() => { resetTimeout(); setIndex(i); }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Demo Credentials ─────────────────────────────────────── */
const DEMO = {
    ALUMNI: [
        { email: "alumni@aec.ac.in", pass: "password", branch: "Computer Science & Engineering" }
    ],
    ADMIN: [
        { email: "cse@aec.ac.in", pass: "password", branch: "Computer Science & Engineering" }
    ],
    SUPER_ADMIN: [
        { email: "superadmin@college.edu", pass: "SuperAdmin@123", branch: "" }
    ]
};

/* ── Inline Login Panel ───────────────────────────────────── */
function LoginPanel({ onClose }) {
    const { login, setPage } = useApp();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [branch, setBranch] = useState("");
    const [role, setRole] = useState("ALUMNI");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    async function submit(e) {
        e.preventDefault();
        if (role !== "SUPER_ADMIN" && !branch) return setErr("Please choose a branch/department");
        setErr(""); setBusy(true);
        const res = await login(email.trim(), pass, role === "SUPER_ADMIN" ? "" : branch);
        setBusy(false);
        if (res.ok) {
            if (res.otpRequired) {
                setPage("LOGIN");
            } else {
                onClose();
            }
        } else {
            setErr(res.error || "Login failed");
        }
    }

    return (
        <motion.div
            className={styles.glassPanel}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={styles.closeBtn}
                title="Close"
            >✕</motion.button>

            <div className={styles.panelTitle}>Welcome back 👋</div>

            <div className={styles.roleTabs}>
                {["ALUMNI", "ADMIN", "SUPER_ADMIN"].map(r => (
                    <motion.button
                        key={r}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setRole(r); setErr(""); }}
                        className={`${styles.roleTabBtn}${role === r ? ` ${styles.active}` : ""}`}
                    >
                        {r === "ALUMNI" ? "🎓 Alumni" : r === "ADMIN" ? "⚙️ Dept Admin" : "🛡️ Super Admin"}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {err && (
                    <motion.div
                        className={styles.errBox}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >⚠️ {err}</motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={submit}>
                {role !== "SUPER_ADMIN" && (
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Branch / Department</label>
                        <select
                            className={styles.inputField}
                            value={branch}
                            onChange={e => setBranch(e.target.value)}
                            required
                        >
                            <option value="">Choose Branch *</option>
                            {DEPARTMENTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Email</label>
                    <input
                        className={styles.inputField}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your_email@example.com"
                        required
                    />
                </div>
                <div className={styles.inputGroupLast}>
                    <label className={styles.inputLabel}>Password</label>
                    <input
                        className={styles.inputField}
                        type="password"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>
                <motion.button
                    type="submit"
                    disabled={busy}
                    className={styles.primaryBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                >
                    {busy ? "Signing in…" : "Sign In →"}
                </motion.button>
            </form>

            <div className={styles.demoBlock}>
                {DEMO[role] && DEMO[role].map(d => (
                    <div
                        key={d.email}
                        onClick={() => { setEmail(d.email); setPass(d.pass); setBranch(d.branch || ""); }}
                        className={styles.demoEmailRow}
                    >
                        📧 {d.email} <span className={styles.dimText}>(click to fill)</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

/* ── Coordinators Section ─────────────────────────────────── */
function CoordinatorsSection() {
    const { currentUser, page, notify, confirm } = useApp();
    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN" && page === "APP";

    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const pauseRef = useRef(false);
    const timerRef = useRef(null);

    const [coordModal, setCoordModal] = useState(null);
    const [coordEdit, setCoordEdit] = useState(null);

    const fetchCoords = () => {
        setLoading(true);
        api.get("/coordinators")
            .then(res => {
                setCoordinators(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCoords();
    }, []);

    function startCoordEdit(c = null) {
        if (c) {
            setCoordModal('edit');
            setCoordEdit({ ...c });
        } else {
            setCoordModal('add');
            setCoordEdit({ name: "", role: "", department: "", imageUrl: "", linkedInUrl: "" });
        }
    }

    async function saveCoord() {
        if (!coordEdit?.name?.trim()) return notify("Name is required", "err");
        try {
            if (coordModal === 'add') {
                await api.post("/coordinators", coordEdit);
                notify("Coordinator added!");
            } else {
                await api.put(`/coordinators/${coordEdit.id}`, coordEdit);
                notify("Coordinator updated!");
            }
            fetchCoords();
            setCoordModal(null);
        } catch (err) {
            notify("Failed to save coordinator", "err");
        }
    }

    const handleRemoveCoordinator = async (id) => {
        if (await confirm("Remove Coordinator?", "Are you sure you want to remove this person from the department board?")) {
            try {
                await api.delete(`/coordinators/${id}`);
                notify("Coordinator removed");
                fetchCoords();
            } catch (err) {
                notify("Failed to delete", "err");
            }
        }
    };

    function next() {
        setDirection(1);
        setIndex((prev) => (prev + 1) % coordinators.length);
    }

    function prev() {
        setDirection(-1);
        setIndex((prev) => (prev - 1 + coordinators.length) % coordinators.length);
    }

    function resetAuto(pauseMs = 6000) {
        clearInterval(timerRef.current);
        pauseRef.current = true;
        setTimeout(() => {
            if (coordinators.length <= 1) return;
            pauseRef.current = false;
            timerRef.current = setInterval(() => { if (!pauseRef.current) next(); }, 5000);
        }, pauseMs);
    }

    useEffect(() => {
        if (coordinators.length <= 1) return;
        timerRef.current = setInterval(() => { if (!pauseRef.current) next(); }, 5000); // Slide every 5 seconds
        return () => clearInterval(timerRef.current);
    }, [coordinators.length]);

    if (loading) {
        return (
            <div className={styles.sideBySideCol} style={{ minHeight: 600 }}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionEyebrow}>👔 Leadership</div>
                    <div className="skeleton" style={{ width: 300, height: 40, margin: '0 auto 20px' }}></div>
                </div>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div className="skeleton" style={{ width: '100%', aspectRatio: '16/10', borderRadius: 20 }}></div>
                </div>
            </div>
        );
    }

    if (coordinators.length === 0) return null;

    const currentCoord = coordinators[index];

    return (
        <div className={styles.sideBySideCol}>
            <Reveal>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionEyebrow}>👔 Leadership</div>
                    <h2 className={styles.sectionTitle}>Meet Our <span>Coordinators</span></h2>
                    <p className={styles.sectionSubtext}>The dedicated individuals guiding the alumni network and fostering connections.</p>
                    <div className={styles.sectionDivider} />
                </div>
            </Reveal>
            <div className={styles.macbookWrapper}>
                <motion.div
                    className={styles.macbookContainer}
                    initial={{ rotateX: 25, y: 40, opacity: 0 }}
                    whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                >
                    <div className={styles.macbookLid}>
                        <div className={styles.macbookCamera} />
                        <div className={styles.macbookScreen}>

                            {coordinators.length > 1 && (
                                <>
                                    <button
                                        className={`${styles.macbookArrow} ${styles.macbookArrowL}`}
                                        onClick={() => { prev(); resetAuto(); }}
                                        aria-label="Previous Coordinator"
                                    >‹</button>
                                    <button
                                        className={`${styles.macbookArrow} ${styles.macbookArrowR}`}
                                        onClick={() => { next(); resetAuto(); }}
                                        aria-label="Next Coordinator"
                                    >›</button>
                                </>
                            )}

                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={index}
                                    custom={direction}
                                    initial={{ y: direction > 0 ? 50 : -50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: direction > 0 ? -50 : 50, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "anticipate" }}
                                    className={`${styles.alumniCard} ${styles.alumniCardActive} ${styles.macbookCardSingle}`}
                                >
                                    <div className={styles.alumniAvatarWrapperMacbook}>
                                        <img
                                            src={currentCoord.imageUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop"}
                                            alt={currentCoord.name}
                                            className={styles.alumniAvatar}
                                            style={{ borderRadius: '16px' }}
                                            draggable="false"
                                        />
                                        {isSuper && (
                                            <div className={styles.cardActionsOverlay}>
                                                <button className={styles.actionBtnSmall} onClick={(e) => { e.stopPropagation(); startCoordEdit(currentCoord); }}>✎</button>
                                                <button className={`${styles.actionBtnSmall} ${styles.del}`} onClick={(e) => { e.stopPropagation(); handleRemoveCoordinator(currentCoord.id); }}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className={styles.alumniName}>{currentCoord.name}</h3>
                                    <div className={styles.alumniRole}>{currentCoord.role}</div>
                                    <p className={styles.alumniBio}>{currentCoord.department}</p>
                                    {currentCoord.linkedInUrl && (
                                        <a href={currentCoord.linkedInUrl} target="_blank" rel="noreferrer" className={styles.cardLink}>
                                            LinkedIn ↗
                                        </a>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className={styles.macbookBase}>
                        <div className={styles.macbookNotch} />
                    </div>
                    <div className={styles.macbookBottomShadow} />
                </motion.div>
            </div>
            {isSuper && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button className={styles.editBtnSimple} onClick={() => startCoordEdit()}>👤➕ Add Coordinator</button>
                </div>
            )}

            <div style={{ position: 'relative', zIndex: 9999 }}>
                {/* Coordinator Modal Form */}
                <AnimatePresence>
                    {coordModal && (
                        <AnimatedModal onClose={() => setCoordModal(null)}>
                            <div className={styles.modalHeader}>
                                <h3>{coordModal === 'add' ? 'Add Coordinator' : 'Edit Coordinator'}</h3>
                                <button onClick={() => setCoordModal(null)}>✕</button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input className="inp" value={coordEdit.name} onChange={e => setCoordEdit({ ...coordEdit, name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <input className="inp" value={coordEdit.role} onChange={e => setCoordEdit({ ...coordEdit, role: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <input className="inp" value={coordEdit.department} onChange={e => setCoordEdit({ ...coordEdit, department: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Image URL</label>
                                    <input className="inp" value={coordEdit.imageUrl} onChange={e => setCoordEdit({ ...coordEdit, imageUrl: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">LinkedIn URL</label>
                                    <input className="inp" value={coordEdit.linkedInUrl} onChange={e => setCoordEdit({ ...coordEdit, linkedInUrl: e.target.value })} />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button className="btn btn-outline" onClick={() => setCoordModal(null)}>Cancel</button>
                                <button className="btn btn-primary" onClick={saveCoord}>Save</button>
                            </div>
                        </AnimatedModal>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ── Single Card Flip Testimonials Slider ────────────────────────────────── */
function TestimonialsSlider() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const timerRef = useRef(null);
    const isHoveredRef = useRef(false);

    useEffect(() => {
        api.get("/testimonials")
            .then(res => {
                setTestimonials(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    function next() {
        setDirection(1);
        setIndex(i => (i + 1) % testimonials.length);
    }

    function prev() {
        setDirection(-1);
        setIndex(i => (i - 1 + testimonials.length) % testimonials.length);
    }

    function startTimer() {
        clearInterval(timerRef.current);
        if (testimonials.length <= 1) return;
        timerRef.current = setInterval(() => {
            if (!isHoveredRef.current) {
                setDirection(1);
                setIndex(i => (i + 1) % testimonials.length);
            }
        }, 8000);
    }

    useEffect(() => {
        startTimer();
        return () => clearInterval(timerRef.current);
    }, [testimonials.length]);

    function handleNext() {
        next();
        startTimer();
    }

    function handlePrev() {
        prev();
        startTimer();
    }


    if (loading) {
        return (
            <div className={`${styles.sideBySideCol} ${styles.testimonialsSection}`}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionEyebrow}>💬 Alumni Voices</div>
                    <div className="skeleton" style={{ width: 250, height: 40, margin: '0 auto 20px' }}></div>
                </div>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div className="skeleton" style={{ width: '100%', height: 320, borderRadius: 28 }}></div>
                </div>
            </div>
        );
    }

    if (testimonials.length === 0) return null;

    const currentCard = testimonials[index];

    // Clean Sequential 3D Flip Variants
    const flipVariants = {
        enter: (dir) => ({
            rotateY: dir > 0 ? 90 : -90,
            opacity: 0,
            z: -50,
        }),
        center: {
            rotateY: 0,
            opacity: 1,
            z: 0,
            transition: { type: "tween", duration: 0.4, ease: "easeOut" }
        },
        exit: (dir) => ({
            rotateY: dir > 0 ? -90 : 90,
            opacity: 0,
            z: -50,
            transition: { type: "tween", duration: 0.4, ease: "easeIn" }
        })
    };

    return (
        <div id="testimonials" className={`${styles.sideBySideCol} ${styles.testimonialsSection}`}>
            <Reveal>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionEyebrow}>💬 Alumni Voices</div>
                    <h2 className={styles.sectionTitle}>What our <span>Alumni Say</span></h2>
                    <p className={styles.sectionSubtext}>Hear from our graduates about their experiences and journeys after college.</p>
                    <div className={styles.sectionDivider} />
                </div>
            </Reveal>

            <div className={styles.flipSliderWrap}>
                {testimonials.length > 1 && (
                    <button
                        className={`${styles.flipSliderNav} ${styles.flipSliderNavPrev}`}
                        onClick={handlePrev}
                        aria-label="Previous Testimonial"
                    >
                        ‹
                    </button>
                )}

                <div
                    className={styles.flipCardContainer}
                    onMouseEnter={() => { isHoveredRef.current = true; }}
                    onMouseLeave={() => { isHoveredRef.current = false; }}
                >
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={index}
                            custom={direction}
                            variants={flipVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className={styles.testimonialCard3D}
                            style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
                        >
                            <div className={styles.testimonialAvatarWrap}>
                                <img
                                    src={currentCard.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"}
                                    alt={currentCard.authorName}
                                    className={styles.testimonialAvatar}
                                />
                                <div className={styles.testimonialQuoteIcon}>❝</div>
                            </div>
                            <p className={styles.testimonialQuote}>{currentCard.content}</p>
                            <div className={styles.testimonialInfo}>
                                <h4 className={styles.testimonialAuthor}>{currentCard.authorName}</h4>
                                <span className={styles.testimonialBatch}>Class of {currentCard.batchYear}</span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {testimonials.length > 1 && (
                    <button
                        className={`${styles.flipSliderNav} ${styles.flipSliderNavNext}`}
                        onClick={handleNext}
                        aria-label="Next Testimonial"
                    >
                        ›
                    </button>
                )}
            </div>

        </div>
    );
}

/* ── Animated Modal Wrapper ──────────────────────────────── */
function AnimatedModal({ onClose, children }) {
    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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

/* ── Draggable Auto-Scrolling Carousel Wrapper ─────────────────────────── */
function DraggableCarousel({ items, renderItem, trackClassName, baseSpeed = 0.5 }) {
    const trackRef = useRef(null);
    const [contentWidth, setContentWidth] = useState(0);
    const x = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!trackRef.current) return;
        const updateWidth = () => {
            // Width of 1 set of items is exactly 1/4 of the track's full width
            setContentWidth(trackRef.current.scrollWidth / 4);
        };
        updateWidth();
        window.setTimeout(updateWidth, 100);
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [items]);

    useAnimationFrame((time, delta) => {
        if (!contentWidth || isDragging) return;

        let currentX = x.get();
        if (!isHovered) {
            // Auto scroll leftwards
            currentX -= baseSpeed * (delta / 16.6);
        }

        // Infinite wrap bounds
        if (currentX <= -contentWidth) {
            currentX += contentWidth;
        } else if (currentX > 0) {
            currentX -= contentWidth;
        }

        x.set(currentX);
    });

    return (
        <motion.div
            className={styles.carouselViewportDrag}
            whileTap={{ cursor: "grabbing" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                ref={trackRef}
                drag="x"
                style={{ x }}
                dragConstraints={{ left: -contentWidth * 2.5, right: contentWidth * 0.5 }}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                className={trackClassName}
            >
                {[...items, ...items, ...items, ...items].map(renderItem)}
            </motion.div>
        </motion.div>
    );
}

/* ── Home Page ────────────────────────────────────────── */
export default function Home() {
    const {
        homeContent, updateHome, notify, page, setPage, currentUser,
        newsItems, updateNews, editNews, removeNews,
        notableAlumni, updateNotableAlumni, editNotableAlumni, removeNotableAlumni,
        cmsLoading, confirm
    } = useApp();
    const [authPanel, setAuthPanel] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    // News CRUD state
    const [newsModal, setNewsModal] = useState(null);
    const [newsEdit, setNewsEdit] = useState(null);
    const [viewerNews, setViewerNews] = useState(null);

    // Alumni CRUD state
    const [alumniModal, setAlumniModal] = useState(null);
    const [alumniEdit, setAlumniEdit] = useState(null);

    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN" && page === "APP";

    const [stats, setStats] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        setStatsLoading(true);
        try {
            const res = await api.get("/cms/stats/dynamic");
            if (Array.isArray(res.data)) {
                setStats(res.data);
            } else {
                console.error("Stats API returned non-array data:", res.data);
                setStats([]);
            }
        } catch (e) {
            console.error("Failed to fetch stats", e);
            setStats([]);
        } finally {
            setStatsLoading(false);
        }
    }

    function startEdit() {
        setEditing(true);
        setEditData({ ...homeContent });
    }

    function save() {
        updateHome(editData);
        setEditing(false);
    }

    // --- News CRUD Logic ---
    function startNewsEdit(item = null) {
        if (item) {
            setNewsModal('edit');
            setNewsEdit({ ...item });
        } else {
            setNewsModal('add');
            setNewsEdit({ tag: "Achievement", title: "", date: new Date().toISOString().slice(0, 10), excerpt: "", image: "https://images.unsplash.com/photo-1523240715630-97370d18229a" });
        }
    }

    async function saveNews() {
        if (!newsEdit?.title?.trim()) return notify("Title is required", "err");
        if (newsModal === 'add') {
            await updateNews(newsEdit);
        } else {
            await editNews(newsEdit);
        }
        setNewsModal(null);
    }

    async function deleteNews(id) {
        if (await confirm("Delete News?", "Permanently remove this news story from the portal?")) {
            await removeNews(id);
        }
    }

    // --- Alumni CRUD Logic ---
    function startAlumniEdit(alumnus = null) {
        if (alumnus) {
            setAlumniModal('edit');
            setAlumniEdit({ ...alumnus });
        } else {
            setAlumniModal('add');
            setAlumniEdit({ name: "", role: "", bio: "", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a" });
        }
    }

    async function saveAlumni() {
        if (!alumniEdit?.name?.trim()) return notify("Name is required", "err");
        if (alumniModal === 'add') {
            await updateNotableAlumni(alumniEdit);
        } else {
            await editNotableAlumni(alumniEdit);
        }
        setAlumniModal(null);
    }

    async function deleteAlumni(id) {
        if (await confirm("Remove Highlight?", "Remove this alumnus from the distinguished showcase?")) {
            await removeNotableAlumni(id);
        }
    }

    const particles = [
        [8, 15, 8, "3s"],
        [70, 35, 5, "5s"],
        [85, 65, 10, "4s"],
        [40, 80, 6, "6s"],
    ];

    return (
        <div className={styles.homeContainer}>
            {page !== "APP" && <PublicNav activePage="HOME" />}

            {/* ── Hero Section ── */}
            <section className={styles.heroSection}>
                {particles.map(([x, y, s, dur], i) => (
                    <div
                        key={i}
                        className={styles.heroParticle}
                        style={{ left: `${x}%`, top: `${y}%`, width: s * 8, height: s * 8, animationDuration: dur }}
                    />
                ))}

                <div className={styles.glowOrb1} />
                <div className={styles.glowOrb2} />

                <div className={styles.heroGrid}>
                    <AnimatePresence mode="wait">
                        {!authPanel && (
                            <motion.div
                                key="heroContent"
                                className={styles.heroContent}
                                variants={stagger}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                            >
                                <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                                    <div className={styles.heroHead}>
                                        <div className={styles.heroBadge}>Est. 1955</div>
                                    </div>
                                </motion.div>
                                <motion.h1
                                    className={styles.heroTitle}
                                    variants={fadeUp}
                                    transition={{ duration: 0.6 }}
                                >
                                    Assam Engineering<br />
                                    <span className={styles.gradientText}>College Alumni</span>
                                </motion.h1>
                                <motion.p
                                    className={styles.heroSubtext}
                                    variants={fadeUp}
                                    transition={{ duration: 0.6 }}
                                >
                                    Welcome to the official alumni network of Assam Engineering College.
                                    Established in 1955, AEC has a rich legacy of producing world-class engineers.
                                    Reconnect with your batchmates, discover exciting opportunities, and support your alma mater.
                                </motion.p>

                                <motion.div variants={fadeUp} transition={{ duration: 0.7 }} className={styles.heroActions}>
                                    <button className={styles.btnPrimaryLg} onClick={() => setPage("REGISTER")}>
                                        Join the Network
                                    </button>
                                    <a href="#testimonials" className={styles.btnSecondaryLg}>
                                        Alumni Voices
                                    </a>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {!authPanel && (
                            <motion.div
                                key="slider"
                                className={styles.heroSliderWrap}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                            >
                                <HeroSlider />
                                <QuickWidgets />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                    {authPanel && (
                        <div className={styles.authPanelWrap}>
                            {authPanel === "login" && <LoginPanel onClose={() => setAuthPanel(null)} />}
                        </div>
                    )}
                </AnimatePresence>
            </section>

            <QuickNote />

            {/* ── Stats Bar ── */}
            <AnimatePresence>
                {!authPanel && (statsLoading || (Array.isArray(stats) && stats.length > 0)) && (
                    <div style={{ position: 'relative', width: '100%' }}>
                        <div className={styles.heroStats} style={{ opacity: 1 }}>
                            {statsLoading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className={styles.statItem}>
                                        <div className="skeleton" style={{ width: 80, height: 40, marginBottom: 8, borderRadius: 8 }}></div>
                                        <div className="skeleton" style={{ width: 60, height: 16, borderRadius: 4 }}></div>
                                    </div>
                                ))
                            ) : (
                                Array.isArray(stats) && stats.map((s, idx) => (
                                    <motion.div
                                        key={s.id || s.label}
                                        className={styles.statItem}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    >
                                        <div className={styles.statNumber}>
                                            <AnimatedCounter valueStr={s.value} />
                                        </div>
                                        <div className={styles.statLabel}>{s.label}</div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* ─── Events Panel ── */}
            <Reveal style={{ maxWidth: 1400, margin: "0 auto", minHeight: 400, padding: "0 24px" }}>
                <section className={styles.sideBySideGrid}>
                    <div style={{ background: 'var(--home-surface)', borderRadius: '24px', padding: '20px', border: '1px solid var(--home-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <EventsPanel
                            category="UPCOMING"
                            title="News & Notifications"
                            isMarquee={true}
                            limit={10}
                        />
                    </div>
                    <div style={{ background: 'var(--home-surface)', borderRadius: '24px', padding: '20px', border: '1px solid var(--home-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                        <MessageDesk />
                    </div>
                </section>
            </Reveal>

            {/* ─── News & Stories Section ── */}
            {(cmsLoading || newsItems.length > 0) && (
                <section className={styles.homeSection}>
                    <Reveal>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionEyebrow}>📰 Latest Updates</div>
                            <h2 className={styles.sectionTitle}>News & <span>Success Stories</span></h2>
                            <p className={styles.sectionSubtext}>Stay updated with the latest campus highlights and alumni achievements.</p>
                            <div className={styles.sectionDivider} />
                        </div>
                    </Reveal>

                    {cmsLoading ? (
                        <div style={{ display: 'flex', gap: 24, padding: '0 24px', overflow: 'hidden' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton" style={{ flex: '0 0 350px', height: 400, borderRadius: 20 }}></div>
                            ))}
                        </div>
                    ) : (
                        <DraggableCarousel
                            items={newsItems}
                            trackClassName={styles.carouselTrackDrag}
                            renderItem={(item, i) => (
                                <div key={`${item.id}-${i}`} className={`${styles.newsCard} ${styles.newsCardActive}`}>
                                    <div className={styles.newsImageWrapper}>
                                        <div className={styles.newsTag}>{item.tag}</div>
                                        <img src={item.image} alt={item.title} className={styles.newsImage} draggable="false" />
                                        {isSuper && (
                                            <div className={styles.cardActions}>
                                                <button className={styles.actionBtn} onClick={() => startNewsEdit(item)}>✎</button>
                                                <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => deleteNews(item.id)}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.newsContent}>
                                        <div className={styles.newsDate}>{item.date}</div>
                                        <h3 className={styles.newsTitle}>{item.title}</h3>
                                        <p className={styles.newsExcerpt}>{item.excerpt}</p>
                                        <span
                                            className={styles.newsReadMore}
                                            onClick={() => setViewerNews(item)}
                                        >
                                            Read More →
                                        </span>
                                    </div>
                                </div>
                            )}
                        />
                    )}

                    {isSuper && !cmsLoading && (
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <button className={styles.editBtnSimple} onClick={() => startNewsEdit()}>➕ Add News Story</button>
                        </div>
                    )}
                </section>
            )}
            {/* Super admin can add news even when list is empty */}
            {newsItems.length === 0 && isSuper && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <button className={styles.editBtnSimple} onClick={() => startNewsEdit()}>➕ Add First News Story</button>
                </div>
            )}

            {/* ─── Notable Alumni Showcase ── */}
            {(cmsLoading || notableAlumni.length > 0) && (
                <section className={styles.homeSectionAlt}>
                    <Reveal>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionEyebrow}>🎓 Alumni Showcase</div>
                            <h2 className={styles.sectionTitle}>Distinguished <span>Alumni</span></h2>
                            <p className={styles.sectionSubtext}>Celebrating the remarkable journeys of our graduates across the globe.</p>
                            <div className={styles.sectionDivider} />
                        </div>
                    </Reveal>

                    {cmsLoading ? (
                        <div style={{ display: 'flex', gap: 24, padding: '0 24px', overflow: 'hidden' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="skeleton" style={{ flex: '0 0 270px', height: 400, borderRadius: 20 }}></div>
                            ))}
                        </div>
                    ) : (
                        <DraggableCarousel
                            items={notableAlumni}
                            baseSpeed={0.4}
                            trackClassName={styles.carouselTrackSlowDrag}
                            renderItem={(alumnus, i) => (
                                <div key={`${alumnus.id}-${i}`} className={`${styles.alumniCard} ${styles.alumniCardActive}`}>
                                    <div className={styles.alumniAvatarWrapper}>
                                        <img src={alumnus.avatar} alt={alumnus.name} className={styles.alumniAvatar} draggable="false" />
                                        {isSuper && (
                                            <div className={styles.cardActionsOverlay}>
                                                <button className={styles.actionBtnSmall} onClick={() => startAlumniEdit(alumnus)}>✎</button>
                                                <button className={`${styles.actionBtnSmall} ${styles.del}`} onClick={() => deleteAlumni(alumnus.id)}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className={styles.alumniName}>{alumnus.name}</h3>
                                    <div className={styles.alumniRole}>{alumnus.role}</div>
                                    <p className={styles.alumniBio}>{alumnus.bio}</p>
                                </div>
                            )}
                        />
                    )}


                    {isSuper && !cmsLoading && (
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <button className={styles.editBtnSimple} onClick={() => startAlumniEdit()}>👤➕ Add Alumnus</button>
                        </div>
                    )}
                </section>
            )}
            {/* Super admin can add alumni even when list is empty */}
            {notableAlumni.length === 0 && isSuper && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <button className={styles.editBtnSimple} onClick={() => startAlumniEdit()}>👤➕ Add First Alumnus</button>
                </div>
            )}

            {/* ─── Coordinators & Testimonials Side-by-Side ── */}
            <section className={styles.homeSectionAlt}>
                <div className={styles.sideBySideGrid}>
                    <CoordinatorsSection />
                    <TestimonialsSlider />
                </div>
            </section>

            {/* Animated Modals */}
            <AnimatePresence>
                {editing && (
                    <AnimatedModal onClose={() => setEditing(false)}>
                        <div className={styles.modalHeader}>
                            <h3>Edit Home Page Content</h3>
                            <button onClick={() => setEditing(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className="form-group">
                                <label className="form-label">Hero Badge</label>
                                <input className="inp" value={editData.badge} onChange={e => setEditData({ ...editData, badge: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Main Title Line</label>
                                <input className="inp" value={editData.titleMain} onChange={e => setEditData({ ...editData, titleMain: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gradient Title Line</label>
                                <input className="inp" value={editData.titleGradient} onChange={e => setEditData({ ...editData, titleGradient: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subtext / Description</label>
                                <textarea className="inp" rows={3} value={editData.subtext} onChange={e => setEditData({ ...editData, subtext: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Background Images (one URL per line)</label>
                                <textarea className="inp" rows={5} value={editData.bgImages.join('\n')} onChange={e => setEditData({ ...editData, bgImages: e.target.value.split('\n').filter(l => l.trim()) })} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>Save Changes</button>
                        </div>
                    </AnimatedModal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewerNews && (
                    <AnimatedModal onClose={() => setViewerNews(null)}>
                        <div className={styles.viewerHeader}>
                            <div className={styles.newsTag}>{viewerNews.tag}</div>
                            <button className={styles.closeBtn} onClick={() => setViewerNews(null)}>✕</button>
                        </div>
                        <div className={styles.viewerBody}>
                            <div className={styles.viewerDate}>{viewerNews.date}</div>
                            <h2 className={styles.viewerTitle}>{viewerNews.title}</h2>
                            <div className={styles.viewerImageWrapper}>
                                <img src={viewerNews.image} alt={viewerNews.title} className={styles.viewerImage} />
                            </div>
                            <div className={styles.viewerContent}>
                                <p>{viewerNews.excerpt}</p>
                                {/* In a real app, this might be 'content' - but for now we show the excerpt as the story */}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn btn-primary" onClick={() => setViewerNews(null)}>Close</button>
                        </div>
                    </AnimatedModal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {newsModal && (
                    <AnimatedModal onClose={() => setNewsModal(null)}>
                        <div className={styles.modalHeader}>
                            <h3>{newsModal === 'add' ? 'Add News Story' : 'Edit News Story'}</h3>
                            <button onClick={() => setNewsModal(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label className="form-label">Tag / Category</label>
                                    <input className="inp" value={newsEdit.tag} onChange={e => setNewsEdit({ ...newsEdit, tag: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label">Date</label>
                                    <input className="inp" value={newsEdit.date} onChange={e => setNewsEdit({ ...newsEdit, date: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input className="inp" value={newsEdit.title} onChange={e => setNewsEdit({ ...newsEdit, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Image URL</label>
                                <input className="inp" value={newsEdit.image} onChange={e => setNewsEdit({ ...newsEdit, image: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Excerpt / Summary</label>
                                <textarea className="inp" rows={3} value={newsEdit.excerpt} onChange={e => setNewsEdit({ ...newsEdit, excerpt: e.target.value })} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setNewsModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveNews}>
                                {newsModal === 'add' ? 'Create News' : 'Save Changes'}
                            </button>
                        </div>
                    </AnimatedModal>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {alumniModal && (
                    <AnimatedModal onClose={() => setAlumniModal(null)}>
                        <div className={styles.modalHeader}>
                            <h3>{alumniModal === 'add' ? 'Add Distinguished Alumnus' : 'Edit Alumnus Details'}</h3>
                            <button onClick={() => setAlumniModal(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="inp" value={alumniEdit.name} onChange={e => setAlumniEdit({ ...alumniEdit, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role / Designation</label>
                                <input className="inp" value={alumniEdit.role} onChange={e => setAlumniEdit({ ...alumniEdit, role: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Avatar URL</label>
                                <input className="inp" value={alumniEdit.avatar} onChange={e => setAlumniEdit({ ...alumniEdit, avatar: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bio / Quote</label>
                                <textarea className="inp" rows={3} value={alumniEdit.bio} onChange={e => setAlumniEdit({ ...alumniEdit, bio: e.target.value })} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setAlumniModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveAlumni}>
                                {alumniModal === 'add' ? 'Add Alumnus' : 'Save Changes'}
                            </button>
                        </div>
                    </AnimatedModal>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

