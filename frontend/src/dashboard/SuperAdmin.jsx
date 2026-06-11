import { useState, useEffect } from "react";
import { useApp, DEPARTMENTS } from "../context/AppContext";
import AvatarImg from "../components/AvatarImg";
import styles from "./dashboard.module.css";

export function ManageAdmins() {
    const { admins, fetchAdmins, revokeAdminAccess, promoteAdmin, assignAdmin, fetchAlumniOnly, updateAdminDepartment, currentUser, confirm, notify, approve, reject, deleteUser } = useApp();
    const [alumniList, setAlumniList] = useState([]);
    const [selectedAlumnusId, setSelectedAlumnusId] = useState("");
    const [selectedAdminId, setSelectedAdminId] = useState("");
    const [department, setDepartment] = useState("Alumni Office");
    const [targetRole, setTargetRole] = useState("ROLE_ADMIN"); // "ROLE_ADMIN" or "ROLE_SUPER_ADMIN"
    const [searchQuery, setSearchQuery] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editDepartment, setEditDepartment] = useState("");

    const handleEditClick = (u) => {
        setEditingId(u.id);
        setEditDepartment(u.department || "Alumni Office");
    };

    const handleSaveEdit = async (id) => {
        await updateAdminDepartment(id, editDepartment);
        setEditingId(null);
    };

    useEffect(() => {
        const load = async () => {
            const list = await fetchAlumniOnly();
            setAlumniList(list);
        };
        load();
        fetchAdmins();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();

        let ok = false;
        if (targetRole === "ROLE_SUPER_ADMIN") {
            if (!selectedAdminId) return notify("Select a Department Admin first", "err");
            ok = await promoteAdmin(selectedAdminId);
        } else {
            if (!selectedAlumnusId) return notify("Select an Alumnus first", "err");
            ok = await assignAdmin(selectedAlumnusId, department);
        }

        if (ok) {
            setSelectedAlumnusId("");
            setSelectedAdminId("");
            setSearchQuery("");
            // Refresh potential alumni list
            const list = await fetchAlumniOnly();
            setAlumniList(list);
        }
    };

    const filteredAlumni = alumniList.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const deptAdmins = admins.filter(u => u.role === "ROLE_ADMIN");
    const superAdminsCount = admins.filter(u => u.role === "ROLE_SUPER_ADMIN").length;

    return (
        <div className={styles.maContainer}>
            <div className={styles.maGrid}>
                {/* Left: Form Card */}
                <div className={styles.maFormPanel}>
                    <div className={styles.maCard}>
                        <div className={styles.maCardTab}>Assign Administrator</div>
                        <h3 className={styles.maCardTitle}>Promote User</h3>
                        <p className={styles.maCardSub}>Assign an Admin role or promote a Department Admin to Super Admin</p>

                        <form onSubmit={handleAssign} className={styles.maForm}>
                            <div className={styles.profileSubnav} style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                <button
                                    type="button"
                                    className={`${styles.subnavBtn} ${targetRole === 'ROLE_ADMIN' ? styles.active : ''}`}
                                    onClick={() => { setTargetRole('ROLE_ADMIN'); setSelectedAlumnusId(""); setSelectedAdminId(""); }}
                                >
                                    💼 Department Admin
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.subnavBtn} ${targetRole === 'ROLE_SUPER_ADMIN' ? styles.active : ''}`}
                                    onClick={() => { setTargetRole('ROLE_SUPER_ADMIN'); setSelectedAlumnusId(""); setSelectedAdminId(""); }}
                                >
                                    🛡️ Super Admin
                                </button>
                            </div>

                            {targetRole === "ROLE_ADMIN" ? (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Search Alumnus</label>
                                        <input
                                            className="inp"
                                            type="text"
                                            placeholder="Filter by name or email…"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Select Alumnus Profile</label>
                                        <select
                                            className="inp"
                                            required
                                            value={selectedAlumnusId}
                                            onChange={e => setSelectedAlumnusId(e.target.value)}
                                        >
                                            <option value="">-- Choose Alumnus --</option>
                                            {filteredAlumni.map(a => (
                                                <option key={a.id} value={a.id}>
                                                    {a.name} ({a.email})
                                                </option>
                                            ))}
                                        </select>
                                        {alumniList.length === 0 && <p className={styles.maCardSub} style={{ color: 'var(--amber-500)', marginTop: '5px' }}>No available Alumni found.</p>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Assign Department</label>
                                        <select
                                            className="inp"
                                            value={department}
                                            onChange={e => setDepartment(e.target.value)}
                                        >
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-full mt-15" disabled={!selectedAlumnusId}>
                                        🛡️ Assign as Department Admin
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Select Department Admin</label>
                                        <select
                                            className="inp"
                                            required
                                            value={selectedAdminId}
                                            onChange={e => setSelectedAdminId(e.target.value)}
                                        >
                                            <option value="">-- Choose Department Admin --</option>
                                            {deptAdmins.map(adm => (
                                                <option key={adm.id} value={adm.id}>
                                                    {adm.name} ({adm.department || 'No department'})
                                                </option>
                                            ))}
                                        </select>
                                        {deptAdmins.length === 0 && <p className={styles.maCardSub} style={{ color: 'var(--amber-500)', marginTop: '5px' }}>No available Department Admins found.</p>}
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-full mt-15" disabled={!selectedAdminId}>
                                        🛡️ Assign as Super Admin
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right: Table Panel */}
                <div className={styles.maTablePanel}>
                    <div className={styles.maTableCard}>
                        <div className={styles.maTableHeader}>
                            <div>
                                <h3 className={styles.maTableTitle}>Active Administrators</h3>
                                <p className={styles.maTableSub}>Currently managing the portal</p>
                            </div>
                            <div className={styles.adminCount}>
                                {admins.length} Admins
                            </div>
                        </div>

                        <div className={styles.maListWrapper}>
                            {admins.map(u => (
                                <div key={u.id} className={styles.maListItem}>
                                    <div className={styles.maUserCell}>
                                        <AvatarImg user={u} className="avatar avatar-sm" />
                                        <div>
                                            <div className={styles.maUserName}>
                                                {u.name}
                                                {String(u.id) === String(currentUser?.id) && (
                                                    <span style={{ fontStyle: 'italic', fontWeight: 'normal', color: 'var(--gray-400)', marginLeft: '6px', fontSize: '12px' }}>
                                                        (You)
                                                    </span>
                                                )}
                                            </div>
                                            {editingId === u.id ? (
                                                <div style={{ marginTop: '5px' }}>
                                                    <select
                                                        className="inp"
                                                        style={{ padding: '6px', fontSize: '12px', minWidth: '160px' }}
                                                        value={editDepartment}
                                                        onChange={e => setEditDepartment(e.target.value)}
                                                    >
                                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className={styles.maUserRole}>
                                                    {u.role === 'ROLE_SUPER_ADMIN' ? 'System Super Admin' : (u.department || 'General Administrator')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.maActionWrapper}>
                                        {editingId === u.id ? (
                                            <>
                                                <button className="btn btn-green btn-sm" onClick={() => handleSaveEdit(u.id)}>💾 Save</button>
                                                <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                {u.role !== 'ROLE_SUPER_ADMIN' ? (
                                                    /* Hide actions if this is the currently logged-in department admin (safety guard) */
                                                    String(u.id) === String(currentUser?.id) ? null : (
                                                        <>
                                                            <button
                                                                className="btn btn-outline btn-sm"
                                                                onClick={() => handleEditClick(u)}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={async () => { if (await confirm("Promote to Super Admin?", `Are you sure you want to promote ${u.name}? This gives them full system control.`)) { await promoteAdmin(u.id); await fetchAdmins(); } }}
                                                            >
                                                                ⚡ Promote
                                                            </button>
                                                            {u.status === "APPROVED" ? (
                                                                <button
                                                                    className="btn btn-outline btn-sm"
                                                                    onClick={async () => { if (await confirm("Suspend Admin?", `Suspend administrator access for ${u.name}?`)) { await reject(u.id); await fetchAdmins(); } }}
                                                                >
                                                                    Suspend
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-green btn-sm"
                                                                    onClick={async () => { if (await confirm("Restore Admin?", `Restore administrator access for ${u.name}?`)) { await approve(u.id); await fetchAdmins(); } }}
                                                                >
                                                                    Restore
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-red btn-sm"
                                                                onClick={async () => { if (await confirm("Delete Admin Account?", `Permanently delete administrator account ${u.name}?`)) { await deleteUser(u.id); await fetchAdmins(); } }}
                                                            >
                                                                Delete
                                                            </button>
                                                            <button
                                                                className="btn btn-red btn-sm"
                                                                onClick={async () => { if (await confirm("Revoke Access?", `Revoke administrative access for ${u.name}? They will be demoted to Alumnus status.`)) { await revokeAdminAccess(u.id); await fetchAdmins(); } }}
                                                            >
                                                                Revoke
                                                            </button>
                                                        </>
                                                    )
                                                ) : (
                                                    /* Show actions for Super Admins, but disable them if this is the logged-in user and they are the ONLY Super Admin left */
                                                    <>
                                                        <button
                                                            className="btn btn-red btn-sm"
                                                            onClick={async () => { if (await confirm("Revoke Access?", `Revoke Super Admin access for ${u.name}? They will be demoted to Alumnus status.`)) { await revokeAdminAccess(u.id); await fetchAdmins(); } }}
                                                            disabled={String(u.id) === String(currentUser?.id) && superAdminsCount <= 1}
                                                            title={String(u.id) === String(currentUser?.id) && superAdminsCount <= 1 ? "Cannot revoke the only Super Admin" : "Revoke Super Admin access"}
                                                            style={String(u.id) === String(currentUser?.id) && superAdminsCount <= 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                        >
                                                            Revoke
                                                        </button>
                                                        <button
                                                            className="btn btn-red btn-sm"
                                                            onClick={async () => { if (await confirm("Delete Super Admin Account?", `Permanently delete Super Admin account ${u.name}?`)) { await deleteUser(u.id); await fetchAdmins(); } }}
                                                            disabled={String(u.id) === String(currentUser?.id) && superAdminsCount <= 1}
                                                            title={String(u.id) === String(currentUser?.id) && superAdminsCount <= 1 ? "Cannot delete the only Super Admin" : "Delete Super Admin account"}
                                                            style={String(u.id) === String(currentUser?.id) && superAdminsCount <= 1 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {admins.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                                    No administrative accounts found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
