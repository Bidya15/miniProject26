import { useState } from "react";
import { useApp } from "../context/AppContext";
import PublicNav from "../components/PublicNav";
import Footer from "../components/Footer";
import styles from "./Contact.module.css";

export default function Contact() {
    const { footerConfig } = useApp();
    const [form, setForm] = useState({ name: "", email: "", subject: "", msg: "" });
    const [sent, setSent] = useState(false);
    const [visibleItems, setVisibleItems] = useState({});

    function toggleItem(label) {
        setVisibleItems(prev => ({ ...prev, [label]: !prev[label] }));
    }

    function ch(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

    function submit(e) {
        e.preventDefault();
        setSent(true);
        setTimeout(() => setSent(false), 5000);
        setForm({ name: "", email: "", subject: "", msg: "" });
    }

    const CONTACTS = [
        { icon: "📧", label: "Email", val: footerConfig.email },
        { icon: "📞", label: "Phone", val: footerConfig.phone },
        { icon: "📍", label: "Address", val: footerConfig.address },
        { icon: "⏰", label: "Office Hours", val: footerConfig.officeHours },
    ];

    return (
        <div className={styles.page}>
            <PublicNav activePage="CONTACT" />

            {/* Hero banner */}
            <div className={styles.heroBanner}>
                <div className={styles.heroBadge}>Get in Touch</div>
                <h1 className={styles.heroTitle}>
                    Have questions?{" "}
                    <span className={styles.gradientText}>We're here.</span>
                </h1>
                <p className={styles.heroSub}>
                    Reach out to the AlumniConnect team and we'll get back to you within 24 hours.
                </p>
            </div>

            {/* Main content */}
            <div className={styles.contentGrid}>
                {/* Info column */}
                <div className={styles.infoColumn}>
                    <div className={styles.infoHead}>
                        <h2 className={styles.infoTitle}>Contact Info</h2>
                    </div>
                    {CONTACTS.map(c => {
                        const isVisible = visibleItems[c.label];
                        return (
                            <div key={c.label} className={styles.contactItem}>
                                <div className={styles.contactItemLeft}>
                                    <span className={styles.contactItemIcon}>{c.icon}</span>
                                    <div>
                                        <div className={styles.contactItemLabel}>{c.label}</div>
                                        <div className={styles.contactItemValue}>
                                            {isVisible ? c.val : "•••••••••"}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className={styles.toggleBtn}
                                    onClick={() => toggleItem(c.label)}
                                    title={isVisible ? "Hide Details" : "Show Details"}
                                >
                                    {isVisible ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Form column */}
                <div className={styles.formCard}>
                    {sent ? (
                        <div className={styles.successState}>
                            <div className={styles.successIcon}>✅</div>
                            <h3 className={styles.successTitle}>Message Sent!</h3>
                            <p className={styles.successSub}>Thank you! We'll get back to you within 24 hours.</p>
                            <button onClick={() => setSent(false)} className={styles.sendAgainBtn}>Send Another</button>
                        </div>
                    ) : (
                        <>
                            <h2 className={styles.formTitle}>Send us a message</h2>
                            <form onSubmit={submit} className={styles.formBody}>
                                <div className={styles.formRow}>
                                    <div>
                                        <label className={styles.formLabel}>Your Name *</label>
                                        <input className="inp" required value={form.name} onChange={ch("name")} placeholder="Rahul Sharma" />
                                    </div>
                                    <div>
                                        <label className={styles.formLabel}>Email Address *</label>
                                        <input className="inp" required type="email" value={form.email} onChange={ch("email")} placeholder="you@example.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className={styles.formLabel}>Subject</label>
                                    <input className="inp" value={form.subject} onChange={ch("subject")} placeholder="e.g. Partnership enquiry" />
                                </div>
                                <div>
                                    <label className={styles.formLabel}>Message *</label>
                                    <textarea className="inp" required rows={5} value={form.msg} onChange={ch("msg")} placeholder="Tell us how we can help…" />
                                </div>
                                <button type="submit" className={styles.submitBtn}>Send Message →</button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Google Map Section */}
            <div className={styles.mapContainer}>
                <div className={styles.mapCard}>
                    <iframe
                        title="College Location"
                        src={footerConfig.mapUrl}
                        width="100%"
                        height="350"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                    ></iframe>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
