import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import styles from "./JobPortal.module.css";
import AvatarImg from "../components/AvatarImg";
import { timeAgo } from "../utils/helpers";

/**
 * JobPortal: A professional career board for alumni and referrals.
 * Features real-time filtering and a high-signal minimalist interface.
 */

export default function JobPortal() {
    const { notify, posts, currentUser, careerRequests, sendCareerRequest } = useApp();
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedPosts, setExpandedPosts] = useState(new Set());

    const toggleExpand = (id) => {
        const next = new Set(expandedPosts);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedPosts(next);
    };

    // Identify Job and Referral posts only (excluding own posts) and sort by recency
    const allCareerPosts = posts
        .filter(post =>
            (post.postType === "JOB" || post.postType === "REFERRAL") &&
            post.user?.id !== currentUser?.id
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Filter posts based on user search input
    const filteredOpportunities = allCareerPosts.filter(job => {
        const query = searchQuery.toLowerCase();
        return (
            job.title.toLowerCase().includes(query) ||
            job.company?.toLowerCase().includes(query) ||
            job.location?.toLowerCase().includes(query)
        );
    });

    /**
     * Logic for applying to a specific job.
     */
    const handleApplication = (jobId, jobTitle, applyUrl) => {
        if (applyUrl) {
            window.open(applyUrl, "_blank");
            notify(`Opening external application for ${jobTitle}.`, "ok");
        } else {
            notify(`No application link provided for this post. Please contact the poster directly.`, "err");
        }
    };

    const handleReferralRequest = (jobId) => {
        sendCareerRequest(jobId, "REFERRAL_REQUEST");
    };

    return (
        <div className={styles.portalWrapper}>
            {/* Header: Action focused and clean */}
            <header className={styles.portalHeader}>
                <div className={styles.headerContext}>
                    <h1 className={styles.portalTitle}>Career Opportunities</h1>
                    <p className={styles.portalSubtitle}>
                        Discover exclusive job openings and high-priority referrals shared by your fellow AEC alumni.
                    </p>
                </div>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search by role, company, or city..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Opportunity List: Modern list-style cards */}
            <section className={styles.listingsSection}>
                {filteredOpportunities.length > 0 ? (
                    filteredOpportunities.map((opportunity, index) => {
                        const existingRequest = careerRequests.find(r => r.post.id === opportunity.id);
                        const isReferralRequested = existingRequest?.requestType === "REFERRAL_REQUEST";
                        const isExpanded = expandedPosts.has(opportunity.id);
                        const longDesc = opportunity.description?.length > 180;
                        const poster = opportunity.user || {};

                        return (
                            <motion.div
                                key={opportunity.id}
                                className={styles.jobEntry}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                {/* LinkedIn style header: User who shared */}
                                <div className={styles.postHeader}>
                                    <AvatarImg user={poster} className={styles.avatar} />
                                    <div className={styles.posterInfo}>
                                        <div className={styles.posterName}>{poster.name}</div>
                                        <div className={styles.posterMeta}>
                                            {poster.designation || "Alumni"} {poster.company ? ` • ${poster.company}` : ""} • {timeAgo(opportunity.createdAt)}
                                        </div>
                                    </div>
                                    <div className={styles.typeBadge}>
                                        {opportunity.postType === "REFERRAL" ? "🤝 Referral" : "💼 Job"}
                                    </div>
                                </div>

                                <div className={styles.jobContent}>
                                    <h3 className={styles.jobName}>{opportunity.title}</h3>
                                    <p className={styles.jobCompany}>
                                        {opportunity.company || "Institutional Opportunity"}
                                        {opportunity.location && <span className={styles.locationDot}> • 📍 {opportunity.location}</span>}
                                        {opportunity.experience && <span className={styles.locationDot}> • 🎓 {opportunity.experience}</span>}
                                    </p>

                                    <div className={styles.descWrapper}>
                                        <p className={styles.descriptionSnippet}>
                                            {opportunity.description && (
                                                <>
                                                    {isExpanded || !longDesc
                                                        ? opportunity.description
                                                        : `${opportunity.description.substring(0, 180)}... `}
                                                    {longDesc && (
                                                        <span
                                                            className={styles.inlineExpandBtn}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleExpand(opportunity.id);
                                                            }}
                                                        >
                                                            {isExpanded ? " see less" : " see more"}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* LinkedIn style shared link card */}
                                    {opportunity.applyUrl && (
                                        <a href={opportunity.applyUrl} target="_blank" rel="noreferrer" className={styles.linkCard}>
                                            <div className={styles.linkIcon}>🔗</div>
                                            <div className={styles.linkText}>
                                                <div className={styles.linkTitle}>Application Link / Website</div>
                                                <div className={styles.linkUrl}>{opportunity.applyUrl}</div>
                                            </div>
                                            <div className={styles.linkArrow}>↗</div>
                                        </a>
                                    )}
                                </div>

                                <div className={styles.jobFooter}>
                                    <div className={styles.actionGroup}>
                                        <button
                                            className={`${styles.referralBtn} ${isReferralRequested ? styles.requested : ""}`}
                                            onClick={() => handleReferralRequest(opportunity.id)}
                                            disabled={isReferralRequested}
                                        >
                                            {isReferralRequested
                                                ? (existingRequest.status === "REFERRED" ? "✓ Referred" : "⏳ Pending Referral")
                                                : "🤝 Request Referral"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className={styles.zeroState}>
                        <p>No career opportunities match your current search.</p>
                        <span>Try adjusting your filters or checking back later.</span>
                    </div>
                )}
            </section>
        </div>
    );
}
