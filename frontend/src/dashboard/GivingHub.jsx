import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import styles from "./GivingHub.module.css";

/**
 * GivingHub: Manages institutional advancement and development initiatives.
 * Provides a clean, professional interface for alumni to support university growth.
 */

export default function GivingHub() {
    const { givingInitiatives, notify } = useApp();

    // State for the professional donation form
    const [amount, setAmount] = useState("");
    const [initiative, setInitiative] = useState("");

    /**
     * Handles the professional contribution process with validation.
     */
    const handleContribute = (e) => {
        e.preventDefault();
        if (!amount || !initiative) {
            return notify("Please select an initiative and enter a contribution amount.", "err");
        }
        notify(`Thank you for supporting '${initiative}'. Redirecting to secure gateway for INR ${amount}...`, "ok");
    };

    return (
        <div className={styles.givingContainer}>
            {/* Hero Section: Understated and High-End */}
            <motion.section
                className={styles.givingHero}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Institutional Advancement</h1>
                    <p className={styles.heroSub}>
                        Join a community of dedicated Aecians supporting strategic research, student merit scholarships, and regional infrastructure growth.
                    </p>
                </div>
            </motion.section>

            {/* Support Form: Minimalist Card */}
            <section className={styles.supportSection}>
                <div className={styles.supportCard}>
                    <div className={styles.formHeader}>
                        <h2 className={styles.formTitle}>Secure Contribution</h2>
                        <p className={styles.formSubtitle}>Empower the next generation of engineers through verified university funds.</p>
                    </div>

                    <form className={styles.givingForm} onSubmit={handleContribute}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Select Development Initiative</label>
                            <select
                                className={styles.formSelect}
                                value={initiative}
                                onChange={(e) => setInitiative(e.target.value)}
                                required
                            >
                                <option value="">Choose an initiative...</option>
                                {givingInitiatives.map(item => (
                                    <option key={item.id} value={item.title}>{item.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Contribution Amount (INR)</label>
                            <input
                                type="number"
                                className={styles.formInput}
                                placeholder="e.g. 5000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Initialize Contribution &rarr;
                        </button>
                    </form>
                </div>
            </section>

            {/* Current Initiatives: Grid-based view */}
            <section className={styles.initiativesSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Active Development Projects</h2>
                    <p className={styles.sectionSubtitle}>Institutional projects currently requiring strategic support.</p>
                </div>

                <div className={styles.initiativesGrid}>
                    {givingInitiatives.length > 0 ? givingInitiatives.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className={styles.initiativeCard}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <div className={styles.cardHeader}>
                                <h3 className={styles.initiativeTitle}>{item.title}</h3>
                                <span className={styles.tag}>{item.tag || "Endowment"}</span>
                            </div>
                            <p className={styles.initiativeDesc}>{item.description}</p>
                            <div className={styles.cardFooter}>
                                <button
                                    className={styles.learnMoreLink}
                                    onClick={() => setInitiative(item.title)}
                                >
                                    Select Project
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className={styles.emptyState}>
                            Institutional data for development initiatives is loading...
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
