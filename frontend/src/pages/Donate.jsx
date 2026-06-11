import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import PublicNav from "../components/PublicNav";
import Footer from "../components/Footer";
import styles from "./Donate.module.css";

export default function Donate() {
    const { givingInitiatives, currentUser, setPage, setTab, notify } = useApp();
    const [selectedInitiative, setSelectedInitiative] = useState(null);

    const handleDonateClick = (initiative) => {
        if (!currentUser) {
            notify("Please log in to your alumni account to contribute.", "info");
            setPage("LOGIN");
            return;
        }
        if (currentUser.role !== "ROLE_ALUMNI") {
            notify("Only verified alumni can contribute to these initiatives.", "err");
            return;
        }
        setSelectedInitiative(initiative);
    };

    const handleHeroContribute = () => {
        if (!currentUser) {
            notify("Please log in to your alumni account to contribute.", "info");
            setPage("LOGIN");
            return;
        }
        if (currentUser.role === "ROLE_ALUMNI") {
            setPage("APP");
            setTab("giving");
        } else {
            notify("Only alumni can contribute from the alumni section.", "err");
        }
    };

    return (
        <div className={styles.donatePage}>
            <PublicNav activePage="DONATE" />

            <header className={styles.hero}>
                <div className={styles.heroContent}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Giving Back to AEC
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Your support fuels the dreams of next-generation engineers and helps us maintain our legacy of excellence.
                    </motion.p>
                    <motion.button
                        className={styles.heroBtn}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        onClick={handleHeroContribute}
                    >
                        Contribute Now 💝
                    </motion.button>
                </div>
            </header>

            <main className={styles.container}>
                <section id="initiatives" className={styles.initiativesSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.title}>Active Initiatives</h2>
                        <p className={styles.subtitle}>Choose a cause that resonates with you</p>
                    </div>

                    <div className={styles.grid}>
                        {givingInitiatives.map((item, i) => (
                            <motion.div
                                key={item.id}
                                className={styles.card}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            >
                                <div className={styles.cardImg}>
                                    <img src={item.img} alt={item.title} />
                                    <div className={styles.tag}>{item.tag}</div>
                                </div>
                                <div className={styles.cardBody}>
                                    <h3 className={styles.cardTitle}>{item.title}</h3>
                                    <p className={styles.cardDesc}>{item.desc}</p>

                                    <div className={styles.progressArea}>
                                        <div className={styles.progressMeta}>
                                            <span>${(item.raised / 1000).toFixed(1)}k raised</span>
                                            <span>{Math.round((item.raised / item.goal) * 100)}%</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <motion.div
                                                className={styles.progressFill}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.raised / item.goal) * 100}%` }}
                                                transition={{ duration: 1.2 }}
                                            />
                                        </div>
                                        <div className={styles.goalLine}>
                                            Goal: ${(item.goal / 1000).toFixed(0)}k
                                        </div>
                                    </div>

                                    <button
                                        className={styles.donateBtn}
                                        onClick={() => handleDonateClick(item)}
                                    >
                                        Donate Now
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className={styles.impactSection}>
                    <div className={styles.impactCard}>
                        <div className={styles.impactIcon}>📈</div>
                        <div className={styles.impactInfo}>
                            <h3>Transparency & Impact</h3>
                            <p>100% of your donation goes directly to the chosen initiative. We provide quarterly reports on how funds are utilized for campus development and student support.</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Real-time Donation Modal */}
            {selectedInitiative && (
                <div className={styles.modalOverlay}>
                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <button className={styles.closeBtn} onClick={() => setSelectedInitiative(null)}>✕</button>
                        <h3>Support {selectedInitiative.title}</h3>
                        <p>Thank you for your generosity, {currentUser?.name}.</p>

                        <div className={styles.modalFields}>
                            <div className="form-group">
                                <label className="form-label">Donation Amount ($)</label>
                                <input type="number" className="inp" placeholder="Enter amount" defaultValue={100} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Payment Method</label>
                                <select className="inp">
                                    <option>Alumni Credit Card (Saved)</option>
                                    <option>UPI / Net Banking</option>
                                    <option>PayPal</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button className="btn btn-outline" onClick={() => setSelectedInitiative(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => {
                                notify("Processing real-time donation... Thank you!", "ok");
                                setSelectedInitiative(null);
                            }}>
                                Confirm & Donate
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <Footer />
        </div>
    );
}
