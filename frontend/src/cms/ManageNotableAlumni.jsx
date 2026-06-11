import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import ImageUpload from "../components/ImageUpload";
import styles from "../dashboard/dashboard.module.css";

export default function ManageNotableAlumni() {
    const { notableAlumni, updateNotableAlumni, editNotableAlumni, removeNotableAlumni, notify } = useApp();
    const [modal, setModal] = useState(null); // 'add' | 'edit'
    const [editData, setEditData] = useState(null);

    function startEdit(item = null) {
        if (item) {
            setModal('edit');
            setEditData({ ...item });
        } else {
            setModal('add');
            setEditData({
                name: "",
                role: "",
                bio: "",
                avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a"
            });
        }
    }

    async function save() {
        if (!editData.name.trim()) return notify("Name is required", "err");

        if (modal === 'add') {
            // Strip any frontend-generated id — let the DB assign one
            const { id: _ignore, ...payload } = editData;
            await updateNotableAlumni(payload);
        } else {
            await editNotableAlumni(editData);
        }
        setModal(null);
    }

    async function handleDelete(id) {
        if (await confirm("Remove Highlight?", "Remove this alumnus from the distinguished showcase?")) {
            await removeNotableAlumni(id);
        }
    }

    return (
        <div className={styles.maContainer}>
            <div className={styles.createRow}>
                <div>
                    <h3 className={styles.maTableTitle}>Distinguished Alumni Showcase</h3>
                    <p className={styles.maTableSub}>Manage the profiles highlighted on the public home page</p>
                </div>
                <button className="btn btn-primary" onClick={() => startEdit()}>
                    ➕ Add Distinguished Alumnus
                </button>
            </div>

            <div className={styles.tableWrap}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Alumnus / Profile</th>
                            <th>Role / Designation</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notableAlumni.map(alumnus => (
                            <tr key={alumnus.id}>
                                <td>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={alumnus.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{alumnus.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--gray-500)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {alumnus.bio}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td><span style={{ fontSize: '13px', fontWeight: 500 }}>{alumnus.role}</span></td>
                                <td className="text-right">
                                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(alumnus)}>Edit</button>
                                    <button className="btn btn-ghost btn-sm text-red" onClick={() => remove(alumnus.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h3>{modal === 'add' ? 'Add Alumnus Profile' : 'Edit Alumnus Profile'}</h3>
                            <button onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="inp" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} placeholder="e.g. Dr. John Doe" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Current Role / Achievement</label>
                                <input className="inp" value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })} placeholder="e.g. CEO at TechInnovate" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Profile Image</label>
                                <ImageUpload
                                    currentImage={editData.avatar}
                                    onImageChange={(imageUrl) => setEditData({ ...editData, avatar: imageUrl })}
                                    label="Upload Profile Image"
                                    maxSizeMB={3}
                                    aspectRatio="square"
                                    supportedFormats={["image", "url"]}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Brief Bio / Notable Work</label>
                                <textarea className="inp" rows={4} value={editData.bio} onChange={e => setEditData({ ...editData, bio: e.target.value })} placeholder="Brief description of their journey or contribution..." />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>
                                {modal === 'add' ? 'Add to Showcase' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
