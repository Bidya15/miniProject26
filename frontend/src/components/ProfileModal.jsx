import { avatarColor } from "../utils/helpers";
import AvatarImg from "./AvatarImg";
import s from "./ProfileModal.module.css";

/**
 * LinkedIn-style full profile modal.
 * Props: u (user object), onClose (fn)
 */
export default function ProfileModal({ u, onClose }) {
    if (!u) return null;

    const tags = u.tech_stack
        ? u.tech_stack.split(",").map(t => t.trim()).filter(Boolean)
        : [];

    return (
        <div
            className={`overlay ${s.overlayTop}`}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className={s.card}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className={s.closeBtn}
                    aria-label="Close"
                >✕</button>

                {/* Cover banner */}
                <div className={s.coverBanner} />

                {/* Avatar + top info row */}
                <div className={s.topInfoRow}>
                    {/* Avatar sits on the banner edge */}
                    <div className={s.avatarWrap}>
                        <AvatarImg
                            user={u}
                            className={`avatar ${s.avatarLg}`}
                        />
                        {u.status === "APPROVED" && (
                            <div className={s.verifiedDot} title="Verified Alumni" />
                        )}
                    </div>

                    {/* Name block */}
                    <div className={s.nameBlock}>
                        <h2 className={s.nameHeading}>{u.name}</h2>
                        {(u.designation || u.company) && (
                            <div className={s.desigLine}>
                                {[u.designation, u.company].filter(Boolean).join(" at ")}
                            </div>
                        )}
                        <div className={s.metaRow}>
                            {u.location && <span>📍 {u.location}</span>}
                            {u.batch && <span>🎓 Batch {u.batch}</span>}
                            {u.degree && <span>📄 {u.degree}</span>}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className={s.actionRow}>
                        {u.linkedin_url && (
                            <a
                                href={u.linkedin_url}
                                target="_blank"
                                rel="noreferrer"
                                className={`btn btn-primary btn-sm ${s.linkedinBtn}`}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.3c-1 0-1.7-.8-1.7-1.7s.7-1.7 1.7-1.7 1.7.8 1.7 1.7-.7 1.7-1.7 1.7zm13.5 11.3h-3v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.5h-3v-10h2.9v1.4c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7v5.5z" /></svg>
                                LinkedIn
                            </a>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={onClose}>✉️ Close</button>
                    </div>

                    <hr className={s.divider} />
                </div>

                <div className={s.body}>
                    {/* Bio section */}
                    {u.bio && (
                        <section>
                            <h3 className={s.sectionHead}>
                                <span className={s.sectionIcon}>💬</span> About
                            </h3>
                            <p className={s.bioText}>{u.bio}</p>
                        </section>
                    )}

                    {/* Details grid */}
                    <section>
                        <h3 className={`${s.sectionHead} ${s.sectionHeadMb}`}>
                            <span className={s.sectionIcon}>📋</span> Details
                        </h3>
                        <div className={s.detailGrid}>
                            {[
                                { icon: "📧", label: "Email", val: u.email },
                                { icon: "🎓", label: "Degree", val: u.degree },
                                { icon: "📅", label: "Batch Year", val: u.batch },
                                { icon: "🏢", label: "Company", val: u.company },
                                { icon: "💼", label: "Designation", val: u.designation },
                                { icon: "📍", label: "Location", val: u.location },
                            ].filter(f => f.val).map(f => (
                                <div key={f.label} className={s.detailCell}>
                                    <div className={s.detailLabel}>{f.icon} {f.label}</div>
                                    <div className={s.detailVal}>{f.val}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tech stack */}
                    {tags.length > 0 && (
                        <section>
                            <h3 className={`${s.sectionHead} ${s.sectionHeadMb}`}>
                                <span className={s.sectionIcon}>⚡</span> Skills &amp; Tech Stack
                            </h3>
                            <div className={`tags ${s.tagList}`}>
                                {tags.map(t => (
                                    <span key={t} className={`tag ${s.tagBig}`}>{t}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
