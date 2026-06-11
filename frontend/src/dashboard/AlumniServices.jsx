import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import AvatarImg from "../components/AvatarImg";
import styles from "./AlumniServices.module.css";

export default function AlumniServices() {
    const { alumniServices, updateServices, currentUser, page, notify, confirm } = useApp();
    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN" && page === "APP";

    const [modal, setModal] = useState(null); // { mode: 'add'|'edit', item: service }
    const [formData, setFormData] = useState(null);

    function startEdit(service = null) {
        if (service) {
            setModal('edit');
            setFormData({ ...service });
        } else {
            setModal('add');
            setFormData({
                id: Date.now(),
                name: "",
                desc: "",
                cost: 0,
                processingTime: "24-48 hours"
            });
        }
    }

    function save() {
        if (modal === 'add') {
            updateServices([...alumniServices, formData]);
        } else {
            updateServices(alumniServices.map(s => s.id === formData.id ? formData : s));
        }
        setModal(null);
    }

    async function handleDelete(id) {
        if (await confirm("Delete Service?", "Permanently remove this service highlight for alumni?")) {
            await updateServices(alumniServices.filter(s => s.id !== id));
        }
    }

    const handleRequest = (service) => {
        notify(`Request for "${service}" has been submitted successfully. You will receive an email once it is processed.`, "ok");
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Alumni Services</h1>
                <p className={styles.sub}>Access exclusive digital tools and official university documentation.</p>
            </header>

            <div className={styles.mainGrid}>
                {/* ─── Digital ID Card ────────────────────────── */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}><span>🆔</span> Digital Alumni Card</h2>
                    <p className={styles.cardDesc}>Your official digital identification for campus entry, library access, and alumni discounts.</p>

                    <div className={styles.idCardPreview}>
                        <div className={styles.idCardTop}>
                            <div className={styles.idCardLogo}>ALUMNI CONNECT</div>
                            <div className={styles.idCardChip} />
                        </div>
                        <div className={styles.idCardMain}>
                            <AvatarImg user={currentUser} size="md" className={styles.idAvatar} />
                            <div className={styles.idInfo}>
                                <h4>{currentUser?.name || "Member Name"}</h4>
                                <p>Batch of {currentUser?.batch || "N/A"}</p>
                                <p>{currentUser?.degree || "University Graduate"}</p>
                            </div>
                        </div>
                        <div className={styles.idCardBottom}>
                            <span>ID: AC-{currentUser?.id || "0000"}</span>
                            <span>VALID THRU: 12/2030</span>
                        </div>
                    </div>

                    <div className={styles.cardBtnRow}>
                        <button className="btn btn-primary flex-1" onClick={() => notify("Downloading Digital ID Card...")}>
                            Download ID (PDF)
                        </button>
                        <button className="btn btn-outline flex-1" onClick={() => notify("Physical card request sent!")}>
                            Order Physical Card
                        </button>
                    </div>
                </div>

                {/* ─── Document Requests ──────────────────────── */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}><span>📜</span> Official Documents</h2>
                    <p className={styles.cardDesc}>Request verified copies of your academic records, transcripts, and certificates.</p>

                    <ul className={styles.requestList}>
                        {alumniServices && alumniServices.map(service => (
                            <li key={service.id} className={styles.requestItem}>
                                <div style={{ flex: 1 }}>
                                    <div className={styles.requestName}>{service.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{service.desc} • {service.processingTime}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleRequest(service.name)}>
                                        Request • <span className={styles.requestCost}>${service.cost}</span>
                                    </button>
                                    {isSuper && (
                                        <div className={styles.serviceActions}>
                                            <button className={styles.actionBtn} onClick={() => startEdit(service)}>✎</button>
                                            <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => handleDelete(service.id)}>✕</button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                        {isSuper && (
                            <li
                                className={`${styles.requestItem} ${styles.addBtnRow}`}
                                onClick={() => startEdit()}
                            >
                                <div className={styles.addText}>➕ Add New Service / Document</div>
                            </li>
                        )}
                    </ul>

                    <div className="alert alert-info" style={{ fontSize: '12px', marginTop: '1rem' }}>
                        💡 Most digital requests are processed within 24-48 business hours.
                    </div>
                </div>
            </div>

            {/* Service Edit Modal */}
            {modal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>{modal === 'add' ? 'Add New Service' : 'Edit Service Details'}</h3>
                            <button onClick={() => setModal(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className="form-group">
                                <label className="form-label">Service Name</label>
                                <input className="inp" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description / Subtext</label>
                                <input className="inp" value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label className="form-label">Processing Fee ($)</label>
                                    <input className="inp" type="number" value={formData.cost} onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })} />
                                </div>
                                <div className="form-group flex-1">
                                    <label className="form-label">Processing Time</label>
                                    <input className="inp" value={formData.processingTime} onChange={e => setFormData({ ...formData, processingTime: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>
                                {modal === 'add' ? 'Create Service' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
