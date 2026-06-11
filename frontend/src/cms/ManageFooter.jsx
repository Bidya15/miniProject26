import { useState } from "react";
import { useApp } from "../context/AppContext";
import styles from "../dashboard/dashboard.module.css";
import ImageUpload from "../components/ImageUpload";

export default function ManageFooter() {
    const {
        faqs, updateFaq, deleteFaq,
        socialLinks, updateSocialLink, deleteSocialLink,
        footerConfig, saveFooterConfig
    } = useApp();

    const [editingFaq, setEditingFaq] = useState(null);
    const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

    const [newSocial, setNewSocial] = useState({ platform: "", url: "" });
    const [tempConfig, setTempConfig] = useState(footerConfig);

    const handleConfigSave = (e) => {
        e.preventDefault();
        saveFooterConfig(tempConfig);
    };

    const handleAddFaq = (e) => {
        e.preventDefault();
        updateFaq(newFaq);
        setNewFaq({ question: "", answer: "" });
    };

    const handleAddSocial = (e) => {
        e.preventDefault();
        updateSocialLink(newSocial);
        setNewSocial({ platform: "", url: "" });
    };

    return (
        <div className={styles.manageFooter}>
            <div className={styles.sectionHeader}>
                <h3>🗺️ Footer & Location Management</h3>
                <p>Customize the institution's contact details, FAQ guides, and social connections.</p>
            </div>

            <div className={styles.mcGrid}>
                {/* ── Contact Info & Map ── */}
                <div className={styles.mcCard} id="contact-management">
                    <h4>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Global Contact & Map
                    </h4>
                    <form onSubmit={handleConfigSave} className={styles.mcForm}>
                        <div className={styles.fGroup}>
                            <label>Application Name</label>
                            <input
                                type="text"
                                value={tempConfig.appName || ""}
                                onChange={e => setTempConfig({ ...tempConfig, appName: e.target.value })}
                                placeholder="e.g. AecianConnect"
                            />
                        </div>
                        <div className={styles.fGroup}>
                            <ImageUpload
                                currentImage={tempConfig.appLogo || ""}
                                onImageChange={(val) => setTempConfig({ ...tempConfig, appLogo: val })}
                                label="Application Logo (Image/Base64/URL)"
                                supportedFormats={["image", "url"]}
                            />
                        </div>
                        <div className={styles.fGroup}>
                            <label>Official Email</label>
                            <input
                                type="email"
                                value={tempConfig.email || ""}
                                onChange={e => setTempConfig({ ...tempConfig, email: e.target.value })}
                                placeholder="alumni@college.edu"
                            />
                        </div>
                        <div className={styles.fGroup}>
                            <label>Support Phone</label>
                            <input
                                type="text"
                                value={tempConfig.phone}
                                onChange={e => setTempConfig({ ...tempConfig, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                        <div className={styles.fGroup}>
                            <label>Physical Address</label>
                            <textarea
                                rows="3"
                                value={tempConfig.address}
                                onChange={e => setTempConfig({ ...tempConfig, address: e.target.value })}
                                placeholder="Full campus address..."
                            />
                        </div>
                        <div className={styles.fGroup}>
                            <label>Google Maps Embed URL</label>
                            <input
                                type="text"
                                value={tempConfig.mapUrl}
                                onChange={e => setTempConfig({ ...tempConfig, mapUrl: e.target.value })}
                                placeholder="https://www.google.com/maps/embed?..."
                            />
                        </div>
                        <button type="submit" className={styles.saveBtn}>Save Global Settings</button>
                    </form>
                </div>

                {/* ── FAQs ── */}
                <div className={styles.mcCard} id="faq-management">
                    <h4>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        FAQ Management
                    </h4>
                    <div className={styles.miniList}>
                        {faqs.length === 0 && <p className={styles.emptyHint}>No FAQs added yet.</p>}
                        {faqs.map(f => (
                            <div key={f.id} className={styles.miniItem}>
                                <div className={styles.miniInfo}>
                                    <strong>{f.question}</strong>
                                    <span>{f.answer}</span>
                                </div>
                                <button className={styles.delBtn} onClick={() => deleteFaq(f.id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddFaq} className={styles.addInline}>
                        <input
                            placeholder="Type Question..."
                            value={newFaq.question}
                            onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Type Answer..."
                            rows="2"
                            value={newFaq.answer}
                            onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                            required
                        />
                        <button type="submit">Add New FAQ</button>
                    </form>
                </div>

                {/* ── Social Links ── */}
                <div className={styles.mcCard} id="social-management">
                    <h4>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        Social Media Channels
                    </h4>
                    <div className={styles.miniList}>
                        {socialLinks.length === 0 && <p className={styles.emptyHint}>No social links configured.</p>}
                        {socialLinks.map(s => (
                            <div key={s.id} className={styles.miniItem}>
                                <div className={styles.miniInfo}>
                                    <strong>{s.platform}</strong>
                                    <span>{s.url}</span>
                                </div>
                                <button className={styles.delBtn} onClick={() => deleteSocialLink(s.id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddSocial} className={styles.addInline}>
                        <select
                            value={newSocial.platform}
                            onChange={e => setNewSocial({ ...newSocial, platform: e.target.value })}
                            required
                        >
                            <option value="">Choose Platform</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Twitter">Twitter / X</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Youtube">Youtube</option>
                            <option value="Website">Institutional Website</option>
                        </select>
                        <input
                            placeholder="Profile URL (https://...)"
                            value={newSocial.url}
                            onChange={e => setNewSocial({ ...newSocial, url: e.target.value })}
                            required
                        />
                        <button type="submit">Establish Link</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
