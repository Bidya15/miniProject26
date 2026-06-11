import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useApp, DEPARTMENTS } from "../context/AppContext";
import { timeAgo, avatarColor, fmtDate, fmtDateTime, POST_TYPE_META } from "../utils/helpers";
import AvatarImg from "../components/AvatarImg";
import ChatView from "../components/ChatView";
import NotificationsView from "../components/NotificationsView";
import EventsPanel from "../components/EventsPanel";
import NewPostModal from "../components/NewPostModal";
import MentorshipManager from "../components/MentorshipManager";
import CareerManager from "../components/CareerManager";
import FeedbackView from "./FeedbackView";
import JobPortal from "./JobPortal";
import { DraggableBox } from "./Admin";


const PAGE_SIZE = 6;

// ─── Post type filters ──────────────────────────────────────
const FILTERS = ["ALL", "JOB", "REFERRAL", "MENTORSHIP", "WEBINAR"];

// ─── Post Detail Modal ────────────────────────────────────────
function PostDetailModal({ p, onClose }) {
    const poster = p.user || {};
    const meta = POST_TYPE_META[p.postType] || {};
    useEffect(() => {
        function onKey(e) { if (e.key === "Escape") onClose(); }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    return (
        <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-lg" style={{ position: "relative", maxWidth: "600px" }}>
                <button onClick={onClose} style={{
                    position: "absolute", top: "12px", right: "12px",
                    background: "var(--gray-100)", border: "none", borderRadius: "50%",
                    width: "32px", height: "32px", fontSize: "18px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
                    color: "var(--gray-700)"
                }}>✕</button>

                {/* Poster profile */}
                <div className="post-card-header" style={{ marginBottom: "16px" }}>
                    <div className="post-author">
                        <AvatarImg user={poster} className="avatar avatar-lg" />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "16px" }}>{poster.name || "Alumni"}</div>
                            {(poster.designation || poster.company) && (
                                <div style={{ color: "var(--gray-500)", fontSize: "13px" }}>
                                    {poster.designation}{poster.company ? ` · ${poster.company}` : ""}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                                {poster.batch && <span className="batch-badge" style={{ fontSize: "11px" }}>Batch {poster.batch}</span>}
                                <span style={{ color: "var(--gray-400)", fontSize: "12px" }}>{timeAgo(p.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <span className={`type-badge ${meta.cls}`}>{meta.icon} {meta.label}</span>
                </div>

                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>{p.title}</h2>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.7, marginBottom: "16px" }}>{p.description}</p>

                {p.postType === "WEBINAR" && p.webinarDate && (
                    <div className="webinar-date" style={{ marginBottom: "12px" }}>
                        📅 {fmtDateTime(p.webinarDate)}
                        {p.webinarLink && <a href={p.webinarLink} target="_blank" rel="noreferrer" className="webinar-link">Join →</a>}
                    </div>
                )}
                {(p.postType === "JOB" || p.postType === "REFERRAL") && p.company && (
                    <div className="post-company" style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                        <span>🏢 {p.company}</span>
                        {p.location && <span style={{ color: "var(--gray-400)" }}>• 📍 {p.location}</span>}
                        {p.experience && <span style={{ color: "var(--gray-400)" }}>• 🎓 {p.experience}</span>}
                    </div>
                )}

                {poster.location && <div style={{ color: "var(--gray-500)", fontSize: "13px", marginBottom: "8px" }}>📍 {poster.location}</div>}
                {poster.techStack && (
                    <div className="tags" style={{ marginBottom: "12px" }}>
                        {poster.techStack.split(",").map(t => <span key={t} className="tag">{t.trim()}</span>)}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                    {p.applyUrl && (
                        <a href={p.applyUrl} target="_blank" rel="noreferrer" style={{
                            display: "flex", alignItems: "center", gap: "12px",
                            background: "var(--gray-50)", border: "1px solid var(--gray-200)",
                            padding: "12px", borderRadius: "8px", textDecoration: "none",
                            transition: "background 0.2s"
                        }} onMouseOver={e => e.currentTarget.style.background = "#f0f7ff"} onMouseOut={e => e.currentTarget.style.background = "var(--gray-50)"}>
                            <span style={{ fontSize: "18px" }}>🔗</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--gray-800)" }}>Shared Application/Resource Link</div>
                                <div style={{ fontSize: "12px", color: "var(--indigo)", wordBreak: "break-all" }}>{p.applyUrl}</div>
                            </div>
                            <span style={{ color: "var(--gray-400)" }}>↗</span>
                        </a>
                    )}
                    <div style={{ display: "flex", gap: "10px" }}>
                        {poster.linkedinUrl && <a href={poster.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ flex: 1 }}>LinkedIn Profile ↗</a>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Single post card ─────────────────────────────────────────
function PostCard({ p, showActions = false, onEdit }) {
    const { deletePost } = useApp();
    const [showDetail, setShowDetail] = useState(false);
    const meta = POST_TYPE_META[p.postType] || {};
    const poster = p.user || {};

    return (
        <>
            {showDetail && <PostDetailModal p={p} onClose={() => setShowDetail(false)} />}
            <div className="post-card" onClick={() => setShowDetail(true)} style={{ cursor: "pointer" }}>
                <div className="post-card-header">
                    <div className="post-author">
                        <AvatarImg user={poster} className="avatar avatar-sm" />
                        <div>
                            <div className="post-author-name">{poster.name || "Alumni"}</div>
                            {(poster.designation || poster.company) && (
                                <div className="post-author-meta">
                                    {poster.designation}{poster.company ? ` · ${poster.company}` : ""}
                                </div>
                            )}
                            <div className="post-author-sub">
                                {poster.batch && <span className="batch-badge" style={{ fontSize: "11px", padding: "1px 7px" }}>Batch {poster.batch}</span>}
                                <span style={{ marginLeft: poster.batch ? "6px" : 0, color: "var(--gray-400)", fontSize: "12px" }}>{timeAgo(p.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <span className={`type-badge ${meta.cls}`}>{meta.icon} {meta.label}</span>
                </div>

                <div className="post-title" style={{ marginTop: "10px" }}>{p.title}</div>
                <div className="post-desc" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</div>

                {p.postType === "WEBINAR" && p.webinarDate && (
                    <div className="post-company">📅 {fmtDateTime(p.webinarDate)} {p.location && `· 📍 ${p.location}`}</div>
                )}
                {(p.postType === "JOB" || p.postType === "REFERRAL" || p.postType === "MENTORSHIP") && p.company && (
                    <div className="post-company" style={{ fontSize: "13px", color: "var(--gray-500)", marginTop: "4px" }}>
                        {p.postType === "MENTORSHIP" ? "🎓 Focus: " : "🏢 "}
                        {p.company} {p.location && ` · 📍 ${p.location}`}
                        {p.experience && ` · 💼 ${p.experience}`}
                    </div>
                )}

                {p.applyUrl && (
                    <div style={{ marginTop: "8px", color: "var(--indigo)", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        🔗 Link shared in post
                    </div>
                )}

                <div className="post-actions-row" style={{ marginTop: "10px" }}>
                    <span style={{ fontSize: "12px", color: "var(--gray-400)" }}>Click to read more →</span>
                    {showActions && (
                        <div style={{ display: "flex", gap: "8px" }}>
                            {onEdit && <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); onEdit(p); }}>✏️ Edit</button>}
                            <button className="btn btn-red btn-sm" onClick={async (e) => { e.stopPropagation(); if (await confirm("Delete Post?", "Are you sure you want to permanently remove this post?")) deletePost(p.id); }}>🗑 Delete</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}



// ─── Feed (community posts from other alumni) ────────────────
function Feed({ isSuccessStories = false }) {
    const { posts, currentUser, fetchPosts } = useApp();
    const [modal, setModal] = useState(false);
    const [subTab, setSubTab] = useState("feed");

    // Default filter logic
    const initialFilter = isSuccessStories ? "SUCCESS_STORY" : "ALL";
    const [filter, setFilter] = useState(initialFilter);

    useEffect(() => {
        fetchPosts();
    }, []);

    // Filter posts based on the view type and sort by recency
    const communityPosts = posts
        .filter(p => {
            if (isSuccessStories) return p.postType === "SUCCESS_STORY";
            return p.postType !== "SUCCESS_STORY" && p.user?.id !== currentUser?.id;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const visible = filter === "ALL" ? communityPosts : communityPosts.filter(p => p.postType === filter);

    const activeFilters = isSuccessStories ? ["SUCCESS_STORY"] : FILTERS;
    const title = isSuccessStories ? "Success Stories" : "Community Feed";
    const subtitle = isSuccessStories
        ? "Inspirational journeys and milestones from our alumni network"
        : "Jobs, referrals, mentorship & webinars from fellow alumni";

    return (
        <div className="feed-container">
            {modal && <NewPostModal
                onClose={() => setModal(false)}
                defaultType={isSuccessStories ? "SUCCESS_STORY" : "JOB"}
            />}

            {!isSuccessStories && (
                <DraggableBox className="profile-subnav" style={{
                    display: 'flex', gap: '32px', marginBottom: '24px',
                    borderBottom: '1px solid var(--gray-200)', padding: '0 8px'
                }}>
                    {[
                        { id: 'feed', label: 'Social Feed', icon: '📰' },
                        { id: 'jobs', label: 'Career Board', icon: '💼' }
                    ].map(t => (
                        <motion.button
                            key={t.id}
                            onClick={() => setSubTab(t.id)}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '14px 4px', border: 'none', background: 'none',
                                cursor: 'pointer', fontWeight: subTab === t.id ? '700' : '500',
                                color: subTab === t.id ? 'var(--indigo)' : 'var(--gray-500)',
                                borderBottom: subTab === t.id ? '3px solid var(--indigo)' : '3px solid transparent',
                                fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s, border-color 0.2s',
                                position: 'relative',
                                zIndex: 2
                            }}
                        >
                            <span>{t.icon}</span>
                            {t.label}
                        </motion.button>
                    ))}
                </DraggableBox>
            )}

            {subTab === "jobs" && !isSuccessStories ? (
                <JobPortal />
            ) : (
                <>
                    <div className="create-row" style={{ marginTop: '20px' }}>
                        <div>
                            <h3 className="section-title">{title}</h3>
                            <p className="section-subtitle">{subtitle}</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setModal(true)}>
                            {isSuccessStories ? "＋ Post Story" : "＋ Create Post"}
                        </button>
                    </div>


            {/* Stats for community - only show in main feed */}
            {!isSuccessStories && (
                <div className="stats-grid stats-grid-4">
                    {["JOB", "REFERRAL", "MENTORSHIP", "WEBINAR"].map(t => {
                        const c = communityPosts.filter(p => p.postType === t).length;
                        const m = POST_TYPE_META[t];
                        return (
                            <div key={t} className="stat-card blue stat-card-sm">
                                <div className="stat-icon-sm">{m.icon}</div>
                                <div className="stat-num stat-num-sm">{c}</div>
                                <div className="stat-lbl">{m.label}s</div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!isSuccessStories && (
                <DraggableBox className="chips">
                    {activeFilters.map(f => (
                        <button key={f} className={`chip${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
                            {f === "ALL" ? "All Types" : `${POST_TYPE_META[f].icon} ${POST_TYPE_META[f].label}`}
                        </button>
                    ))}
                </DraggableBox>
            )}

            {visible.length === 0
                ? <div className="empty">
                    <div className="empty-icon">{isSuccessStories ? "🏆" : "🔍"}</div>
                    <div className="empty-msg">No {isSuccessStories ? "stories" : "posts"} yet</div>
                    <div className="empty-sub">
                        {isSuccessStories ? "Have a milestone to share? Post your story!" : "Be the first — share an update!"}
                    </div>
                </div>
                : <div className="posts-list">{visible.map(p => <PostCard key={p.id} p={p} showActions={false} />)}</div>
            }
                </>
            )}
        </div>
    );
}



export function AlumniCard({ user }) {
    const { sentConnections, connections, sendConnectionRequest, currentUser, setTab, assignAdmin } = useApp();
    const [expanded, setExpanded] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showAssignAdmin, setShowAssignAdmin] = useState(false);
    const [assignDept, setAssignDept] = useState("Alumni Office");
    const bioShort = user.bio && user.bio.length > 110 ? user.bio.slice(0, 110) + "…" : user.bio;

    // Determine connection status
    const sentReq = sentConnections.find(c => c.receiver?.id === user.id);
    const receivedReq = connections.find(c => c.sender?.id === user.id);
    const isConnected =
        (sentReq && sentReq.status === "ACCEPTED") ||
        (receivedReq && receivedReq.status === "ACCEPTED") ||
        user.id === currentUser?.id ||
        currentUser?.role === "ROLE_SUPER_ADMIN" ||
        currentUser?.role === "ROLE_ADMIN";
    const isPending = sentReq && sentReq.status === "PENDING";

    function ConnectBtn() {
        if (isConnected) return (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                <button className="btn btn-green btn-sm flex-1" disabled style={{ opacity: 0.8 }}>
                    ✓ Connected
                </button>
                <button className="btn btn-outline btn-sm flex-1" onClick={() => setTab("messages")}>
                    💬 Chat
                </button>
                <a href={`mailto:${user.email}`} className="btn btn-outline btn-sm flex-1" title={`Send email to ${user.name}`}>
                    ✉️ Mail
                </a>
            </div>
        );
        if (isPending) return (
            <button className="btn btn-outline btn-sm flex-1" disabled style={{ opacity: 0.7 }}>
                ⏳ Pending
            </button>
        );
        return (
            <button className="btn btn-primary btn-sm flex-1" onClick={() => sendConnectionRequest(user.id)}>
                + Connect
            </button>
        );
    }

    return (
        <>
            {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
            <div className="alumni-card">
                <div className="card-header">
                    <AvatarImg user={user} className="avatar avatar-lg" onClick={() => setShowProfile(true)} title="View full profile" />
                    <div className="flex-1">
                        <button className="card-name-link" onClick={() => setShowProfile(true)}>{user.name}</button>
                        <div className="card-meta">{user.designation || "Alumni"} {user.company ? `· ${user.company}` : ""}</div>
                        <div className="card-batch-row"><span className="batch-badge">Batch {user.batch}</span></div>
                    </div>
                </div>
                {user.bio && (
                    <div className="bio-box bio-box-mb">
                        {expanded ? user.bio : bioShort}
                        {user.bio.length > 110 && (
                            <button className="btn btn-ghost btn-sm bio-btn-inline" onClick={() => setExpanded(x => !x)}>
                                {expanded ? " less" : " more"}
                            </button>
                        )}
                    </div>
                )}
                {user.location && <div className="card-location">📍 {user.location}</div>}
                {user.techStack && (
                    <div className="tags">
                        {user.techStack.split(",").map(t => <span key={t} className="tag">{t.trim()}</span>)}
                    </div>
                )}
                <div className="card-actions">
                    <button className="btn btn-outline btn-sm flex-1" onClick={() => setShowProfile(true)}>👤 View Profile</button>
                    <ConnectBtn />
                    {user.linkedinUrl && (
                        <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">LinkedIn ↗</a>
                    )}

                    {currentUser?.role === "ROLE_SUPER_ADMIN" && (
                        <button
                            className={`btn btn-sm ${showAssignAdmin ? 'btn-outline' : 'btn-primary'}`}
                            onClick={(e) => { e.stopPropagation(); setShowAssignAdmin(!showAssignAdmin); }}
                        >
                            {showAssignAdmin ? "✕ Cancel" : "🛡️ Assign Admin"}
                        </button>
                    )}
                </div>

                {showAssignAdmin && (
                    <div style={{
                        marginTop: '12px', padding: '12px', background: 'var(--gray-50)',
                        borderRadius: '8px', border: '1px solid var(--gray-200)'
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--gray-700)' }}>
                            Choose Department for {user.name}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="inp"
                                style={{ flex: 1, padding: '4px 8px', fontSize: '13px', height: '34px' }}
                                value={assignDept}
                                onChange={e => setAssignDept(e.target.value)}
                            >
                                <option>Alumni Office</option>
                                <option>Accounts & Finance</option>
                                <option>CSE Dept</option>
                                <option>IT Dept</option>
                                <option>ECE Dept</option>
                                <option>Mechanical Dept</option>
                                <option>Civil Dept</option>
                                <option>Training & Placement</option>
                            </select>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const ok = await assignAdmin(user.id, assignDept);
                                    if (ok) setShowAssignAdmin(false);
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}


// ─── Profile Modal ──────────────────────────────────────────
export function ProfileModal({ user, onClose }) {
    const { sentConnections, connections, currentUser } = useApp();

    useEffect(() => {
        function onKey(e) { if (e.key === "Escape") onClose(); }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Determine connection status
    const sentReq = sentConnections.find(c => c.receiver?.id === user.id);
    const receivedReq = connections.find(c => c.sender?.id === user.id);
    const isConnected =
        (sentReq && sentReq.status === "ACCEPTED") ||
        (receivedReq && receivedReq.status === "ACCEPTED") ||
        user.id === currentUser?.id ||
        currentUser?.role === "ROLE_SUPER_ADMIN" ||
        currentUser?.role === "ROLE_ADMIN";

    const displayEmail = isConnected ? user.email : "Connect to view email";

    return (
        <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-lg" style={{ position: "relative" }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: "12px", right: "12px",
                        background: "var(--gray-100)", border: "none",
                        borderRadius: "50%", width: "32px", height: "32px",
                        fontSize: "18px", cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "var(--gray-600)", lineHeight: 1, zIndex: 10
                    }}
                    title="Close"
                >✕</button>
                <div className="card-header">
                    <AvatarImg user={user} className="avatar avatar-xl" />
                    <div>
                        <h2 className="profile-name">{user.name}</h2>
                        <div className="profile-sub">{user.designation} {user.company && `at ${user.company}`}</div>
                        <div className="card-batch-row"><span className="batch-badge">Batch {user.batch}</span></div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            {user.linkedinUrl && <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">LinkedIn ↗</a>}
                            {isConnected && (
                                <a href={`mailto:${user.email}`} className="btn btn-primary btn-sm">
                                    ✉️ Direct Mail
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                {user.bio && <div className="bio-box bio-box-mb">💬 {user.bio}</div>}
                <div className="prof-grid">
                    {[{ k: "Email", v: displayEmail }, { k: "Batch", v: user.batch }, { k: "Degree", v: user.degree }, { k: "Company", v: user.company }, { k: "Location", v: user.location }]
                        .filter(f => f.v).map(f => (
                            <div key={f.k} className="prof-field">
                                <div className="prof-fkey">{f.k}</div>
                                <div className="prof-fval" style={f.k === "Email" && !isConnected ? { fontStyle: 'italic', color: 'var(--gray-500)', fontSize: '13px' } : {}}>{f.v}</div>
                            </div>
                        ))}
                    {user.techStack && (
                        <div className="prof-field full-span">
                            <div className="prof-fkey">Tech Stack</div>
                            <div className="tags tags-mt">
                                {user.techStack.split(",").map(t => <span key={t} className="tag">{t.trim()}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── My Career Opportunities (Jobs & Referrals) ──────────────
function MyCareerOpportunities() {
    const { posts, currentUser, fetchPosts } = useApp();
    const [modal, setModal] = useState(false);
    const [modalType, setModalType] = useState("JOB");
    const [editPost, setEditPost] = useState(null);
    const [filter, setFilter] = useState("ALL");
    useEffect(() => { fetchPosts(); }, []);

    const myJobs = posts.filter(p => p.user?.id === currentUser?.id && (p.postType === "JOB" || p.postType === "REFERRAL"));
    const visible = filter === "ALL" ? myJobs : myJobs.filter(p => p.postType === filter);

    return (
        <div className="profile-card" style={{ marginTop: "20px" }}>
            {modal && <NewPostModal onClose={() => setModal(false)} defaultType={modalType} lockType={true} />}
            {editPost && <NewPostModal initialData={editPost} onClose={() => setEditPost(null)} lockType={true} />}
            <div className="create-row">
                <div style={{ flex: 1 }}>
                    <h3 className="section-title">� Career Opportunities</h3>
                    <p className="section-subtitle">Manage shared job roles and referrals</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => { setModalType("JOB"); setModal(true); }}>＋ New Opening</button>
            </div>
            <div className="chips" style={{ margin: "12px 0" }}>
                {["ALL", "JOB", "REFERRAL"].map(f => (
                    <button key={f} className={`chip${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
                        {f === "ALL" ? "All" : `${POST_TYPE_META[f].icon} ${POST_TYPE_META[f].label}`}
                    </button>
                ))}
            </div>
            {visible.length === 0
                ? <div className="empty" style={{ padding: "20px 0" }}><div className="empty-icon">📂</div><div className="empty-msg">No job posts yet</div></div>
                : <div className="posts-list">{visible.map(p => <PostCard key={p.id} p={p} showActions onEdit={setEditPost} />)}</div>
            }
        </div>
    );
}

// ─── My Professional Services (Mentorship & Webinars) ─────────
function MyProfessionalServices() {
    const { posts, currentUser, fetchPosts } = useApp();
    const [modal, setModal] = useState(false);
    const [modalType, setModalType] = useState("MENTORSHIP");
    const [editPost, setEditPost] = useState(null);
    const [filter, setFilter] = useState("ALL");
    useEffect(() => { fetchPosts(); }, []);

    const myServices = posts.filter(p => p.user?.id === currentUser?.id && (p.postType === "MENTORSHIP" || p.postType === "WEBINAR"));
    const visible = filter === "ALL" ? myServices : myServices.filter(p => p.postType === filter);

    return (
        <div className="profile-card" style={{ marginTop: "24px", background: "linear-gradient(to bottom right, #ffffff, #fcfdff)" }}>
            {modal && <NewPostModal onClose={() => setModal(false)} defaultType={modalType} lockType={true} />}
            {editPost && <NewPostModal initialData={editPost} onClose={() => setEditPost(null)} lockType={true} />}
            <div className="create-row">
                <div style={{ flex: 1 }}>
                    <h3 className="section-title">🎓 Professional Services</h3>
                    <p className="section-subtitle">Manage your mentorship sessions and community webinars</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => { setModalType("MENTORSHIP"); setModal(true); }}>🤝 Offer Mentorship</button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setModalType("WEBINAR"); setModal(true); }}>🎬 Host Webinar</button>
                </div>
            </div>

            <div className="chips" style={{ margin: "12px 0" }}>
                {["ALL", "MENTORSHIP", "WEBINAR"].map(f => (
                    <button key={f} className={`chip${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
                        {f === "ALL" ? "All Services" : `${POST_TYPE_META[f].icon} ${POST_TYPE_META[f].label}`}
                    </button>
                ))}
            </div>

            {visible.length === 0
                ? <div className="empty" style={{ padding: "40px 0" }}>
                    <div className="empty-icon">🌟</div>
                    <div className="empty-msg">No services offered yet</div>
                    <div className="empty-sub">Start by offering mentorship or hosting a webinar to help the community.</div>
                </div>
                : <div className="posts-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                    {visible.map(p => <PostCard key={p.id} p={p} showActions onEdit={setEditPost} />)}
                </div>
            }
        </div>
    );
}

// ─── My Connections ─────────────────────────────────────────
function MyConnections() {
    const { connections, sentConnections, currentUser } = useApp();
    
    const acceptedConnections = [
        ...connections.filter(c => c.status === "ACCEPTED").map(c => c.sender),
        ...sentConnections.filter(c => c.status === "ACCEPTED").map(c => c.receiver)
    ].filter(u => u && u.id !== currentUser?.id);

    return (
        <div className="profile-card" style={{ marginTop: "20px" }}>
            <h3 className="section-title">👥 My Connections</h3>
            <p className="section-subtitle">Alumni you are currently connected with</p>
            
            {acceptedConnections.length === 0 ? (
                <div className="empty" style={{ padding: "40px 0" }}>
                    <div className="empty-icon">🤝</div>
                    <div className="empty-msg">No connections yet</div>
                    <div className="empty-sub">Explore the Alumni Directory to find and connect with peers.</div>
                </div>
            ) : (
                <div className="alumni-grid" style={{ marginTop: '20px' }}>
                    {acceptedConnections.map(u => <AlumniCard key={u.id} user={u} />)}
                </div>
            )}
        </div>
    );
}

// ─── My Profile ─────────────────────────────────────────────
function Profile() {
    const { currentUser, updateProfile, changePassword, notify, confirm, myNotifications = [] } = useApp();
    const user = currentUser;
    const [editing, setEditing] = useState(false);
    const [subTab, setSubTab] = useState("overview");

    const unreadNotifs = myNotifications.filter(n => !n.read && n.type !== "NEW_MESSAGE").length;
    const unreadMsgs = myNotifications.filter(n => !n.read && n.type === "NEW_MESSAGE").length;
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        name: user.name || "",
        company: user.company || "",
        designation: user.designation || "",
        location: user.location || "",
        techStack: user.techStack || "",
        linkedinUrl: user.linkedinUrl || "",
        bio: user.bio || "",
        department: user.department || "",
        profileImage: user.profileImage || "",
    });

    const [pwdForm, setPwdForm] = useState({ old: "", new: "", confirm: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    function change(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

    async function save(e) {
        e.preventDefault();
        if (!form.name.trim()) return;
        await updateProfile({ ...form });
        setEditing(false);
    }

    async function handlePwdChange(e) {
        e.preventDefault();
        if (pwdForm.new !== pwdForm.confirm) return notify("Passwords do not match.", "err");
        if (pwdForm.new.length < 6) return notify("Password must be at least 6 characters.", "err");
        const success = await changePassword(pwdForm.old, pwdForm.new);
        if (success) {
            setPwdForm({ old: "", new: "", confirm: "" });
            setShowPwd(false);
        }
    }

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1024 * 1024) { // 1MB limit for demo
            notify("Image too large. Please select an image under 1MB.", "err");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            setForm(f => ({ ...f, profileImage: base64 }));
            await updateProfile({ ...form, profileImage: base64 });
        };
        reader.readAsDataURL(file);
    }

    const handleRemoveImage = async () => {
        if (await confirm("Remove Photo?", "Clear your current profile picture?")) {
            setForm(f => ({ ...f, profileImage: null }));
            await updateProfile({ ...form, profileImage: null });
        }
    }

    function cancel() {
        setForm({
            name: user.name || "", company: user.company || "", designation: user.designation || "",
            location: user.location || "", techStack: user.techStack || "",
            linkedinUrl: user.linkedinUrl || "", bio: user.bio || "",
            profileImage: user.profileImage || "",
        });
        setEditing(false);
        setShowPwd(false);
    }

    if (!editing) {
        const FIELDS = [
            { k: "Email", v: user.email }, { k: "Degree", v: user.degree },
            { k: "Batch", v: user.batch }, { k: "Company", v: user.company },
            { k: "Designation", v: user.designation }, { k: "Location", v: user.location },
        ];

        return (
            <div className="profile-page-container">

                <DraggableBox className="profile-subnav" style={{
                    display: 'flex', gap: '32px', marginBottom: '24px',
                    borderBottom: '1px solid var(--gray-200)', padding: '0 8px'
                }}>
                    {[
                        { id: 'overview', label: 'Overview', icon: '👤' },
                        { id: 'messages', label: 'Messages', icon: '💬', badge: unreadMsgs },
                        { id: 'notifications', label: 'Notifications', icon: '🔔', badge: unreadNotifs },
                        { id: 'connections', label: 'Connections', icon: '👥' },
                        { id: 'feedback', label: 'Feedback', icon: '💬' }
                    ].map(t => (
                        <motion.button
                            key={t.id}
                            onClick={() => { setSubTab(t.id); setEditing(false); }}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '14px 4px', border: 'none', background: 'none',
                                cursor: 'pointer', fontWeight: subTab === t.id ? '700' : '500',
                                color: subTab === t.id ? 'var(--indigo)' : 'var(--gray-500)',
                                borderBottom: subTab === t.id ? '3px solid var(--indigo)' : '3px solid transparent',
                                fontSize: '14px', whiteSpace: 'nowrap', transition: 'color 0.2s, border-color 0.2s',
                                position: 'relative',
                                zIndex: 2
                            }}
                        >
                            <span>{t.icon}</span>
                            {t.label}
                            {t.badge > 0 && (
                                <span style={{
                                    background: 'var(--red-500)', color: 'white', fontSize: '10px',
                                    padding: '2px 6px', borderRadius: '10px', marginLeft: '4px'
                                }}>{t.badge}</span>
                            )}
                        </motion.button>
                    ))}
                </DraggableBox>

                {subTab === "messages" && <ChatView />}
                {subTab === "notifications" && <NotificationsView />}
                {subTab === "connections" && <MyConnections />}
                {subTab === "feedback" && <FeedbackView />}

                {subTab === "overview" && (
                    <div className="profile-view-layout">
                        <div className="profile-view-main">
                            <div className="profile-card">
                                <div className="profile-top">
                                    <div className="avatar-wrap">
                                        <AvatarImg user={user} className="avatar avatar-lg" />
                                        <div className="avatar-edit-overlay">
                                            <button className="avatar-edit-btn" onClick={() => fileInputRef.current?.click()} title="Upload New Photo">📷</button>
                                            {(user.profileImage || user.avatar) && (
                                                <button className="avatar-del-btn" onClick={handleRemoveImage} title="Remove Photo">🗑</button>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            style={{ display: "none" }}
                                        />
                                    </div>
                                    <div className="profile-info">
                                        <h2 className="profile-name">{user.name}</h2>
                                        <div className="profile-sub">{user.designation} {user.company && `at ${user.company}`}</div>
                                        <div className="card-batch-row"><span className="batch-badge">Batch {user.batch}</span></div>
                                    </div>
                                    <div className="header-btns">
                                        {user.linkedinUrl && <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">LinkedIn ↗</a>}
                                        <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                                    </div>
                                </div>

                                {user.bio && <div className="bio-box bio-box-mv">💬 {user.bio}</div>}

                                <div className="prof-grid">
                                    {FIELDS.map(f => f.v && (
                                        <div key={f.k} className="prof-field">
                                            <div className="prof-fkey">{f.k}</div>
                                            <div className="prof-fval">{f.v}</div>
                                        </div>
                                    ))}
                                    {user.techStack && (
                                        <div className="prof-field full-span">
                                            <div className="prof-fkey">Tech Stack</div>
                                            <div className="tags tags-mt">
                                                {user.techStack.split(",").map(t => <span key={t} className="tag">{t.trim()}</span>) || "None"}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <MyProfessionalServices />

                            <div style={{ marginTop: '32px' }}>
                                <h3 className="section-title">📈 Mentorship Dashboard</h3>
                                <p className="section-subtitle">Requests you've received from students and peers</p>
                                <MentorshipManager />
                            </div>

                            <div style={{ marginTop: '32px' }}>
                                <h3 className="section-title">💼 Career Requests Dashboard</h3>
                                <p className="section-subtitle">Applications and referral requests for your job posts</p>
                                <CareerManager />
                            </div>
                        </div>

                        <div className="profile-view-side">
                            <MyCareerOpportunities />
                            <div style={{ marginTop: '24px' }}>
                                <Feed isSuccessStories={true} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="profile-card">
            <div className="edit-header-row">
                <h2 className="edit-title">Edit Career Profile</h2>
                <button className="btn btn-ghost btn-sm" onClick={cancel}>✕ Cancel</button>
            </div>

            <form onSubmit={save} style={{ marginBottom: "20px" }}>
                <div className="reg-grid">
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input className="inp" value={form.name} onChange={change("name")} required />
                    </div>
                    <div className="form-group">
                        <label>Designation</label>
                        <input className="inp" value={form.designation} onChange={change("designation")} placeholder="e.g. SDE II" />
                    </div>
                    <div className="form-group">
                        <label>Company</label>
                        <input className="inp" value={form.company} onChange={change("company")} placeholder="e.g. Google" />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input className="inp" value={form.location} onChange={change("location")} placeholder="e.g. Guwahati" />
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>Department / Branch *</label>
                    <select className="inp" value={form.department} onChange={change("department")} required>
                        <option value="">Select Department</option>
                        <option value="Civil Dept">Civil Dept</option>
                        <option value="Chemical Dept">Chemical Dept</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="reg-grid">
                    <div className="form-group full">
                        <label>Tech Stack <span className="tech-label">(comma-separated)</span></label>
                        <input className="inp" value={form.techStack} onChange={change("techStack")} placeholder="e.g. React, Node.js, AWS" />
                    </div>
                    <div className="form-group full">
                        <label>LinkedIn URL</label>
                        <input className="inp" type="url" value={form.linkedinUrl} onChange={change("linkedinUrl")} placeholder="https://linkedin.com/in/yourprofile" />
                    </div>
                    <div className="form-group full">
                        <label>Bio</label>
                        <textarea className="inp" value={form.bio} onChange={change("bio")} rows={4} placeholder="Tell us about your professional journey…" />
                    </div>
                </div>

                <div className="save-btns">
                    <button type="button" className="btn btn-outline" onClick={cancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary flex-1">💾 Save Changes</button>
                </div>
            </form>

            <div className="divider" style={{ margin: "32px 0" }}></div>

            <div className="change-pwd-section">
                {!showPwd ? (
                    <button className="btn btn-outline btn-full" onClick={() => setShowPwd(true)}>🔑 Change Account Password</button>
                ) : (
                    <div className="pwd-form-wrap">
                        <h3 className="section-title" style={{ marginBottom: "16px", fontSize: "16px" }}>Update Password</h3>
                        <form onSubmit={handlePwdChange}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showOld ? "text" : "password"}
                                        className="inp"
                                        placeholder="Enter old password"
                                        value={pwdForm.old}
                                        onChange={e => setPwdForm({ ...pwdForm, old: e.target.value })}
                                        required
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowOld(!showOld)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                                    >
                                        {showOld ? "👁️" : "🙈"}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showNew ? "text" : "password"}
                                        className="inp"
                                        placeholder="Min. 6 characters"
                                        value={pwdForm.new}
                                        onChange={e => setPwdForm({ ...pwdForm, new: e.target.value })}
                                        required
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowNew(!showNew)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                                    >
                                        {showNew ? "👁️" : "🙈"}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        className="inp"
                                        placeholder="Repeat new password"
                                        value={pwdForm.confirm}
                                        onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                                        required
                                        style={{ paddingRight: '40px' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                                    >
                                        {showConfirm ? "👁️" : "🙈"}
                                    </button>
                                </div>
                            </div>
                            <div className="save-btns" style={{ marginTop: "16px" }}>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPwd(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm">Update Password</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export { Feed, Profile };
