import { useState } from "react";
import { useApp } from "../context/AppContext";
import s from "./Footer.module.css";

export default function Footer() {
    const { setPage, faqs, socialLinks, footerConfig } = useApp();
    const [openIdx, setOpenIdx] = useState(-1);

    const getIcon = (platform) => {
        const p = platform.toLowerCase();
        // Brand Icons (Standard 24x24 paths)
        if (p.includes("linkedin")) return <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
        if (p.includes("twitter") || p.includes("x")) return <path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768m2.46-2.46L20 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
        if (p.includes("instagram")) return <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></g>;
        if (p.includes("facebook")) return <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
        if (p.includes("youtube")) return <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" ry="2" /><path d="M10 15l5-3-5-3z" /></g>;
        if (p.includes("website") || p.includes("globe")) return <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></g>;
        return <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />;
    };

    const fallbackSocials = [
        { platform: "Facebook", url: "https://www.facebook.com/AssamEngineeringCollegeOfficial/" },
        { platform: "Instagram", url: "https://www.instagram.com/aec_guwahati/" },
        { platform: "X", url: "https://twitter.com/AECGuwahati" }
    ];

    const displaySocials = [...socialLinks];
    fallbackSocials.forEach(fs => {
        if (!displaySocials.some(ds => ds.platform.toLowerCase() === fs.platform.toLowerCase())) {
            displaySocials.push(fs);
        }
    });

    return (
        <footer className={s.footer}>
            <div className={s.container}>
                {/* ── FAQ Section ── */}
                {faqs.length > 0 && (
                    <div className={s.faqSection}>
                        <h2 className={s.faqSectionTitle}>Frequently Asked Questions</h2>
                        <div className={s.faqList}>
                            {faqs.map((f, i) => (
                                <div key={f.id || i} className={`${s.faqItem} ${openIdx === i ? s.open : ""}`}>
                                    <button className={s.faqQuestion} onClick={() => setOpenIdx(openIdx === i ? -1 : i)}>
                                        <span>{f.question || f.q}</span>
                                        <svg
                                            className={s.faqIcon}
                                            width="20" height="20"
                                            viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor"
                                            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </button>
                                    {openIdx === i && <div className={s.faqAnswer}>{f.answer || f.a}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(faqs.length > 0) && <div className={s.divider} />}

                <div className={s.grid}>
                    <div className={s.brand}>
                        <div className={s.logo}>
                            {footerConfig.appLogo ? (
                                <img
                                    src={footerConfig.appLogo}
                                    alt="Logo"
                                    style={{
                                        height: "50px",
                                        width: "auto",
                                        marginRight: "10px",
                                        verticalAlign: "middle",
                                        background: "transparent"
                                    }}
                                />
                            ) : null}
                            {footerConfig.appName || "AecianConnect"}
                        </div>
                        <p className={s.desc}>The premier gateway for college alumni to post jobs, mentorship signals, and support their alma mater's student community.</p>
                        <div className={s.socials}>
                            {displaySocials.map(soc => (
                                <a key={soc.id || soc.platform} href={soc.url} className={s.socLink} target="_blank" rel="noopener noreferrer" title={soc.platform} data-platform={soc.platform.toLowerCase()}>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        {getIcon(soc.platform)}
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className={s.col}>
                        <h4>Quick Links</h4>
                        <button onClick={() => setPage("HOME")}>Home</button>
                        <button onClick={() => setPage("ABOUT")}>About Us</button>
                        <button onClick={() => setPage("GALLERY")}>Campus Gallery</button>
                        <button onClick={() => setPage("CONTACT")}>Contact</button>
                    </div>

                    <div className={s.col}>
                        <h4>Support</h4>
                        <button onClick={() => setOpenIdx(0)}>FAQ</button>
                        <button onClick={() => setPage("PRIVACY")}>Privacy Policy</button>
                        <button onClick={() => setPage("TERMS")}>Terms of Service</button>
                    </div>

                    <div className={s.col}>
                        <h4>Institution</h4>
                        <a href="https://aec.ac.in" target="_blank" rel="noreferrer">AEC Website</a>
                        <a href="https://aec.ac.in/departments/computer-science-and-engineering" target="_blank" rel="noreferrer">CSE Department</a>
                        <a href="https://aec.ac.in/placements" target="_blank" rel="noreferrer">AEC Placements</a>
                        <button onClick={() => window.open("#")}>Feedback</button>
                    </div>

                    <div className={s.col}>
                        <h4>Location</h4>
                        <div className={s.miniMapWrap}>
                            <iframe
                                title="Mini Map"
                                src={footerConfig.mapUrl}
                                width="100%"
                                height="120"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className={s.bottom}>
                    <p>© {new Date().getFullYear()} {footerConfig.appName || "AecianConnect"} · Built with ❤️ for the Alumni Association
                    </p>
                    <p>Developed by <a href="#">Bidya SR</a> , <a href="#">Rishov B</a> & <a href="#">Sosangkar S</a></p>
                    <p>Batch: 2023-2027</p>
                </div>

            </div>
        </footer>
    );
}
