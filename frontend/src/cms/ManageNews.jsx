import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import ImageUpload from "../components/ImageUpload";
import styles from "../dashboard/dashboard.module.css";

export default function ManageNews() {
    const { newsItems, updateNews, editNews, removeNews, notify } = useApp();
    const [modal, setModal] = useState(null); // 'add' | 'edit'
    const [editData, setEditData] = useState(null);

    function startEdit(item = null) {
        if (item) {
            setModal('edit');
            setEditData({ ...item });
        } else {
            setModal('add');
            setEditData({
                tag: "Achievement",
                title: "",
                date: new Date().toISOString().slice(0, 10), // ISO format: YYYY-MM-DD
                excerpt: "",
                image: "https://images.unsplash.com/photo-1523240715630-97370d18229a"
            });
        }
    }

    async function save() {
        if (!editData.title.trim()) return notify("Title is required", "err");

        if (modal === 'add') {
            const { id: _ignore, ...payload } = editData;
            await updateNews(payload);
        } else {
            await editNews(editData);
        }
        setModal(null);
    }

    async function handleDelete(id) {
        if (await confirm("Delete News?", "Permanently remove this news story from the portal?")) {
            await removeNews(id);
        }
    }

    return (
        <div className={styles.maContainer}>
            <div className={styles.createRow}>
                <div>
                    <h3 className={styles.maTableTitle}>News & Success Stories</h3>
                    <p className={styles.maTableSub}>Manage the updates shown on the public home page</p>
                </div>
                <button className="btn btn-primary" onClick={() => startEdit()}>
                    ➕ Post New Story
                </button>
            </div>

            <div className={styles.tableWrap}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Story / Title</th>
                            <th>Tag</th>
                            <th>Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {newsItems.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={item.image} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt="" />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{item.title}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--gray-500)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.excerpt}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="badge badge-indigo">{item.tag}</span></td>
                                <td style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.date}</td>
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
                            <h3>{modal === 'add' ? 'Create News Story' : 'Edit News Story'}</h3>
                            <button onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label className="form-label">Category Tag</label>
                                    <input className="inp" value={editData.tag} onChange={e => setEditData({ ...editData, tag: e.target.value })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label">Publish Date</label>
                                    <input className="inp" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Article Title</label>
                                <input className="inp" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="Enter headline..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Thumbnail Image</label>
                                <ImageUpload
                                    currentImage={editData.image}
                                    onImageChange={(imageUrl) => setEditData({ ...editData, image: imageUrl })}
                                    label="Upload News Thumbnail"
                                    maxSizeMB={4}
                                    aspectRatio="video"
                                    supportedFormats={["image", "url"]}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Short Excerpt / Summary</label>
                                <textarea className="inp" rows={4} value={editData.excerpt} onChange={e => setEditData({ ...editData, excerpt: e.target.value })} placeholder="Brief summary of the story..." />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>
                                {modal === 'add' ? 'Publish Story' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
