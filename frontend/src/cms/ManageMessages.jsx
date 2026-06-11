import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import ImageUpload from "../components/ImageUpload";
import styles from "../dashboard/dashboard.module.css";

export default function ManageMessages() {
    const { messageDeskItems, updateMessageDesk, deleteMessageDesk, notify } = useApp();
    const [modal, setModal] = useState(null); // 'add' | 'edit'
    const [editData, setEditData] = useState(null);

    function startEdit(item = null) {
        if (item) {
            setModal('edit');
            setEditData({ ...item });
        } else {
            setModal('add');
            setEditData({
                senderName: "",
                senderRole: "Head of Department (HOD), CSE",
                content: "",
                imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                sortOrder: messageDeskItems.length + 1,
                id: null
            });
        }
    }

    async function save() {
        if (!editData.senderName.trim()) return notify("Sender name is required", "err");
        if (!editData.content.trim()) return notify("Message content is required", "err");

        await updateMessageDesk(editData);
        setModal(null);
    }

    async function handleDelete(id) {
        if (await confirm("Remove Message?", "Remove this message from the desk?")) {
            await deleteMessageDesk(id);
        }
    }

    return (
        <div className={styles.maContainer}>
            <div className={styles.createRow}>
                <div>
                    <h3 className={styles.maTableTitle}>Message Desk Administration</h3>
                    <p className={styles.maTableSub}>Manage institutional messages from the Secretary, Principal, and other officials</p>
                </div>
                <button className="btn btn-primary" onClick={() => startEdit()}>
                    ➕ Add New Message
                </button>
            </div>

            <div className={styles.tableWrap}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Sender</th>
                            <th>Role</th>
                            <th>Content Snippet</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messageDeskItems.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={item.imageUrl || null} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                        <div style={{ fontWeight: 600 }}>{item.senderName}</div>
                                    </div>
                                </td>
                                <td><span className="badge badge-indigo">{item.senderRole}</span></td>
                                <td style={{ fontSize: '12px', color: 'var(--gray-500)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.content}
                                </td>
                                <td className="text-right">
                                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(item)}>Edit</button>
                                    <button className="btn btn-ghost btn-sm text-red" onClick={() => remove(item.id)}>Delete</button>
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
                            <h3>{modal === 'add' ? 'Add Desk Message' : 'Edit Desk Message'}</h3>
                            <button onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label className="form-label">Sender Name</label>
                                    <input className="inp" value={editData.senderName} onChange={e => setEditData({ ...editData, senderName: e.target.value })} placeholder="e.g. Dr. Bidyut Baruah" />
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label">Sort Order</label>
                                    <input type="number" className="inp" value={editData.sortOrder} onChange={e => setEditData({ ...editData, sortOrder: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sender Role / Title</label>
                                <input className="inp" value={editData.senderRole} onChange={e => setEditData({ ...editData, senderRole: e.target.value })} placeholder="e.g. Principal, AEC" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Sender Portrait</label>
                                <ImageUpload
                                    currentImage={editData.imageUrl}
                                    onImageChange={(url) => setEditData({ ...editData, imageUrl: url })}
                                    label="Upload Portrait"
                                    maxSizeMB={2}
                                    aspectRatio="square"
                                    supportedFormats={["image", "url"]}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message Content</label>
                                <textarea className="inp" rows={6} value={editData.content} onChange={e => setEditData({ ...editData, content: e.target.value })} placeholder="Enter the official message..." />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>
                                {modal === 'add' ? 'Publish Message' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
