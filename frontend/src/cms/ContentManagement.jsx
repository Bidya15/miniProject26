import { useState } from "react";
import Home from "../pages/Home";
import About from "../pages/About";
import Gallery from "../pages/Gallery";
import Contact from "../pages/Contact";
import GivingHub from "../dashboard/GivingHub";
import AlumniServices from "../dashboard/AlumniServices";
import ManageJobs from "./ManageJobs";
import ManageMentorship from "./ManageMentorship";
import ManageNews from "./ManageNews";
import ManageNotableAlumni from "./ManageNotableAlumni";
import ManageHomeImages from "./ManageHomeImages";
import ManageFooter from "./ManageFooter";
import ManageEvents from "./ManageEvents";
import ManageCoordinators from "./ManageCoordinators";
import ManageTestimonials from "./ManageTestimonials";
import ManageMessages from "./ManageMessages";
import { Pending, ManageAlumni, ManagePosts, DraggableBox } from "../dashboard/Admin";
import styles from "../dashboard/dashboard.module.css";

export default function ContentManagement() {
    const [activeSubTab, setActiveSubTab] = useState("home");

    const SUB_TABS = [
        { id: "approvals", label: "✅ Approvals", color: "#f59e0b" },
        { id: "users", label: "👥 User Directory", color: "#3b82f6" },
        { id: "posts", label: "📝 Alumni Feed", color: "#10b981" },
        { id: "jobs", label: "💼 Career Hub", color: "#059669" },
        { id: "mentorship", label: "🤝 Mentorship", color: "#6366f1" },
        { id: "news", label: "🌟 Success Stories", color: "#4f46e5" },
        { id: "home", label: "🏡 Home Page", color: "#4f46e5" },
        { id: "home-images", label: "🖼️ Home Images", color: "#059669" },
        { id: "about", label: "📄 About Page", color: "#0891b2" },
        { id: "gallery", label: "🖼️ Gallery", color: "#059669" },
        { id: "contact", label: "📞 Contact Info", color: "#d946ef" },
        { id: "footer", label: "🗺️ Footer CMS", color: "#6366f1" },
        { id: "giving", label: "💝 Giving Hub", color: "#ec4899" },
        { id: "services", label: "🛠️ Alumni Services", color: "#64748b" },
        { id: "coordinators", label: "👔 Coordinators", color: "#3b82f6" },
        { id: "testimonials", label: "💬 Alumni Feedback", color: "#ec4899" },
        { id: "messages", label: "🎙️ Message Desk", color: "#f59e0b" },
    ];

    function renderContent() {
        switch (activeSubTab) {
            case "approvals": return <Pending />;
            case "users": return <ManageAlumni />;
            case "posts": return <ManagePosts />;
            case "jobs": return <ManageJobs />;
            case "mentorship": return <ManageMentorship />;
            case "news": return <ManageNews />;
            case "notable": return <ManageNotableAlumni />;
            case "home": return <Home />;
            case "home-images": return <ManageHomeImages />;
            case "about": return <About />;
            case "gallery": return <Gallery />;
            case "contact": return <Contact />;
            case "footer": return <ManageFooter />;
            case "giving": return <GivingHub />;
            case "services": return <AlumniServices />;
            case "coordinators": return <ManageCoordinators />;
            case "testimonials": return <ManageTestimonials />;
            case "messages": return <ManageMessages />;
            default: return <Pending />;
        }
    }

    return (
        <div className={styles.cmContainer}>
            <div className={styles.cmHeader}>
                <div className={styles.cmHeaderInfo}>
                    <h2 className={styles.cmTitle}>Unified Management Console</h2>
                    <p className={styles.cmSub}>Central control point for all portal content, user access, and community interactions</p>
                </div>
            </div>

            <DraggableBox className={styles.cmNav}>
                {SUB_TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.cmNavBtn}${activeSubTab === tab.id ? ` ${styles.active}` : ""}`}
                        onClick={() => setActiveSubTab(tab.id)}
                        style={{ "--accent": tab.color }}
                    >
                        {tab.label}
                    </button>
                ))}
            </DraggableBox>

            <div className={styles.cmViewPort}>
                {renderContent()}
            </div>
        </div>
    );
}
