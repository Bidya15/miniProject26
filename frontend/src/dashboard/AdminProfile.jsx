import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import AvatarImg from "../components/AvatarImg";
import NotificationsView from "../components/NotificationsView";
import { Pending, Export, DraggableBox } from "./Admin";
import d from "./dashboard.module.css";

export default function AdminProfile() {
    const { currentUser, updateProfile, changePassword, notify, pendingAlumni = [] } = useApp();
    const user = currentUser;
    const [editing, setEditing] = useState(false);
    const [subTab, setSubTab] = useState("overview");
    const { myNotifications = [] } = useApp();
    const unreadNotifs = myNotifications.filter(n => !n.read).length;
    const pendingCount = pendingAlumni.length;
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        profileImage: user.profileImage || "",
        department: user.department || "",
    });

    const [pwdForm, setPwdForm] = useState({ old: "", new: "", confirm: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    async function save(e) {
        e.preventDefault();
        if (!form.name.trim()) return;
        await updateProfile({ ...form });
        setEditing(false);
        notify("Administrative profile updated!", "ok");
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
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            setForm((f) => ({ ...f, profileImage: base64 }));
            await updateProfile({ ...form, profileImage: base64 });
        };
        reader.readAsDataURL(file);
    }

    if (!editing) {
        return (
            <div className={d.innerCard}>
                <DraggableBox className={d.profileSubnav}>
                    {[
                        { id: 'overview', label: 'Admin Profile', icon: '👤' },
                        { id: 'pending', label: 'Approve Alumni', icon: '⏳', badge: pendingCount },
                        { id: 'notifications', label: 'System Alerts', icon: '🔔', badge: unreadNotifs },
                        { id: 'export', label: 'Data Export', icon: '📤' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setSubTab(t.id); setEditing(false); }}
                            className={`${d.subnavBtn}${subTab === t.id ? ` ${d.active}` : ""}`}
                        >
                            <span>{t.icon}</span>
                            {t.label}
                            {t.badge > 0 && <span className={d.subnavBadge}>{t.badge}</span>}
                        </button>
                    ))}
                </DraggableBox>

                {subTab === "notifications" && <NotificationsView />}
                {subTab === "pending" && <Pending />}
                {subTab === "export" && <Export />}

                {subTab === "overview" && (
                    <>
                        <div className={d.dashHero} style={{ padding: '40px' }}>
                            <div className={d.avatarWrap}>
                                <AvatarImg user={user} size="xl" className={d.avatarLg} />
                                <div className={d.avatarBtnRow}>
                                    <button className={d.btnChangePhoto} onClick={() => fileInputRef.current?.click()}>📷 Change</button>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                            </div>
                            <div style={{ flex: 1, marginLeft: '20px' }}>
                                <h1 className={d.heroTitle}>{user.name}</h1>
                                <p className={d.heroSub}>{user.role?.replace("ROLE_", "").replace("_", " ")} {user.department ? `· ${user.department}` : ""}</p>
                                <div style={{ marginTop: '15px' }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                                </div>
                            </div>
                        </div>

                        <div className={d.dashContentGrid}>
                            <div className={d.contentBox}>
                                <div className={d.contentBoxTitle}>🛡️ Account Information</div>
                                <div className={d.formGrid}>
                                    <div className={d.formGroup}>
                                        <label className={d.label}>Display Name</label>
                                        <div className={d.inp} style={{ background: 'var(--gray-50)' }}>{user.name}</div>
                                    </div>
                                    <div className={d.formGroup}>
                                        <label className={d.label}>Email Address</label>
                                        <div className={d.inp} style={{ background: 'var(--gray-50)' }}>{user.email}</div>
                                    </div>
                                    <div className={d.formGroup}>
                                        <label className={d.label}>Administrative Unit</label>
                                        <div className={d.inp} style={{ background: 'var(--gray-50)' }}>{user.department || 'N/A'}</div>
                                    </div>
                                    <div className={d.formGroup}>
                                        <label className={d.label}>Access Level</label>
                                        <div className={d.inp} style={{ background: 'var(--gray-50)' }}>{user.role}</div>
                                    </div>
                                </div>

                                <div className={d.formGroup} style={{ marginTop: '20px' }}>
                                    <label className={d.label}>Administrative Bio / Status Message</label>
                                    <div className={d.inp} style={{ minHeight: '80px', background: 'var(--gray-50)' }}>{user.bio || 'No status set.'}</div>
                                </div>
                            </div>

                            <div className={d.contentBox}>
                                <div className={d.contentBoxTitle}>🔑 Security Settings</div>
                                <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '15px' }}>
                                    Manage your account credentials and security preferences.
                                </p>
                                {!showPwd ? (
                                    <button className="btn btn-outline w-full" onClick={() => setShowPwd(true)}>Change Password</button>
                                ) : (
                                    <form onSubmit={handlePwdChange}>
                                        <div className={d.formGroup}>
                                            <label className={d.label}>Current Password</label>
                                            <div className={d.inpWithIcon}>
                                                <input 
                                                    className={d.inp} 
                                                    type={showOld ? "text" : "password"} 
                                                    placeholder="Enter old password" 
                                                    value={pwdForm.old} 
                                                    onChange={e => setPwdForm({ ...pwdForm, old: e.target.value })} 
                                                    required 
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                <button 
                                                    type="button" 
                                                    className={d.inpIconBtn}
                                                    onClick={() => setShowOld(!showOld)}
                                                >
                                                    {showOld ? "👁️" : "🙈"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className={d.formGroup}>
                                            <label className={d.label}>New Password</label>
                                            <div className={d.inpWithIcon}>
                                                <input 
                                                    className={d.inp} 
                                                    type={showNew ? "text" : "password"} 
                                                    placeholder="Min. 6 characters" 
                                                    value={pwdForm.new} 
                                                    onChange={e => setPwdForm({ ...pwdForm, new: e.target.value })} 
                                                    required 
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                <button 
                                                    type="button" 
                                                    className={d.inpIconBtn}
                                                    onClick={() => setShowNew(!showNew)}
                                                >
                                                    {showNew ? "👁️" : "🙈"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className={d.formGroup}>
                                            <label className={d.label}>Confirm New Password</label>
                                            <div className={d.inpWithIcon}>
                                                <input 
                                                    className={d.inp} 
                                                    type={showConfirm ? "text" : "password"} 
                                                    placeholder="Repeat new password" 
                                                    value={pwdForm.confirm} 
                                                    onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })} 
                                                    required 
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                <button 
                                                    type="button" 
                                                    className={d.inpIconBtn}
                                                    onClick={() => setShowConfirm(!showConfirm)}
                                                >
                                                    {showConfirm ? "👁️" : "🙈"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-10" style={{ marginTop: '20px' }}>
                                            <button type="submit" className="btn btn-primary flex-1">Update Password</button>
                                            <button type="button" className="btn btn-ghost" onClick={() => setShowPwd(false)}>Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className={d.innerCard}>
            <div className={d.contentBox}>
                <div className={d.contentBoxTitle}>Edit Administrative Profile</div>
                <form onSubmit={save} className="flex-col gap-20">
                    <div className={d.formGrid}>
                        <div className={d.formGroup}>
                            <label className={d.label}>Full Name</label>
                            <input className={d.inp} value={form.name} onChange={change("name")} required />
                        </div>
                        <div className={d.formGroup}>
                            <label className={d.label}>Email Address</label>
                            <input className={d.inp} value={form.email} disabled style={{ opacity: 0.7 }} />
                        </div>
                        <div className={d.formGroup + " " + d.fullSpan}>
                            <label className={d.label}>Bio / Department Role</label>
                            <textarea className={d.inp} value={form.bio} onChange={change("bio")} rows={4} />
                        </div>
                    </div>
                    <div className="flex gap-10">
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                        <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
