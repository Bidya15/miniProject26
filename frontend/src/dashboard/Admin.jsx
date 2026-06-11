import React, { useState, useEffect } from "react";
import { useApp, DEPARTMENTS } from "../context/AppContext";
import { exportCSV, exportJSON } from "../utils/export";
import { timeAgo, initials, avatarColor, fmtDate, POST_TYPE_META } from "../utils/helpers";
import AvatarImg from "../components/AvatarImg";
import styles from "./dashboard.module.css";
import { useRef } from "react";

// ─── Draggable Box Wrapper ───────────────────
function DraggableBox({ children, className = "", style = {} }) {
    const scrollRef = useRef(null);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        setIsDown(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsDown(false);
    const handleMouseUp = () => setIsDown(false);

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; 
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div 
            className={`${className}`}
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ 
                cursor: isDown ? 'grabbing' : 'grab',
                userSelect: isDown ? 'none' : 'auto',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                ...style
            }}
        >
            {children}
        </div>
    );
}

// ─── Stat Card (New Glass Version) ─────────────
function GlassStat({ icon, num, label, type }) {
    return (
        <div className={`${styles.glassStatCard} ${styles[type + 'Stat']}`}>
            <div className={styles.glassStatHeader}>
                <div className={styles.glassStatIcon}>{icon}</div>
                <div className={styles.glassStatLabel}>{label}</div>
            </div>
            <div className={styles.glassStatNum}>{num}</div>
        </div>
    );
}

// ─── Overview ─────────────────────────
function Overview() {
    const {
        pendingAlumni, posts, currentUser,
        fetchPendingAlumni, fetchDashboardStats, dashboardStats,
        setTab, notify
    } = useApp();

    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN";

    useEffect(() => {
        fetchPendingAlumni();
        fetchDashboardStats();
    }, []);

    const pending = pendingAlumni.filter(u => {
        if (u.status !== "PENDING") return false;
        if (isSuper) return (u.role === "ROLE_ALUMNI" || u.role === "ROLE_ADMIN");
        // Dept Admin only sees alumni from their department
        return (u.role === "ROLE_ALUMNI" && u.department === currentUser?.department);
    });

    if (!dashboardStats) return <div className="loading-dots" style={{ padding: '40px' }}>Scanning system metrics...</div>;

    const recentRegistrations = dashboardStats.recentRegistrations || dashboardStats.recentUsers || [];

    return (
        <div className={styles.innerCard}>
            {/* Welcome Hero */}
            <div className={styles.dashHero}>
                <div>
                    <h1 className={styles.heroTitle}>Welcome back, {currentUser?.name.split(' ')[0]}! 👋</h1>
                    <p className={styles.heroSub}>
                        {isSuper 
                            ? "Global system oversight and administrative control hub." 
                            : `${currentUser?.department || 'Regional'} alumni management and engagement oversight.`}
                    </p>
                </div>
                <div className={styles.heroBadge}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '30px', fontSize: '12px', fontWeight: '700' }}>
                        📅 {fmtDate(new Date())}
                    </div>
                </div>
            </div>

            {/* Glass Statistics */}
            <div className={styles.glassGrid}>
                <GlassStat icon="👥" num={dashboardStats.totalUsers || 0} label="Total Network" type="indigo" />
                <GlassStat icon="✅" num={dashboardStats.verifiedAlumni || 0} label="Verified Alumni" type="emerald" />
                <GlassStat icon="⏳" num={dashboardStats.pendingAlumni || 0} label="Awaiting Review" type="amber" />
                <GlassStat icon="📝" num={dashboardStats.totalPosts || 0} label="Active Contributions" type="rose" />
                <GlassStat icon="📈" num={dashboardStats.monthlyActiveUsers || 0} label="Monthly Active Use" type="indigo" />
            </div>

            <div className={styles.dashContentGrid}>
                {/* Left Column: Needs Attention / Recent Activity */}
                <div className="flex-col gap-24">
                    {pending.length > 0 ? (
                        <div className={styles.contentBox}>
                            <div className={styles.contentBoxTitle}>
                                <span style={{ fontSize: '20px' }}>⏳</span> Needs Attention
                            </div>
                            <div className="pend-grid">
                                {pending.slice(0, 4).map(u => <PendCard key={u.id} u={u} />)}
                            </div>
                        </div>
                    ) : null}

                    <div className={styles.contentBox}>
                        <div className={styles.contentBoxTitle}>
                            <span style={{ fontSize: '20px' }}>🌟</span> Recent Registrations
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '14px' }}>
                            Latest sign-ups from the alumni network.
                        </div>
                        <div className="flex-col">
                            {recentRegistrations.map(u => (
                                <div key={u.id} className={styles.recentUserItem}>
                                    <AvatarImg user={u} className="avatar avatar-sm" />
                                    <div className={styles.recentUserInfo}>
                                        <div className={styles.recentUserName}>{u.name}</div>
                                        <div className={styles.recentUserSub}>{u.degree || "User"} · Class of {u.batch || "N/A"}</div>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                                        {timeAgo(u.createdAt)}
                                    </div>
                                </div>
                            ))}
                            {recentRegistrations.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '18px 8px', color: 'var(--gray-400)', fontSize: '13px' }}>
                                    No recent registrations yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Mini Stats / Locations */}
                <div className="flex-col gap-24">
                    <div className={styles.contentBox}>
                        <div className={styles.contentBoxTitle}>
                            <span style={{ fontSize: '20px' }}>📍</span> Global Hotspots
                        </div>
                        <div className={styles.locationList}>
                            {dashboardStats.topLocations?.map((loc) => (
                                <div key={loc.name} className={styles.locationItem}>
                                    <span>{loc.name}</span>
                                    <span className={styles.locationCount}>{loc.count} alumni</span>
                                </div>
                            ))}
                            {(!dashboardStats.topLocations || dashboardStats.topLocations.length === 0) && (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-400)', fontSize: '13px' }}>
                                    Location data will appear as alumni update profiles.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.contentBox}>
                        <div className={styles.contentBoxTitle}>
                            <span style={{ fontSize: '20px' }}>🚀</span> Quick Actions
                        </div>
                        <div className="flex-col gap-10">
                            <button className="btn btn-outline btn-sm w-full" onClick={() => setTab("export")}>📊 Generate Report</button>
                            <button className="btn btn-outline btn-sm w-full" onClick={() => setTab("email-campaign")}>📧 Email Campaign</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PendCard({ u }) {
    const { approve, reject, notify } = useApp();
    return (
        <div className="pend-card">
            <div className="card-user">
                <AvatarImg user={u} className="avatar avatar-md" />
                <div>
                    <div className="td-name">{u.name}</div>
                    <div className="td-sub">{u.degree} · Batch {u.batch}</div>
                </div>
            </div>
            <div className="user-meta">
                {u.company && <span>🏢 {u.company} · {u.designation}  </span>}
                {u.location && <span>📍 {u.location}</span>}
            </div>
            <div className="card-actions">
                <button className="btn btn-green btn-sm flex-1" onClick={() => approve(u.id)}>✓ Approve</button>
                <button className="btn btn-red   btn-sm flex-1" onClick={() => reject(u.id)}>✗ Reject</button>
            </div>
        </div>
    );
}

// ─── Pending ──────────────────────────
function Pending() {
    const { pendingAlumni, currentUser, fetchPendingAlumni, notify } = useApp();
    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN";

    useEffect(() => {
        fetchPendingAlumni();
    }, []);
    const pending = pendingAlumni.filter(u => u.status === "PENDING" && (u.role === "ROLE_ALUMNI" || (isSuper && u.role === "ROLE_ADMIN")));

    if (!pending.length) return (
        <div className="empty">
            <div className="empty-icon">🎉</div>
            <div className="empty-msg">No pending requests!</div>
        </div>
    );
    return (
        <div className="pend-grid">
            {pending.map(u => <PendCard key={u.id} u={u} />)}
        </div>
    );
}

// ─── Manage Alumni ────────────────────
function ManageAlumni() {
    const { users, approve, reject, deleteUser, currentUser, fetchPendingAlumni, fetchDirectory, updateUserDepartment, confirm, bulkRegisterAlumni } = useApp();
    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN";

    useEffect(() => {
        fetchDirectory();
        fetchPendingAlumni();
    }, [isSuper]);

    const [q, setQ] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [selectedDept, setSelectedDept] = useState("");
    const [showBulk, setShowBulk] = useState(false);

    const visibleUsers = users.filter(u => {
        // Super Admin sees everyone (Admin accounts + Alumni)
        if (isSuper) return u.role === "ROLE_ALUMNI" || u.role === "ROLE_ADMIN";
        
        // Dept Admin only sees what the backend returned (already filtered by branch)
        return u.role === "ROLE_ALUMNI";
    });

    const filtered = visibleUsers.filter(u =>
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase())
    );

    const toggleExpand = (u) => {
        if (expandedId === u.id) {
            setExpandedId(null);
            setSelectedDept("");
        } else {
            setExpandedId(u.id);
            setSelectedDept(u.department || "");
        }
    }

    const saveDept = async (id) => {
        if (!selectedDept) return;
        await updateUserDepartment(id, selectedDept);
        setExpandedId(null);
    };

    return (
        <>
            <div className="search-bar" style={{ display: 'flex', gap: '12px' }}>
                <input className="inp" style={{ flex: 1 }} placeholder="🔍 Search by name or email…" value={q} onChange={e => setQ(e.target.value)} />
                {isSuper && (
                    <button 
                        className="btn btn-primary" 
                        onClick={() => setShowBulk(true)}
                        style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span>📦 Bulk Import</span>
                    </button>
                )}
            </div>
            <DraggableBox className="table-wrap">
                <table>
                    <thead>
                        <tr><th>User</th><th className="hide-on-mobile">Role</th><th>Batch / Details</th><th className="hide-on-mobile">Company</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => (
                            <React.Fragment key={u.id}>
                                <tr 
                                    className={`clickable-tr ${expandedId === u.id ? 'is-expanded' : ''}`}
                                    onClick={() => toggleExpand(u)}
                                >
                                    <td>
                                        <div className="table-user">
                                            <AvatarImg user={u} className="avatar avatar-sm" />
                                            <div>
                                                <div className="td-name">{u.name}</div>
                                                <div className="td-sub">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hide-on-mobile">{u.role.replace("ROLE_", "")}</td>
                                    <td>{u.role === "ROLE_ALUMNI" ? u.batch : "Admin Account"}</td>
                                    <td className="hide-on-mobile">{u.company || <span className="dash">—</span>}</td>
                                    <td><span className={`status-pill ${u.status.toLowerCase()}`}>{u.status}</span></td>
                                    <td>
                                        <div className="td-actions" onClick={e => e.stopPropagation()}>
                                            {u.status === "PENDING" && <button className="btn btn-green   btn-sm" onClick={() => approve(u.id)}>✓ Approve</button>}
                                            {u.status === "APPROVED" && <button className="btn btn-outline btn-sm" onClick={() => reject(u.id)}>Suspend</button>}
                                            {u.status === "REJECTED" && <button className="btn btn-green   btn-sm" onClick={() => approve(u.id)}>Restore</button>}
                                            <button className="btn btn-red btn-sm" onClick={async () => { if (await confirm("Delete User?", `Permanently delete ${u.name}? This action cannot be undone.`)) deleteUser(u.id); }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === u.id && (
                                    <tr className="expand-tr">
                                    <td colSpan={6}>
                                            <div className="expand-content">
                                                <div className="expand-profile-grid">
                                                    <AvatarImg user={u} className="avatar avatar-xl" />
                                                    <div className="prof-detail-grid">
                                                        <div className="p-item">
                                                            <div className="p-label">Department / Branch</div>
                                                            {isSuper ? (
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <select 
                                                                        className="inp" 
                                                                        style={{ height: '34px', padding: '0 8px', fontSize: '13px' }}
                                                                        value={selectedDept}
                                                                        onChange={e => setSelectedDept(e.target.value)}
                                                                        onClick={e => e.stopPropagation()}
                                                                    >
                                                                        <option value="">Not Set</option>
                                                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                                    </select>
                                                                    <button 
                                                                        className="btn btn-primary btn-sm"
                                                                        onClick={(e) => { e.stopPropagation(); saveDept(u.id); }}
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="p-val">{u.department || 'Not Set'}</div>
                                                            )}
                                                            {!u.department && u.degree?.includes("CSE") && (
                                                                <div style={{ fontSize: '11px', color: 'var(--indigo)', marginTop: '4px' }}>
                                                                    💡 Suggested: <strong>CSE Dept</strong> (Matching degree)
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">Graduation Year</div>
                                                            <div className="p-val">{u.batch || 'N/A'}</div>
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">Designation</div>
                                                            <div className="p-val">{u.designation || 'Alumnus'}</div>
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">Location</div>
                                                            <div className="p-val">{u.location || 'Unknown'}</div>
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">Tech Stack</div>
                                                            <div className="p-val">{u.techStack || 'Not shared'}</div>
                                                        </div>
                                                        <div className="p-item">
                                                            <div className="p-label">LinkedIn Profile</div>
                                                            <div className="p-val">
                                                                {u.linkedinUrl ? (
                                                                    <a href={u.linkedinUrl} target="_blank" rel="noopener noreferrer" className="link" onClick={e => e.stopPropagation()}>View Profile ↗</a>
                                                                ) : 'Not provided'}
                                                            </div>
                                                        </div>
                                                        <div className="p-bio">
                                                            <div className="p-label" style={{ marginBottom: '8px' }}>About / Bio</div>
                                                            {u.bio || "This alumni hasn't added a bio yet."}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {!filtered.length && (
                            <tr><td colSpan={6} className="no-results">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </DraggableBox>

            {showBulk && <BulkImportModal onClose={() => setShowBulk(false)} onImport={bulkRegisterAlumni} />}
        </>
    );
}

function BulkImportModal({ onClose, onImport }) {
    const [jsonText, setJsonText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleImport = async () => {
        try {
            const data = JSON.parse(jsonText);
            if (!Array.isArray(data)) throw new Error("Input must be a JSON array of alumni objects.");
            
            // Basic validation
            const invalid = data.find(item => !item.name || !item.email);
            if (invalid) throw new Error("Each entry must at least have a 'name' and 'email'.");

            setLoading(true);
            const ok = await onImport(data);
            if (ok) onClose();
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
                <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>📦 Bulk Alumni Import</h3>
                    <button className="btn btn-sm btn-outline" onClick={onClose}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                    <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '15px', lineHeight: '1.5' }}>
                        Paste a JSON array of alumni details below. <br/>
                        Required fields: <code>name</code>, <code>email</code>. <br/>
                        Optional: <code>batch</code>, <code>degree</code>, <code>company</code>, <code>location</code>. <br/>
                        <span style={{ color: 'var(--indigo)' }}>Note: Accounts will be created as "APPROVED" with default password "Alumni@123".</span>
                    </p>
                    <textarea 
                        className="inp" 
                        style={{ height: '300px', fontFamily: 'monospace', fontSize: '12px', padding: '12px', background: 'var(--gray-50)' }}
                        placeholder='[
  {
    "name": "Siddharth Sarma",
    "email": "sid@aec.ac.in",
    "batch": 2018,
    "degree": "B.Tech CSE",
    "location": "Bangalore"
  }
]'
                        value={jsonText}
                        onChange={e => setJsonText(e.target.value)}
                    />
                </div>
                <div className={styles.modalFooter} style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleImport} disabled={loading || !jsonText.trim()}>
                        {loading ? '⚙️ Importing...' : '🚀 Start Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Manage Posts ─────────────────────
function ManagePosts() {
    const { posts, deletePost, fetchPosts, notify } = useApp();

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <DraggableBox className="table-wrap">
            <table>
                <thead>
                    <tr><th>Post</th><th className="hide-on-mobile">Type</th><th>Posted By</th><th className="hide-on-mobile">Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {posts.map(p => {
                        const meta = POST_TYPE_META[p.postType] || {};
                        return (
                            <tr key={p.id}>
                                <td className="post-cell">
                                    <div className="post-title">{p.title}</div>
                                    <div className="post-desc">{p.description}</div>
                                </td>
                                <td className="hide-on-mobile"><span className={`type-badge ${meta.cls}`}>{meta.icon} {meta.label}</span></td>
                                <td>{p.user?.name || p.alumniName || "AEC Alumni"}</td>
                                <td className="hide-on-mobile date-cell">{fmtDate(p.createdAt)}</td>
                                <td><button className="btn btn-red btn-sm" onClick={async () => { if (await confirm("Delete Post?", "Are you sure you want to remove this post from the feed?")) deletePost(p.id); }}>Delete</button></td>
                            </tr>
                        );
                    })}
                    {!posts.length && <tr><td colSpan={5} className="no-results">No posts yet.</td></tr>}
                </tbody>
            </table>
        </DraggableBox>
    );
}

// ─── Export ───────────────────────────
function Export() {
    const { users, posts, exportAlumni, currentUser, notify, setTab } = useApp();
    const [selectedDept, setSelectedDept] = useState("");
    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN";
    const isAdmin = currentUser?.role === "ROLE_ADMIN";

    const alumni = users.filter(u => {
        if (u.role !== "ROLE_ALUMNI") return false;
        if (isSuper) {
            if (!selectedDept) return true;
            return u.department === selectedDept;
        }
        // Dept Admin: case-insensitive match or match on department
        if (isAdmin) {
            if (!currentUser?.department) return false;
            return u.department?.toLowerCase() === currentUser.department.toLowerCase();
        }
        return false;
    });

    const alumniCount = alumni.length;

    if (!isSuper && !isAdmin) {
        return (
            <div className="empty">
                <div className="empty-icon">🔒</div>
                <div className="empty-msg">Access Restricted</div>
                <div className="empty-sub">Only Administrators can export data</div>
            </div>
        );
    }

    function exportPDF() {
        if (alumniCount === 0) {
            return notify(`No alumni records found to export for ${selectedDept || "all departments"}.`, "err");
        }
        const printWindow = window.open('', '_blank');
        if (!printWindow) return notify("Pop-up blocked. Please allow pop-ups for this site.", "err");
        
        const content = `
            <html>
                <head>
                    <title>Alumni Report - ${selectedDept || 'Institutional'}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; font-size: 11px; }
                        th { background-color: #f8fafc; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
                        tr:nth-child(even) { background-color: #fcfcfd; }
                        .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 10px; }
                        .stat-badge { background: #eef2ff; color: #4f46e5; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h1 style="margin:0; font-size: 26px; color: #1e1b4b; letter-spacing: -0.02em;">Alumni Directory Report</h1>
                            <p style="margin:6px 0 0; color: #64748b; font-size: 14px;">
                                ${selectedDept || currentUser?.department || 'Universal'} Network • <span class="stat-badge">${alumniCount} Verified Members</span>
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin:0; font-weight: bold; font-size: 12px; color: #64748b;">Report Date</p>
                            <p style="margin:0; font-size: 14px; font-weight: 600;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Email</th>
                                <th>Batch</th>
                                <th>Degree</th>
                                <th>Professional Status / Organization</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${alumni.map(u => `
                                <tr>
                                    <td><strong style="color: #1e293b;">${u.name}</strong></td>
                                    <td>${u.email}</td>
                                    <td>${u.batch}</td>
                                    <td>${u.degree}</td>
                                    <td>${u.company || u.status || 'Active Alumnus'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        This document is a confidential administrative export generated by ${currentUser.name} (${currentUser.role}).<br/>
                        © ${new Date().getFullYear()} Alumni Portal • Professional Network Management
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => { 
                                window.print(); 
                                window.onafterprint = () => window.close();
                            }, 800);
                        };
                    </script>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
    }

    const EXPORTS = [
        { 
            icon: "📊", 
            title: "Excel (XLSX)", 
            type: "Professional", 
            desc: `Full dataset for ${alumniCount} ${selectedDept || currentUser.department || 'Total'} Alumni`, 
            action: () => exportAlumni(isSuper ? selectedDept : null) 
        },
        { 
            icon: "📄", 
            title: "PDF Report", 
            type: "Visual", 
            desc: `Print-ready summary of ${alumniCount} ${selectedDept || 'selected'} members`, 
            action: () => exportPDF() 
        },
        { 
            icon: "👥", 
            title: "CSV Data", 
            type: "Lightweight", 
            desc: "Universal format for data migration and processing", 
            action: () => exportCSV(alumni.map(u => ({ name: u.name, email: u.email, batch: u.batch, degree: u.degree, company: u.company || "", location: u.location || "", status: u.status, department: u.department })), `alumni_${selectedDept || 'all'}_export`) 
        },
        { 
            icon: "📝", 
            title: "Posts History", 
            type: "Activity", 
            desc: `Export ${posts.length} mentorship and career opportunities`, 
            action: () => exportCSV(posts.map(p => ({ title: p.title, type: p.postType, author: p.alumniName, date: p.createdAt })), "posts_export") 
        },
    ];

    return (
        <div className="export-container">
            {isSuper && (
                <div className={styles.contentBox} style={{ marginBottom: '24px' }}>
                    <div className={styles.contentBoxTitle}>🎯 Filter by Department</div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Select Department to Export</label>
                        <select 
                            className={styles.inp} 
                            value={selectedDept} 
                            onChange={(e) => setSelectedDept(e.target.value)}
                        >
                            <option value="">All Departments (Overall)</option>
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '8px' }}>
                            {selectedDept ? `Currently targeting ${alumniCount} alumni in ${selectedDept}.` : `Currently exporting all ${alumniCount} verified alumni across the institution.`}
                        </p>
                    </div>
                </div>
            )}

            <div className="export-grid">
                {EXPORTS.map(x => (
                    <div key={x.title} className="export-card">
                        <div className="export-badge">{x.type}</div>
                        <div className="export-icon">{x.icon}</div>
                        <div className="export-title">{x.title}</div>
                        <div className="export-desc">{x.desc}</div>
                        <button className="btn btn-primary btn-sm" onClick={x.action} style={{ width: '100%', marginTop: '10px' }}>⬇ Download</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Manage Events ─────────────────────
function ManageEvents() {
    const { fetchEventRegistrations, eventRegistrations, deleteEventRegistration, notify, api } = useApp();
    const [localEvents, setLocalEvents] = useState([]);
    const [selEvent, setSelEvent] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get("/events");
                setLocalEvents(res.data);
            } catch (e) { notify("Failed to load events", "err"); }
        }
        load();
    }, []);

    const handleViewParticipants = (ev) => {
        setSelEvent(ev);
        fetchEventRegistrations(ev.id);
        setShowParticipants(true);
    };

    const activeEvents = localEvents.filter(e => new Date(e.eventDate) >= new Date()).length;

    return (
        <div className="events-hub">
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card purple">
                    <div className="stat-icon">📅</div>
                    <div className="stat-num">{localEvents.length}</div>
                    <div className="stat-lbl">Total Events</div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon">🚀</div>
                    <div className="stat-num">{activeEvents}</div>
                    <div className="stat-lbl">Active/Upcoming</div>
                </div>
                <div className="stat-card amber">
                    <div className="stat-icon">📝</div>
                    <div className="stat-num">{localEvents.reduce((acc, curr) => acc + (curr.registrationCount || 0), 0)}</div>
                    <div className="stat-lbl">Total Registrations</div>
                </div>
            </div>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr><th>Event Name</th><th>Date</th><th>Location</th><th>Registrations</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {localEvents.map(ev => (
                            <tr key={ev.id}>
                                <td>
                                    <div style={{ fontWeight: 800, color: 'var(--gray-900)' }}>{ev.title}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>ID: {ev.id}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{ev.eventDate}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{ev.eventTime || 'TBA'}</div>
                                </td>
                                <td>{ev.location}</td>
                                <td>
                                    <span className="badge" style={{ background: 'var(--indigo-l)', color: 'var(--indigo)' }}>
                                        {ev.registrationCount || 0} Registered
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-primary btn-sm" onClick={() => handleViewParticipants(ev)}>
                                        👥 Participants
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!localEvents.length && <tr><td colSpan={5} className="no-results">No events found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {showParticipants && selEvent && (
                <div className="modal-overlay" onClick={() => setShowParticipants(false)}>
                    <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Participants: {selEvent.title}</div>
                                <div className="modal-sub">{selEvent.registrationCount || 0} verified registrations</div>
                            </div>
                            <button className="close-btn" onClick={() => setShowParticipants(false)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '20px' }}>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr><th>Participant Name</th><th>Contact Details</th><th>Comments</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {eventRegistrations.map(r => (
                                            <tr key={r.id}>
                                                <td>
                                                    <div style={{ fontWeight: 700 }}>{r.firstName} {r.lastName}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '13px' }}>{r.email}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{r.phone}</div>
                                                </td>
                                                <td><div className="td-trunc" title={r.comments}>{r.comments || "—"}</div></td>
                                                <td>
                                                    <button className="btn btn-red btn-sm" onClick={async () => { if (await confirm("Remove Registration?", "Cancel this student's registration?")) deleteEventRegistration(r.id); }}>Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {!eventRegistrations.length && <tr><td colSpan={5} className="no-results">No participants registered yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AlumniCentral() {
    return (
        <div className={styles.hubGrid}>
            <div className={styles.hubSection}>
                <div className={styles.hubSectionTitle}>
                    <span>👥</span> Alumni Directory
                </div>
                <ManageAlumni />
            </div>
            <div className={styles.hubSection}>
                <div className={styles.hubSectionTitle}>
                    <span>📝</span> Alumni Posts
                </div>
                <ManagePosts />
            </div>
        </div>
    );
}

// Named exports – AppShell uses these for tab routing
export { Overview, Pending, ManageAlumni, ManagePosts, ManageEvents, Export, AlumniCentral, DraggableBox };
