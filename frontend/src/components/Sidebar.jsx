import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import AvatarImg from "./AvatarImg";
import styles from "./Sidebar.module.css";

const navContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const navItemVariants = {
    hidden: { opacity: 0, x: -18 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const NAV = {
    ROLE_SUPER_ADMIN: [
        { key: "overview", icon: "📊", label: "Dashboard" },
        { key: "manage-admins", icon: "🛡️", label: "Manage Admins" },
        { key: "alumni-central", icon: "🏛️", label: "Alumni Central" },
        { key: "events", icon: "📅", label: "Manage Events" },
        { key: "content-management", icon: "⚙️", label: "Content Management" },
        { key: "profile", icon: "👤", label: "My Profile", badge: "admin-alerts" },
    ],
    ROLE_ADMIN: [
        { key: "overview", icon: "📊", label: "Dashboard" },
        { key: "alumni-central", icon: "🏛️", label: "Alumni Central" },
        { key: "events", icon: "📅", label: "Manage Events" },
        { key: "profile", icon: "👤", label: "My Profile", badge: "admin-alerts" },
    ],
    ROLE_ALUMNI: [
        { key: "dashboard", icon: "🏠", label: "Dashboard" },
        { key: "networking-hub", icon: "👥", label: "Networking Hub" },
        { key: "feed", icon: "📰", label: "Community & Jobs" },
        { key: "profile", icon: "👤", label: "Your Profile", badge: "unread-notifs" },
        { key: "services", icon: "🛠️", label: "Alumni Services" },
    ],
};

export default function Sidebar() {
    const { currentUser, tab, setTab, logout, users, pendingAlumni, sidebarOpen, toggleSidebar, myNotifications = [], footerConfig } = useApp();
    const role = currentUser?.role;
    const navs = NAV[role] || [];

    const pendingCount = pendingAlumni.length;

    const unreadCount = myNotifications.filter(n => !n.read).length;

    function getBadge(b) {
        if (b === "pending") return pendingCount;
        if (b === "unread-notifs") return unreadCount;
        if (b === "admin-alerts") return unreadCount + pendingCount;
        return 0;
    }

    return (
        <>
            {!sidebarOpen && (
                <button
                    className={styles.expandBtn}
                    onClick={toggleSidebar}
                    title="Expand sidebar"
                >
                    ▶
                </button>
            )}

            <aside className={`${styles.sidebar}${sidebarOpen ? "" : ` ${styles.collapsed}`}`}>
                <div className={styles.brand}>
                    <div
                        className={styles.brandIcon}
                        style={{ background: 'transparent', boxShadow: 'none' }}
                    >
                        {footerConfig.appLogo ? (
                            <img src={footerConfig.appLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "4px" }} />
                        ) : (
                            "🎓"
                        )}
                    </div>
                    <div className={styles.brandText}>
                        <div className={styles.brandName}>{footerConfig.appName || "AecianConnect"}</div>
                        <div className={styles.brandSub}>Career Tracking</div>
                    </div>
                    <button
                        className={styles.toggleBtn}
                        onClick={toggleSidebar}
                        title="Collapse sidebar"
                    >
                        ◀
                    </button>
                </div>

                <motion.div
                    className={styles.section}
                    variants={navContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className={styles.sectionLabel}>Navigation</div>
                    {navs.map(({ key, icon, label, badge }) => {
                        const count = badge ? getBadge(badge) : 0;
                        return (
                            <motion.button
                                key={key}
                                variants={navItemVariants}
                                className={`${styles.navItem}${tab === key ? ` ${styles.active}` : ""}`}
                                onClick={() => {
                                    setTab(key);
                                    if (window.innerWidth < 1024) toggleSidebar();
                                }}
                                title={label}
                                whileHover={{ x: 4, transition: { duration: 0.15 } }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className={styles.navIcon}>{icon}</span>
                                <span className={styles.navLabel}>{label}</span>
                                {count > 0 && <span className={styles.navBadge}>{count}</span>}
                            </motion.button>
                        );
                    })}
                </motion.div>

                <div className={styles.footer}>
                    <div className={styles.userPill}>
                        <AvatarImg
                            user={currentUser}
                            size="sm"
                            className={styles.userAvatar}
                        />
                        <div className={styles.userPillInfo}>
                            <div className={styles.userName}>{currentUser?.name}</div>
                            <div className={styles.userRole}>
                                {role === 'ROLE_SUPER_ADMIN' ? 'System Super Admin' :
                                    role === 'ROLE_ADMIN' ? 'Department Admin' : 'Alumni'}
                            </div>
                        </div>
                    </div>
                    <motion.button
                        className={styles.signOutBtn}
                        onClick={logout}
                        title="Sign Out"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        🚪 <span className={styles.signOutLabel}>Sign Out</span>
                    </motion.button>
                </div>
            </aside >
        </>
    );
}
