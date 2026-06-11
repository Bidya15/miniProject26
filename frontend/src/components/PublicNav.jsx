import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import styles from "./PublicNav.module.css";

/**
 * Shared glassmorphism navbar for all public pages (Home, About, Contact).
 * Props: activePage — current page string ("HOME" | "ABOUT" | "CONTACT")
 */
export default function PublicNav({ activePage }) {
    const { setPage, footerConfig } = useApp();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const links = [
        { label: "Home", page: "HOME" },
        { label: "About", page: "ABOUT" },
        { label: "Gallery", page: "GALLERY" },
        { label: "Contact", page: "CONTACT" },
    ];

    return (
        <motion.nav
            className={`${styles.nav}${scrolled ? ` ${styles.navScrolled}` : ""}`}
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Brand */}
            <motion.button
                onClick={() => { setPage("HOME"); setMobileMenuOpen(false); }}
                className={styles.brand}
            >
                <div
                    className={styles.brandIcon}
                    style={{ background: 'transparent', boxShadow: 'none', borderRadius: '0' }}
                >
                    {footerConfig.appLogo ? (
                        <img
                            src={footerConfig.appLogo}
                            alt="Logo"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                background: "transparent"
                            }}
                        />
                    ) : "🎓"}
                </div>
                <span className={styles.brandName}>
                    {footerConfig.appName || "AecianConnect"}
                </span>
            </motion.button>

            {/* Desktop Links */}
            <div className={styles.links}>
                {links.map((l, i) => (
                    <motion.button
                        key={l.page}
                        onClick={() => setPage(l.page)}
                        className={`${styles.navLink}${activePage === l.page ? ` ${styles.navLinkActive}` : ""}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.07, duration: 0.4 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {l.label}
                    </motion.button>
                ))}
            </div>

            {/* Desktop Auth Buttons */}
            <motion.div
                className={styles.authBtns}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <motion.button
                    onClick={() => setPage("LOGIN")}
                    className={styles.btnLogin}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >Log In</motion.button>
                <motion.button
                    onClick={() => setPage("REGISTER")}
                    className={styles.btnRegister}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >Register →</motion.button>
            </motion.div>

            {/* Mobile Hamburger Button */}
            <button
                className={`${styles.mobileToggle}${mobileMenuOpen ? ` ${styles.mobileToggleActive}` : ""}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className={styles.mobileLinks}>
                            {links.map((l) => (
                                <button
                                    key={l.page}
                                    className={`${styles.mobileNavLink}${activePage === l.page ? ` ${styles.mobileNavLinkActive}` : ""}`}
                                    onClick={() => { setPage(l.page); setMobileMenuOpen(false); }}
                                >
                                    {l.label}
                                </button>
                            ))}
                            <div className={styles.mobileDivider} />
                            <button className={styles.mobileAuthBtn} onClick={() => { setPage("LOGIN"); setMobileMenuOpen(false); }}>Log In</button>
                            <button className={`${styles.mobileAuthBtn} ${styles.primary}`} onClick={() => { setPage("REGISTER"); setMobileMenuOpen(false); }}>Register →</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
