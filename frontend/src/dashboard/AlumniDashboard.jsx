import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import styles from "./AlumniDashboard.module.css";
import EventsPanel from "../components/EventsPanel";

/**
 * AlumniDashboard: The central hub for alumni activities.
 * Focuses on professional utility with a modern, clean aesthetic.
 */

// Define navigation cards for the dashboard
const DASHBOARD_FEATURES = [
    { id: "networking", title: "Networking Hub", desc: "Build professional relationships with verified alumni mentors.", tab: "networking-hub" },
    { id: "community", title: "Community & Career Hub", desc: "Access the social feed and exclusive AEC job opportunities in one place.", tab: "feed" }
];

export default function AlumniDashboard() {
    const { currentUser, setTab, posts, users, connections = [], sentConnections = [] } = useApp();

    // Calculate real-time stats from backend data
    const activeJobCount = posts.filter(post => post.postType === "JOB" || post.postType === "REFERRAL").length;
    const totalVerifiedAlumni = users.filter(user => user.role === "ROLE_ALUMNI" && user.status === "APPROVED").length;
    const activeConnections = connections.filter(c => c.status === "ACCEPTED").length + sentConnections.filter(c => c.status === "ACCEPTED").length;

    // Humanized Profile Info
    const userRoleInfo = `${currentUser?.designation || "Graduate"} ${currentUser?.company ? `at ${currentUser.company}` : "AEC Alumni"}`;
    const userClassInfo = `Class of ${currentUser?.batch || "Unknown"}`;

    // Profile Completion Logic
    const profileFields = [
        currentUser?.designation,
        currentUser?.company,
        currentUser?.techStack,
        currentUser?.bio,
        currentUser?.location,
        currentUser?.avatar
    ];
    const completedFields = profileFields.filter(f => f && String(f).trim().length > 0).length;
    const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

    // Get recent success stories for spotlight
    const spotlightStories = posts.filter(p => p.postType === "SUCCESS_STORY").slice(0, 2);

    return (
        <div className={styles.dashboardWrapper}>
            <div className={styles.dashboardContent}>
                {/* Main Column */}
                <div className={styles.mainCol}>
                    <header className={styles.welcomeHeader}>
                        <div className={styles.welcomeText}>
                            <h1 className={styles.greeting}>Welcome back, <span className={styles.userName}>{currentUser?.name}</span></h1>
                            <p className={styles.userRoleLine}>{userRoleInfo} | {userClassInfo}</p>
                        </div>
                        <div className={styles.profileMeta}>
                            <div className={styles.completionWrapper} onClick={() => setTab("profile")}>
                                <div className={styles.completionLabel}>
                                    <span>Profile Strength</span>
                                    <span>{completionPercentage}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <motion.div 
                                        className={styles.progressFill} 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionPercentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Quick Actions Bar */}
                    <section className={styles.quickActions}>
                        <button className={styles.actionPill} onClick={() => setTab("feed")}>
                            <span>🤝</span> Post a Referral
                        </button>
                        <button className={styles.actionPill} onClick={() => setTab("networking-hub")}>
                            <span>🔍</span> Find a Mentor
                        </button>
                        <button className={styles.actionPill} onClick={() => setTab("feed")}>
                            <span>📰</span> Share Update
                        </button>
                        <button className={styles.actionPill} onClick={() => setTab("profile")}>
                            <span>📝</span> Update Bio
                        </button>
                    </section>

                    <section className={styles.metricsBar}>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Verified Network</span>
                            <span className={styles.metricValue}>{totalVerifiedAlumni} Alumni</span>
                        </div>
                        <div className={styles.metricDivider} />
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Career Board</span>
                            <span className={styles.metricValue}>{activeJobCount} Active Roles</span>
                        </div>
                        <div className={styles.metricDivider} />
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>My Network</span>
                            <span className={styles.metricValue}>{activeConnections} Connected</span>
                        </div>
                    </section>

                    {/* Success Spotlight */}
                    {spotlightStories.length > 0 && (
                        <section className={styles.spotlightSection}>
                            <h2 className={styles.sectionHeading}>Alumni Spotlight</h2>
                            <div className={styles.spotlightGrid}>
                                {spotlightStories.map(story => (
                                    <div key={story.id} className={styles.spotlightCard} onClick={() => setTab("profile")}>
                                        <div className={styles.spotlightContent}>
                                            <span className={styles.spotlightTag}>SUCCESS STORY</span>
                                            <h3 className={styles.spotlightTitle}>{story.title}</h3>
                                            <p className={styles.spotlightDesc}>{story.description?.substring(0, 100)}...</p>
                                            <div className={styles.spotlightAuthor}>
                                                — {story.user?.name}, Class of {story.user?.batch}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <main className={styles.featuresGrid}>
                        {DASHBOARD_FEATURES.map((feature, index) => (
                            <motion.div
                                key={feature.id}
                                className={styles.featureCard}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                whileHover={{ y: -4 }}
                            >
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDesc}>{feature.desc}</p>
                                <button
                                    className={styles.featureAction}
                                    onClick={() => setTab(feature.tab)}
                                >
                                    Open Module &rarr;
                                </button>
                            </motion.div>
                        ))}
                    </main>
                </div>

                {/* Sidebar Column: Centralized Events & Circulars */}
                <aside className={styles.sideCol}>
                    <EventsPanel
                        limit={5}
                        isCompact={true}
                        title="📅 Upcoming Events & Circulars"
                    />
                </aside>
            </div>
        </div>
    );
}
