export function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function initials(name = "") {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_PALETTE = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];
export function avatarColor(name = "") {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

export function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export const POST_TYPE_META = {
    JOB: { label: "Job", icon: "💼", cls: "type-JOB" },
    REFERRAL: { label: "Referral", icon: "🤝", cls: "type-REFERRAL" },
    MENTORSHIP: { label: "Mentorship", icon: "🎓", cls: "type-MENTORSHIP" },
    WEBINAR: { label: "Webinar", icon: "🎬", cls: "type-WEBINAR" },
    SUCCESS_STORY: { label: "Success Story", icon: "🏆", cls: "type-SUCCESS" },
};
