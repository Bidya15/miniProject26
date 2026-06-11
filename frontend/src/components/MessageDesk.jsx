import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import styles from "./MessageDesk.module.css";

export default function MessageDesk() {
    const { messageDeskItems, cmsLoading } = useApp();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(1); // 1 for right, -1 for left
    const [isHovered, setIsHovered] = useState(false);

    // Auto-slide functionality (Must be top-level)
    useEffect(() => {
        if (!messageDeskItems || messageDeskItems.length <= 1 || isHovered) return;
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentIndex(prev => (prev + 1) % messageDeskItems.length);
        }, 30000); // 30 seconds interval
        return () => clearInterval(timer);
    }, [messageDeskItems, isHovered]);

    const next = () => {
        setDirection(1);
        setCurrentIndex((currentIndex + 1) % messageDeskItems.length);
    };
    const prev = () => {
        setDirection(-1);
        setCurrentIndex((currentIndex - 1 + messageDeskItems.length) % messageDeskItems.length);
    };

    const jumpTo = (index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    if (cmsLoading) {
        return (
            <div className={styles.skeletonCard}>
                <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
                <div className="skeleton" style={{ width: '150px', height: '20px', marginTop: '12px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '80px', marginTop: '16px' }}></div>
            </div>
        );
    }

    if (!messageDeskItems || messageDeskItems.length === 0) {
        return (
            <div className={styles.deskWrapper}>
                <div className={styles.deskHeader}>
                    <span className={styles.deskBadge}>🎙️ Institutional Insights</span>
                    <h3 className={styles.deskTitle}>Message Desk</h3>
                </div>
                <div className={styles.emptyDesk}>
                    <div className={styles.emptyIcon}>🎙️</div>
                    <h3 className={styles.emptyTitle}>Desk is Waiting</h3>
                    <p className={styles.emptyText}>Institutional messages from the HOD, Principal, or Secretary will appear here once posted in the Admin Panel.</p>
                </div>
            </div>
        );
    }

    const currentMessage = messageDeskItems[currentIndex];

    return (
        <div
            className={styles.deskWrapper}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={styles.deskHeader}>
                <span className={styles.deskBadge}>🎙️ Institutional Insights</span>
                <h3 className={styles.deskTitle}>Message Desk</h3>
            </div>

            <div className={styles.messageCard}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentMessage.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className={styles.messageContent}
                    >
                        <div className={styles.senderInfo}>
                            <div className={styles.avatarWrapper}>
                                <img src={currentMessage.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"} alt={currentMessage.senderName} className={styles.avatar} />
                            </div>
                            <div className={styles.senderMeta}>
                                <h4 className={styles.senderName}>{currentMessage.senderName}</h4>
                                <span className={styles.senderRole}>{currentMessage.senderRole}</span>
                            </div>
                        </div>

                        <div className={styles.quoteIcon}>"</div>
                        <p className={styles.text}>{currentMessage.content}</p>
                    </motion.div>
                </AnimatePresence>

                {messageDeskItems.length > 1 && (
                    <div className={styles.controls}>
                        <button onClick={prev} className={styles.controlBtn}>←</button>
                        <div className={styles.dots}>
                            {messageDeskItems.map((_, i) => (
                                <div
                                    key={i}
                                    className={`${styles.dot} ${i === currentIndex ? styles.activeDot : ""}`}
                                    onClick={() => jumpTo(i)}
                                />
                            ))}
                        </div>
                        <button onClick={next} className={styles.controlBtn}>→</button>
                    </div>
                )}
            </div>
        </div>
    );
}
