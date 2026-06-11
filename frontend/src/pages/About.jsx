import { useState } from "react";
import { useApp } from "../context/AppContext";
import PublicNav from "../components/PublicNav";
import Footer from "../components/Footer";
import styles from "./About.module.css";

function FeatureCard({ icon, title, desc }) {
    return (
        <div className={styles.featureCard}>
            <div className={styles.featureIcon}>{icon}</div>
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureDesc}>{desc}</p>
        </div>
    );
}


export default function About() {
    const { setPage, aboutContent, updateAbout, currentUser, page } = useApp();
    const [editing, setEditing] = useState(null); // 'hero', 'mission', 'values', 'features'
    const [editData, setEditData] = useState(null);

    const isSuper = currentUser?.role === "ROLE_SUPER_ADMIN" && page === "APP";

    function startEdit(type) {
        setEditing(type);
        setEditData({ ...aboutContent });
    }

    function save() {
        updateAbout(editData);
        setEditing(null);
    }

    const NAV_LINKS = [["Home", "HOME"], ["About", "ABOUT"], ["Gallery", "GALLERY"], ["Contact", "CONTACT"], ["Log In", "LOGIN"], ["Register", "REGISTER"]];

    return (
        <div className={styles.page}>
            {page !== "APP" && <PublicNav activePage="ABOUT" />}

            {/* Hero banner */}
            <div className={styles.heroBanner}>
                {isSuper && <button className={styles.editBtn} onClick={() => startEdit('hero')}>✎ Edit Hero</button>}
                <div className={styles.heroBadge}>About AlumniConnect</div>
                <h1 className={styles.heroTitle}>{aboutContent.heroTitle}</h1>
                <p className={styles.heroSub}>{aboutContent.heroSub}</p>
            </div>

            {/* Mission & Vision */}
            <section className={styles.missionVisionSection}>
                <div className={styles.mvGrid}>
                    <div className={styles.mvCard}>
                        {isSuper && <button className={styles.editBtnFixed} onClick={() => startEdit('mission')}>✎ Edit Mission & Vision</button>}
                        <div className={styles.mvLabel}>Our Mission</div>
                        <h3 className={styles.mvTitle}>{aboutContent.missionTitle}</h3>
                        <p className={styles.mvText}>{aboutContent.missionText}</p>
                    </div>
                    <div className={styles.mvCard}>
                        <div className={styles.mvLabel}>Our Vision</div>
                        <h3 className={styles.mvTitle}>{aboutContent.visionTitle}</h3>
                        <p className={styles.mvText}>{aboutContent.visionText}</p>
                    </div>
                </div>
            </section>

            {/* Features grid */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Everything you need to connect</h2>
                    <p className={styles.sectionSub}>Six core features that make AlumniConnect the go-to platform for every student and alumni.</p>
                    {isSuper && <button className={styles.editBtnBasic} style={{ marginTop: '10px' }} onClick={() => startEdit('features')}>✎ Edit Features</button>}
                </div>
                <div className={styles.featureGrid}>
                    {aboutContent.features?.map((f, i) => (
                        <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} />
                    ))}
                </div>
            </section>


            {/* Values */}
            <section className={styles.valuesSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Our Values</h2>
                    <p className={styles.sectionSub}>The principles that guide everything we build.</p>
                    {isSuper && <button className={styles.editBtnBasic} onClick={() => startEdit('values')}>✎ Edit Values</button>}
                </div>
                <div className={styles.valuesGrid}>
                    {aboutContent.values.map(v => (
                        <div key={v.title} className={styles.valueCard}>
                            <div className={styles.valueIcon}>{v.icon}</div>
                            <h4 className={styles.valueTitle}>{v.title}</h4>
                            <p className={styles.valueDesc}>{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className={styles.ctaSection}>
                <h2 className={styles.ctaTitle}>Ready to join the network?</h2>
                <p className={styles.ctaSub}>Create your account in under a minute.</p>
                <div className={styles.ctaButtons}>
                    <button onClick={() => setPage("REGISTER")} className={styles.btnPrimary}>Register Free →</button>
                    <button onClick={() => setPage("CONTACT")} className={styles.btnOutline}>Contact Us</button>
                </div>
            </section>

            {/* Footer */}
            <Footer />

            {/* Edit Modal */}
            {editing && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Edit About Section</h3>
                            <button onClick={() => setEditing(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            {editing === 'hero' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Hero Title</label>
                                        <input className="inp" value={editData.heroTitle} onChange={e => setEditData({ ...editData, heroTitle: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Hero Subtext</label>
                                        <textarea className="inp" rows={4} value={editData.heroSub} onChange={e => setEditData({ ...editData, heroSub: e.target.value })} />
                                    </div>
                                </>
                            )}
                            {editing === 'mission' && (
                                <>
                                    <div className={styles.editorFlex}>
                                        <div className="flex-1">
                                            <h4 className={styles.editorSub}>Our Mission</h4>
                                            <div className="form-group">
                                                <label className="form-label">Mission Title</label>
                                                <input className="inp" value={editData.missionTitle} onChange={e => setEditData({ ...editData, missionTitle: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Mission Text</label>
                                                <textarea className="inp" rows={4} value={editData.missionText} onChange={e => setEditData({ ...editData, missionText: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={styles.editorSub}>Our Vision</h4>
                                            <div className="form-group">
                                                <label className="form-label">Vision Title</label>
                                                <input className="inp" value={editData.visionTitle} onChange={e => setEditData({ ...editData, visionTitle: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Vision Text</label>
                                                <textarea className="inp" rows={4} value={editData.visionText} onChange={e => setEditData({ ...editData, visionText: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            {editing === 'values' && (
                                <div className={styles.valuesEditor}>
                                    <div className={styles.editorHelp}>Icons, Titles, and Descriptions for your core values.</div>
                                    {editData.values.map((v, i) => (
                                        <div key={i} className={styles.valueEditItem}>
                                            <input className="inp" style={{ width: '60px' }} value={v.icon} onChange={e => {
                                                const newVals = [...editData.values];
                                                newVals[i].icon = e.target.value;
                                                setEditData({ ...editData, values: newVals });
                                            }} />
                                            <div className="flex-1">
                                                <input className="inp" value={v.title} onChange={e => {
                                                    const newVals = [...editData.values];
                                                    newVals[i].title = e.target.value;
                                                    setEditData({ ...editData, values: newVals });
                                                }} />
                                                <textarea className="inp" style={{ marginTop: '5px' }} value={v.desc} onChange={e => {
                                                    const newVals = [...editData.values];
                                                    newVals[i].desc = e.target.value;
                                                    setEditData({ ...editData, values: newVals });
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {editing === 'features' && (
                                <div className={styles.valuesEditor}>
                                    <div className={styles.editorHelp}>Manage the 6 key featured highlights.</div>
                                    {editData.features.map((f, i) => (
                                        <div key={i} className={styles.valueEditItem}>
                                            <input className="inp" style={{ width: '60px' }} value={f.icon} onChange={e => {
                                                const newFeats = [...editData.features];
                                                newFeats[i].icon = e.target.value;
                                                setEditData({ ...editData, features: newFeats });
                                            }} />
                                            <div className="flex-1">
                                                <input className="inp" value={f.title} onChange={e => {
                                                    const newFeats = [...editData.features];
                                                    newFeats[i].title = e.target.value;
                                                    setEditData({ ...editData, features: newFeats });
                                                }} />
                                                <textarea className="inp" style={{ marginTop: '5px' }} value={f.desc} onChange={e => {
                                                    const newFeats = [...editData.features];
                                                    newFeats[i].desc = e.target.value;
                                                    setEditData({ ...editData, features: newFeats });
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
