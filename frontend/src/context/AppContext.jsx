import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import axios from "axios";
import appLogoAsset from "../assets/image.png";

export const DEPARTMENTS = [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Electronics & Telecommunication Engineering",
    "Computer Science & Engineering",
    "Instrumentation Engineering",
    "Industrial & Production Engineering",
    "Electronics & Communication Engineering",
    "Information Technology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Humanities & Social Sciences",
    "Training & Placement Cell",
    "Alumni Association",
    "Other"
];

const AppContext = createContext(null);

// Helper: check if a JWT token is expired
function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // exp is in seconds; Date.now() is in milliseconds
        return payload.exp * 1000 < Date.now();
    } catch {
        return true; // malformed token — treat as expired
    }
}

export function AppProvider({ children }) {
    const [dashboardStats, setDashboardStats] = useState(null);
    const [page, setPage] = useState(() => {
        const token = sessionStorage.getItem("token");
        const user = sessionStorage.getItem("user");
        if (token && user && !isTokenExpired(token)) return "APP";
        return "HOME";
    });
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = sessionStorage.getItem("user");
        const token = sessionStorage.getItem("token");
        // Clear the session immediately if the token is expired
        if (isTokenExpired(token)) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            return null;
        }
        return saved ? JSON.parse(saved) : null;
    });
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [pendingAlumni, setPendingAlumni] = useState([]);
    const [confirmState, setConfirmState] = useState({ show: false, title: "", message: "", onResolve: null });
    const [posts, setPosts] = useState([]);
    const [tab, setTab] = useState(() => {
        const savedTab = sessionStorage.getItem("activeTab");
        if (savedTab) return savedTab;

        const savedUser = sessionStorage.getItem("user");
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.role === "ROLE_ALUMNI" || user.role === "ROLE_STUDENT") return "dashboard";
            if (user.role === "ROLE_ADMIN") return "overview";
            return "manage-admins";
        }
        return "feed";
    });

    useEffect(() => {
        window.confirm = () => true;
        window.alert = () => {};
    }, []);

    useEffect(() => {
        if (page === "APP") {
            sessionStorage.setItem("activeTab", tab);
        }
    }, [tab, page]);
    const [toast, setToast] = useState(null);

    const [eventRegistrations, setEventRegistrations] = useState([]);

    const [faqs, setFaqs] = useState([]);
    const [socialLinks, setSocialLinks] = useState([]);
    // cmsLoading: true while the initial CMS fetch is in-flight
    const [cmsLoading, setCmsLoading] = useState(true);
    const [footerConfig, setFooterConfig] = useState({
        appName: "AeciansConnect",
        appLogo: appLogoAsset,
        email: "cse@aec.ac.in",
        phone: "+91 73990 14471",
        address: "CSE Department, Assam Engineering College, Jalukbari, Guwahati, Assam 781013",
        officeHours: "Mon–Fri, 9 AM – 5 PM",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14324.789139529367!2d91.65213193498964!3d26.15777123960012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a4358a5996f2d%3A0x6a0e633d7d740520!2sAssam%20Engineering%20College!5e0!3m2!1sen!2sin!4v1716301416303!5m2!1sen!2sin"
    });

    // ── Content Management (Dynamic) ─────────────────────
    const [galleryImages, setGalleryImages] = useState([]);

    const [aboutContent, setAboutContent] = useState({
        heroTitle: "Built for the community, by the community",
        heroSub: "AlumniConnect is a dedicated portal that makes it effortless for students to reach the right seniors and for alumni to support their community.",
        missionTitle: "No student should graduate without a network.",
        missionText: "We believe every student deserves access to the wisdom and connections of their seniors. AlumniConnect makes that possible at scale — verified, structured, and meaningful.",
        visionTitle: "Empowering the next generation of global Aecians.",
        visionText: "Our vision is to build the world's most engaged and supportive college alumni network, where every graduate is just one message away from a life-changing opportunity.",
        values: [
            { icon: "🤝", title: "Trust", desc: "Every profile is admin-verified so students know they're talking to real alumni." },
            { icon: "🌱", title: "Growth", desc: "We empower careers — from first job to startup founder." },
            { icon: "💡", title: "Openness", desc: "Knowledge sharing is free and ungated for all students." },
            { icon: "🎯", title: "Impact", desc: "We measure success by the number of lives and careers we help shape." },
        ],
        features: [
            { icon: "💼", title: "Job & Referral Board", desc: "Alumni post openings and referral opportunities. Students apply directly — no middleman." },
            { icon: "🧑‍🏫", title: "Mentorship", desc: "Book 1-on-1 mentorship sessions with seniors in your target field. Real guidance from real experience." },
            { icon: "📡", title: "Webinars & Events", desc: "Alumni host live sessions on careers, skills, and industry trends. Students attend for free." },
            { icon: "💡", title: "Alumni Directory", desc: "Browse the verified alumni network, filter by company, batch, or tech stack and reach out instantly." },
            { icon: "🔒", title: "Admin Verified", desc: "Every alumni account goes through an admin approval process, ensuring the network remains trusted." },
            { icon: "🌙", title: "Dark Mode & More", desc: "Beautiful UI with light/dark mode, collapsible sidebar, and a LinkedIn-style profile for everyone." }
        ]
    });

    const [contactInfo, setContactInfo] = useState({
        email: "cse@aec.ac.in",
        phone: "+91 73990 14471",
        address: "CSE Department, Assam Engineering College, Jalukbari, Guwahati, Assam 781013",
        hours: "Mon–Fri, 9 AM – 5 PM",
        socials: [
            "🔗 LinkedIn — AEC CSE Department",
            "🐦 Twitter — @AECGuwahati",
            "📸 Instagram — @aec.guwahati"
        ]
    });

    const [homeContent, setHomeContent] = useState({
        badge: "🎓 College Alumni Network",
        titleMain: "Connect. Grow.",
        titleGradient: "Support Community.",
        subtext: "AecianConnect bridges students with alumni for mentorship, referrals, jobs, and real-world guidance — all on one platform.",
        // bgImages intentionally empty — populated by backend CMS.
        // Keeping it empty means HeroSlider shows a skeleton instead of stock photos.
        bgImages: []
    });

    const [newsItems, setNewsItems] = useState([]);
    const [notableAlumni, setNotableAlumni] = useState([]);
    const [givingInitiatives, setGivingInitiatives] = useState([]);
    const [alumniServices, setAlumniServices] = useState([]);
    const [messageDeskItems, setMessageDeskItems] = useState([]);

    const [connections, setConnections] = useState([]);
    const [sentConnections, setSentConnections] = useState([]);

    const [myNotifications, setMyNotifications] = useState([]);
    const [mentorshipRequests, setMentorshipRequests] = useState([]);
    const [careerRequests, setCareerRequests] = useState([]);
    const [incomingCareerRequests, setIncomingCareerRequests] = useState([]);

    const connectedAlumniIds = [
        ...connections.filter(c => c.status === "ACCEPTED").map(c => c.sender?.id),
        ...sentConnections.filter(c => c.status === "ACCEPTED").map(c => c.receiver?.id)
    ].filter(id => id && id !== currentUser?.id);



    useEffect(() => {
        async function fetchCmsData() {
            const endpoints = [
                { key: 'gallery', url: "/cms/gallery", setter: setGalleryImages },
                { key: 'news', url: "/cms/news", setter: setNewsItems },
                { key: 'alumni', url: "/cms/notable-alumni", setter: setNotableAlumni },
                { key: 'services', url: "/cms/alumni-services", setter: setAlumniServices },
                { key: 'faqs', url: "/cms/faqs", setter: setFaqs },
                { key: 'socials', url: "/cms/social-links", setter: setSocialLinks },
                {
                    key: 'footer', url: "/cms/footer-config", setter: (data) => {
                        // Force the bundled transparent logo asset
                        data.appLogo = appLogoAsset;
                        setFooterConfig(data);
                    }
                },
                { key: 'home', url: "/cms/home-config", setter: (data) => { if (data) setHomeContent(data); } },
                { key: 'messages', url: "/cms/message-desk", setter: setMessageDeskItems }
            ];

            try {
                await Promise.allSettled(endpoints.map(async (e) => {
                    try {
                        const res = await api.get(e.url);
                        if (e.key === 'footer' || e.key === 'home') {
                            if (res.data) e.setter(res.data);
                        } else {
                            if (Array.isArray(res.data)) {
                                e.setter(res.data);
                            } else {
                                console.warn(`CMS Fetch for ${e.key} returned non-array data:`, res.data);
                                e.setter([]);
                            }
                        }
                    } catch (err) {
                        console.warn(`CMS Fetch failed for ${e.key}:`, err.message);
                    }
                }));
            } catch (err) {
                console.error("Critical error in fetchCmsData:", err);
            } finally {
                setCmsLoading(false);
            }
        }
        fetchCmsData();
    }, []);

    useEffect(() => {
        if (footerConfig.appName) {
            document.title = `${footerConfig.appName} – College Alumni Portal`;
        }
        if (footerConfig.appLogo && (footerConfig.appLogo.startsWith("http") || footerConfig.appLogo.startsWith("data:image/"))) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = footerConfig.appLogo;
        }
    }, [footerConfig]);

    useEffect(() => {
        async function fetchUserData() {
            if (!currentUser) return;
            try {
                // Fetch connection requests for everyone
                const [connReq, sentReq, postsReq, alumniReq] = await Promise.all([
                    api.get("/connections/my-requests"),
                    api.get("/connections/sent"),
                    api.get("/posts"),
                    api.get("/alumni")
                ]);
                setConnections(connReq.data);
                setSentConnections(sentReq.data);
                setPosts(postsReq.data);
                setUsers(alumniReq.data);

                let notifications = connReq.data
                    .filter(c => c.status === "PENDING")
                    .map(c => ({
                        id: `conn-${c.id}`,
                        relatedEntityId: c.id,
                        targetUserId: currentUser.id,
                        type: "CONNECTION_REQUEST",
                        message: `${c.sender.name} sent you a connection request.`,
                        createdAt: new Date().toISOString(),
                        read: false,
                        source: "local"
                    }));

                if (currentUser.role === "ROLE_ADMIN" || currentUser.role === "ROLE_SUPER_ADMIN" || currentUser.role === "ROLE_ALUMNI") {
                    try {
                        const notifReq = await api.get("/notifications/my-notifications");
                        const backendNotifs = notifReq.data.map(n => ({
                            ...n,
                            id: n.id,
                            source: "backend"
                        }));
                        notifications = [...backendNotifs, ...notifications];
                    } catch (err) {
                        console.error("Failed to load backend notifications", err);
                    }
                }

                if (currentUser.role === "ROLE_ADMIN" || currentUser.role === "ROLE_SUPER_ADMIN") {
                    fetchPendingAlumni();
                }

                setMyNotifications(notifications);

                // Fetch Mentorship Requests (Incoming & Sent) & Career Requests (Incoming & Sent) from Spring Boot backend
                const [incMent, sentMent, myCareer, incCareer] = await Promise.all([
                    api.get("/mentorship/requests"),
                    api.get("/mentorship/sent"),
                    api.get("/career/my-requests", { params: { userId: currentUser.id } }),
                    api.get("/career/incoming-requests", { params: { userId: currentUser.id } })
                ]);
                setMentorshipRequests([...incMent.data, ...sentMent.data]);
                setCareerRequests(myCareer.data);
                setIncomingCareerRequests(incCareer.data);
            } catch (err) {
                console.error("Failed to load user data", err);
            }
        }
        fetchUserData();
    }, [currentUser]);



    async function updateGallery(newItem) {
        try {
            const res = await api.post("/cms/gallery", newItem);
            setGalleryImages(res.data);
            notify("Gallery updated", "ok", true);
        } catch (e) { notify("Error updating gallery", "err"); }
    }
    function updateAbout(newContent) { setAboutContent(newContent); notify("About page updated locally!", "ok", true); }
    function updateContact(newInfo) { setContactInfo(newInfo); notify("Contact info updated locally!", "ok", true); }
    async function updateHome(newContent) {
        try {
            const res = await api.post("/cms/home-config", newContent);
            setHomeContent(res.data);
            notify("Home page updated successfully!", "ok", true);
        } catch (e) {
            notify("Error updating home page", "err");
        }
    }
    async function updateNews(news) {
        try {
            const res = await api.post("/cms/news", news);
            setNewsItems(prev => [res.data, ...prev]);
            notify("News story published successfully!", "ok");
        } catch (e) { notify("Error adding news", "err"); }
    }
    async function editNews(item) {
        try {
            const res = await api.put(`/cms/news/${item.id}`, item);
            setNewsItems(prev => prev.map(n => n.id === res.data.id ? res.data : n));
            notify("News story updated successfully!", "ok");
        } catch (e) { notify("Error updating news", "err"); }
    }
    async function removeNews(id) {
        try {
            await api.delete(`/cms/news/${id}`);
            setNewsItems(prev => prev.filter(n => n.id !== id));
            notify("News story removed", "ok", true);
        } catch (e) { notify("Error removing news", "err"); }
    }
    async function updateNotableAlumni(newItem) {
        try {
            const res = await api.post("/cms/notable-alumni", newItem);
            setNotableAlumni(prev => [...prev, res.data]);
            notify("Notable alumnus added successfully!", "ok", true);
        } catch (e) { notify("Error adding alumnus", "err"); }
    }
    async function editNotableAlumni(item) {
        try {
            const res = await api.put(`/cms/notable-alumni/${item.id}`, item);
            setNotableAlumni(prev => prev.map(a => a.id === res.data.id ? res.data : a));
            notify("Alumnus details updated", "ok", true);
        } catch (e) { notify("Error updating alumnus", "err"); }
    }
    async function removeNotableAlumni(id) {
        try {
            await api.delete(`/cms/notable-alumni/${id}`);
            setNotableAlumni(prev => prev.filter(a => a.id !== id));
            notify("Alumnus removed from showcase", "ok", true);
        } catch (e) { notify("Error removing alumnus", "err"); }
    }
    async function updateGiving(newItem) {
        try {
            const res = await api.post("/cms/giving-initiatives", newItem);
            setGivingInitiatives(prev => [...prev, res.data]);
            notify("Initiative added!", "ok", true);
        } catch (e) { notify("Error adding service", "err"); }
    }
    async function updateServices(newItem) {
        try {
            const res = await api.post("/cms/alumni-services", newItem);
            setAlumniServices(prev => [...prev, res.data]);
            notify("Service added!", "ok", true);
        } catch (e) { notify("Error adding service", "err"); }
    }

    async function updateFaq(item) {
        try {
            const res = await api.post("/cms/faqs", item);
            setFaqs(prev => {
                const idx = prev.findIndex(f => f.id === res.data.id);
                if (idx > -1) {
                    const next = [...prev];
                    next[idx] = res.data;
                    return next;
                }
                return [...prev, res.data];
            });
            notify("FAQ saved!", "ok", true);
        } catch (e) { notify("Error saving FAQ", "err"); }
    }

    async function deleteFaq(id) {
        try {
            await api.delete(`/cms/faqs/${id}`);
            setFaqs(prev => prev.filter(f => f.id !== id));
            notify("FAQ removed.", "ok", true);
        } catch (e) { notify("Error removing FAQ", "err"); }
    }

    async function updateSocialLink(item) {
        try {
            const res = await api.post("/cms/social-links", item);
            setSocialLinks(prev => {
                const idx = prev.findIndex(s => s.id === res.data.id);
                if (idx > -1) {
                    const next = [...prev];
                    next[idx] = res.data;
                    return next;
                }
                return [...prev, res.data];
            });
            notify("Social link saved!", "ok", true);
        } catch (e) { notify("Error saving social link", "err"); }
    }

    async function deleteSocialLink(id) {
        try {
            await api.delete(`/cms/social-links/${id}`);
            setSocialLinks(prev => prev.filter(s => s.id !== id));
            notify("Link removed.");
        } catch (e) { notify("Error removing link", "err"); }
    }

    async function saveFooterConfig(config) {
        try {
            const res = await api.post("/cms/footer-config", config);
            const data = res.data;
            // Force the high-fidelity transparent logo if the backend is stuck on the old asset
            if (!data.appLogo || data.appLogo.includes("image.png") || data.appLogo.includes("assets/")) {
                data.appLogo = "/aec_logo_v1.png";
            }
            setFooterConfig(data);
            notify("Footer settings updated!", "ok", true);
        } catch (e) { notify("Error saving footer settings", "err"); }
    }

    /* ── Message Desk CRUD ── */
    async function updateMessageDesk(item) {
        try {
            const res = item.id
                ? await api.put(`/cms/message-desk/${item.id}`, item)
                : await api.post("/cms/message-desk", item);

            setMessageDeskItems(prev => {
                const idx = prev.findIndex(m => m.id === res.data.id);
                if (idx > -1) {
                    const next = [...prev];
                    next[idx] = res.data;
                    return next;
                }
                return [...prev, res.data];
            });
            notify("Message desk updated!", "ok", true);
        } catch (e) {
            console.error("Message Desk API Error:", e.response?.data || e.message);
            notify("Error saving message", "err");
        }
    }

    async function deleteMessageDesk(id) {
        try {
            await api.delete(`/cms/message-desk/${id}`);
            setMessageDeskItems(prev => prev.filter(m => m.id !== id));
            notify("Message removed", "ok", true);
        } catch (e) { notify("Error removing message", "err"); }
    }

    // ── Sidebar toggle (persisted) ────────────────────────
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        return localStorage.getItem("sidebarOpen") !== "false";
    });
    function toggleSidebar() {
        setSidebarOpen(prev => {
            localStorage.setItem("sidebarOpen", String(!prev));
            return !prev;
        });
    }

    // ── Theme toggle (persisted) ──────────────────────────
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });
    function toggleTheme() {
        setTheme(prev => {
            const next = prev === "light" ? "dark" : "light";
            localStorage.setItem("theme", next);
            return next;
        });
    }

    // Apply theme to document root
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    function playSound(type) {
        const sounds = {
            notif: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
            sent: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
            success: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
            neutral: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
        };
        if (sounds[type]) {
            try {
                const audio = new Audio(sounds[type]);
                audio.volume = 0.4;
                // Add error listener to catch cache errors silently
                audio.onerror = () => console.warn(`Sound playback failed for ${type} (likely cache issue)`);
                audio.play().catch(() => { }); // Ignore autoplay blocks
            } catch (e) {
                console.warn("Audio Context error", e);
            }
        }
    }

    function notify(msg, type = "ok", silent = false) {
        setToast({ msg, type });
        if (!silent) playSound("notif");
        setTimeout(() => setToast(null), 3500);
    }

    /* ── Auth ─────────────────────────────────────────── */
    async function login(email, password, department) {
        try {
            const res = await api.post("/auth/login", { email, password, department });
            if (res.data.status === "OTP_REQUIRED") {
                notify("Login initiated. Please enter the OTP sent to your email.", "ok", true);
                return { ok: true, otpRequired: true, email: res.data.email };
            }

            const { token, ...userData } = res.data;
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", JSON.stringify(userData));
            setCurrentUser(userData);

            // Redirect based on role
            if (userData.role === "ROLE_ALUMNI" || userData.role === "ROLE_STUDENT") setTab("dashboard");
            else if (userData.role === "ROLE_ADMIN") setTab("overview");
            else setTab("manage-admins"); // ROLE_SUPER_ADMIN

            setPage("APP");
            notify("Login successful!", "ok", true);
            return { ok: true };
        } catch (err) {
            const errMsg = err.response?.data?.message || "Login failed";
            notify(errMsg, "err", true);
            return { ok: false, error: errMsg };
        }
    }

    async function confirmLoginOtp(email, otp, department) {
        try {
            const res = await api.post("/auth/login/verify", { email, otp, department });
            const { token, ...userData } = res.data;

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", JSON.stringify(userData));
            setCurrentUser(userData);

            // Redirect based on role
            if (userData.role === "ROLE_ALUMNI" || userData.role === "ROLE_STUDENT") setTab("dashboard");
            else if (userData.role === "ROLE_ADMIN") setTab("overview");
            else setTab("manage-admins"); // ROLE_SUPER_ADMIN

            setPage("APP");
            notify("Login successful!", "ok", true);
            return { ok: true };
        } catch (err) {
            const errMsg = err.response?.data?.message || "Invalid or expired OTP";
            notify(errMsg, "err", true);
            return { ok: false, error: errMsg };
        }
    }

    function logout() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("activeTab");
        setCurrentUser(null);
        setPage("HOME");
    }

    const bulkRegisterAlumni = async (data) => {
        try {
            const res = await api.post("/admin/bulk-register", data);
            notify(`${res.data.length} Alumni imported successfully!`, "ok");
            fetchDirectory(); // Refresh the list
            return { ok: true };
        } catch (e) {
            console.error("Bulk Import Error:", e.response?.data || e.message);
            notify("Bulk import failed. Check data format.", "err");
            return { ok: false };
        }
    };

    const register = async (data) => {
        try {
            const res = await api.post('/auth/register', data);
            return { ok: true, data: res.data };
        } catch (err) {
            return { ok: false, message: err.response?.data?.message || 'Registration failed' };
        }
    };

    const forgotPassword = async (email) => {
        try {
            await api.post(`/auth/forgot-password?email=${email}`);
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.response?.data || 'Failed to send OTP' };
        }
    };

    const resetPassword = async (data) => {
        try {
            await api.post('/auth/reset-password', data);
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err.response?.data || 'Failed to reset password' };
        }
    };

    async function loginWithGoogle(idToken, role, department) {
        try {
            const res = await api.post("/auth/google", { idToken, role, department });
            const { token, ...userData } = res.data;

            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", JSON.stringify(userData));
            setCurrentUser(userData);

            // Redirect based on role
            if (userData.role === "ROLE_ALUMNI" || userData.role === "ROLE_STUDENT") setTab("dashboard");
            else if (userData.role === "ROLE_ADMIN") setTab("overview");
            else setTab("manage-admins");

            setPage("APP");
            notify("Google login successful!", "ok", true);
            return { ok: true };
        } catch (err) {
            const errMsg = err.response?.data?.message || "Google login failed";
            notify(errMsg, "err");
            return { ok: false, error: errMsg };
        }
    }

    /* ── Alumni CRUD ──────────────────────────────────── */
    async function fetchPendingAlumni() {
        try {
            const res = await api.get("/admin/pending");
            setPendingAlumni(res.data);
        } catch (err) {
            notify("Failed to fetch pending alumni", "err");
        }
    }

    async function fetchDashboardStats() {
        try {
            const res = await api.get("/admin/dashboard/stats");
            setDashboardStats(res.data);
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
        }
    }

    async function approve(id) {
        try {
            await api.put(`/admin/approve/${id}`);
            setPendingAlumni(prev => prev.filter(u => u.id !== id));
            // Also refresh stats
            fetchDashboardStats();
        } catch (err) {
            notify("Approval failed", "err");
        }
    }

    async function reject(id) {
        try {
            await api.put(`/admin/reject/${id}`);
            setPendingAlumni(prev => prev.filter(u => u.id !== id));
            fetchDashboardStats();
        } catch (err) {
            notify("Rejection failed", "err");
        }
    }

    async function updateProfile(data) {
        try {
            const res = await api.put(`/alumni/${currentUser.id}`, data);
            setCurrentUser(prev => ({ ...prev, ...res.data }));
            sessionStorage.setItem("user", JSON.stringify({ ...currentUser, ...res.data }));
            notify("Profile updated!");
        } catch (err) {
            notify("Update failed", "err");
        }
    }

    /* ── Directory ────────────────────────────────────── */
    async function fetchDirectory(filters = {}) {
        try {
            const res = await api.get("/alumni", { params: filters });
            setUsers(res.data);
        } catch (err) {
            notify("Failed to fetch directory", "err");
        }
    }

    /* ── Connections ───────────────────────────────────── */
    async function sendConnectionRequest(receiverId) {
        try {
            const res = await api.post("/connections/send", { receiverId });
            setSentConnections(prev => [...prev, res.data]);
            const receiver = users.find(u => u.id === receiverId);
            setMyNotifications(prev => [{
                id: `local-conn-send-${res.data.id}`,
                relatedEntityId: res.data.id,
                targetUserId: currentUser.id,
                type: "CONNECTION_REQUEST",
                message: `Connection request sent to ${receiver?.name || "an alumni"}. Waiting for response.`,
                createdAt: new Date().toISOString(),
                read: false,
                source: "local"
            }, ...prev]);
            playSound("sent");
            notify("Connection request sent!");
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Failed to send connection request";
            notify(typeof msg === "string" ? msg : "Request already sent", "err");
        }
    }

    async function handleConnectionResponse(connId, status) {
        try {
            const res = await api.put(`/connections/${connId}`, { status });
            setConnections(prev => prev.map(c => c.id === connId ? res.data : c));
            setSentConnections(prev => prev.map(c => c.id === connId ? res.data : c));
            const connection = res.data;
            const sender = connection?.sender;
            const receiver = connection?.receiver;
            setMyNotifications(prev => [{
                id: `local-conn-${status.toLowerCase()}-${connId}`,
                relatedEntityId: connId,
                targetUserId: currentUser.id,
                type: status === "ACCEPTED" ? "CONNECTION_ACCEPTED" : "CONNECTION_REJECTED",
                message: status === "ACCEPTED"
                    ? `You accepted the connection request from ${sender?.name || "an alumni"}.`
                    : `You declined the connection request from ${sender?.name || "an alumni"}.`,
                createdAt: new Date().toISOString(),
                read: false,
                source: "local"
            }, ...prev]);
            if (status === "ACCEPTED") playSound("success");
            else playSound("neutral");
            notify(`Connection ${status.toLowerCase()}.`);
        } catch (err) {
            notify("Failed to update connection", "err");
        }
    }

    /* ── Posts ────────────────────────────────────────── */
    async function fetchPosts() {
        try {
            const res = await api.get("/posts");
            setPosts(res.data);
        } catch (err) {
            notify("Failed to fetch posts", "err");
        }
    }

    async function addPost(data) {
        try {
            const res = await api.post("/posts", data);
            setPosts(prev => [res.data, ...prev]);
            notify("Post published!");
        } catch (err) {
            notify("Failed to publish post", "err");
        }
    }

    async function deletePost(id) {
        try {
            await api.delete(`/posts/${id}`);
            setPosts(prev => prev.filter(p => p.id !== id));
            notify("Post deleted.");
        } catch (err) {
            notify("Failed to delete post", "err");
        }
    }

    /* ── Mentorship Requests (Spring Boot) ───────────────── */
    async function sendMentorshipRequest(mentorId, postId, message) {
        try {
            const res = await api.post("/mentorship/request", {
                mentorId,
                postId,
                message
            });
            setMentorshipRequests(prev => [res.data, ...prev]);
            notify("Mentorship request sent!");
        } catch (err) {
            notify("Failed to send request", "err");
        }
    }

    async function respondToMentorship(requestId, status) {
        try {
            const res = await api.put(`/mentorship/respond/${requestId}`, { status });
            setMentorshipRequests(prev => prev.map(r => r.id === requestId ? res.data : r));
            notify(`Request ${status.toLowerCase()}.`);
        } catch (err) {
            notify("Action failed", "err");
        }
    }

    /* ── Career Requests (Spring Boot) ──────────────────── */
    async function sendCareerRequest(postId, type) {
        try {
            const res = await api.post("/career/request", null, {
                params: { postId, userId: currentUser.id, type }
            });
            setCareerRequests(prev => [res.data, ...prev]);
            notify(type === "REFERRAL_REQUEST" ? "Referral request sent!" : "Application submitted!", "ok");
            playSound("sent");
        } catch (err) {
            notify(err.response?.data || "Failed to submit request", "err");
        }
    }

    async function respondToCareerRequest(requestId, status) {
        try {
            const res = await api.patch(`/career/request/${requestId}/status`, null, {
                params: { status }
            });
            setCareerRequests(prev => prev.map(r => r.id === requestId ? res.data : r));
            setIncomingCareerRequests(prev => prev.map(r => r.id === requestId ? res.data : r));
            notify(`Request status updated to ${status.toLowerCase()}.`);
        } catch (err) {
            notify("Action failed", "err");
        }
    }

    async function updatePost(id, data) {
        try {
            const res = await api.put(`/posts/${id}`, data);
            setPosts(prev => prev.map(p => p.id === id ? res.data : p));
            notify("Post updated successfully!");
        } catch (err) {
            notify("Failed to update post", "err");
        }
    }


    /* ── Notifications ─────────────────────────────────── */
    async function markNotificationRead(id) {
        const notif = myNotifications.find(n => n.id === id);
        if (notif && notif.source === "backend") {
            try {
                await api.put(`/notifications/${id}/read`);
            } catch (err) {
                console.error("Failed to mark notification as read on backend", err);
            }
        }
        setMyNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }

    async function clearNotifications() {
        setMyNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }

    /* ── Super Admin ──────────────────────────────────── */
    async function fetchAdmins() {
        try {
            const res = await api.get("/superadmin/admins");
            setAdmins(res.data);
        } catch (err) {
            notify("Failed to fetch admins", "err");
        }
    }

    async function revokeAdminAccess(userId) {
        try {
            await api.put(`/superadmin/revoke-admin/${userId}`);
            notify("Administrative access revoked. User returned to Alumnus status.", "ok");
            if (String(userId) === String(currentUser?.id)) {
                logout();
            } else {
                await fetchAdmins();
                await fetchDirectory(); // Refresh directory to show them as Alumnus again
            }
            return { ok: true };
        } catch (err) {
            notify(err.response?.data?.message || "Failed to revoke access", "err");
            return { ok: false };
        }
    }

    async function assignAdmin(userId, department) {
        try {
            await api.put(`/superadmin/assign-admin/${userId}`, { department });
            notify("Alumnus successfully assigned as Department Admin", "ok");
            await fetchAdmins(); // Refresh admin list
            return { ok: true };
        } catch (err) {
            notify(err.response?.data?.message || "Failed to assign admin", "err");
            return { ok: false };
        }
    }

    async function updateAdminDepartment(adminId, department) {
        try {
            await api.put(`/superadmin/users/${adminId}/department`, { department });
            notify("Department updated successfully", "ok");
            await fetchAdmins();
            return { ok: true };
        } catch (err) {
            notify("Failed to update department", "err");
            return { ok: false };
        }
    }

    async function updateUserDepartment(userId, department) {
        try {
            const res = await api.put(`/superadmin/users/${userId}/department`, { department });
            notify("User department updated successfully", "ok");
            // Refresh local users list if needed
            setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
            return { ok: true };
        } catch (err) {
            notify("Failed to update user department", "err");
            return { ok: false };
        }
    }

    async function fetchAlumniOnly() {
        try {
            const res = await api.get("/alumni");
            // AlumniService already filters for ROLE_ALUMNI and APPROVED, 
            // but we'll double check here just in case.
            return res.data.filter(u => u.role === "ROLE_ALUMNI");
        } catch (err) {
            notify("Failed to fetch alumni list", "err");
            return [];
        }
    }

    /* ── Event Management (Admin) ─────────────────────── */
    async function fetchEventRegistrations(eventId) {
        try {
            const res = await api.get(`/events/${eventId}/registrations`);
            setEventRegistrations(res.data);
        } catch (err) {
            notify("Failed to fetch participants", "err");
        }
    }

    async function deleteEventRegistration(regId) {
        try {
            await api.delete(`/events/registrations/${regId}`);
            setEventRegistrations(prev => prev.filter(r => r.id !== regId));
            notify("Registration removed", "ok");
        } catch (err) {
            notify("Failed to remove registration", "err");
        }
    }

    async function deleteAdmin(id) {
        try {
            await api.delete(`/superadmin/delete-admin/${id}`);
            setAdmins(prev => prev.filter(u => u.id !== id));
            notify("Admin account deleted.");
        } catch (err) {
            notify("Failed to delete admin", "err");
        }
    }

    async function promoteAdmin(id) {
        try {
            await api.put(`/superadmin/promote/${id}`);
            notify("User promoted to Super Admin!", "ok");
            fetchAdmins(); // Refresh list to reflect changes
            return true;
        } catch (err) {
            notify(err.response?.data?.message || "Promotion failed", "err");
            return false;
        }
    }

    async function deleteUser(id) {
        try {
            await api.delete(`/admin/users/${id}`);
            if (String(id) === String(currentUser?.id)) {
                logout();
            } else {
                setUsers(prev => prev.filter(u => u.id !== id));
                await fetchAdmins();
            }
        } catch (err) {
            notify(err.response?.data?.message || "Failed to delete user", "err");
        }
    }




    /* ── Data Export ──────────────────────────────────── */
    async function exportAlumni(dept = null) {
        try {
            // Restrict export to super admin or admin
            if (currentUser?.role !== "ROLE_SUPER_ADMIN" && currentUser?.role !== "ROLE_ADMIN") {
                notify("Access denied: Only Administrators can export user data", "err");
                return;
            }

            const params = dept ? { dept } : {};
            const res = await api.get("/admin/export", { params, responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            const filename = dept ? `alumni_${dept}_${new Date().toISOString().slice(0, 10)}.xlsx` : `alumni_all_${new Date().toISOString().slice(0, 10)}.xlsx`;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            notify("Export failed", "err");
        }
    }

    async function changePassword(oldPassword, newPassword) {
        try {
            await api.post("/auth/change-password", { oldPassword, newPassword });
            notify("Password updated successfully.", "ok");
            return true;
        } catch (error) {
            notify(error.response?.data || "Failed to update password.", "err");
            return false;
        }
    }

    /* ── Confirmation Modal System ──────────────────────── */
    const confirm = (title, message) => {
        return Promise.resolve(true);
    };

    return (
        <AppContext.Provider value={{
            page, setPage, currentUser,
            users, posts,
            cmsLoading,
            tab, setTab, toast,
            sidebarOpen, toggleSidebar,
            theme, toggleTheme,
            login, logout, register, forgotPassword, resetPassword, loginWithGoogle,
            confirmLoginOtp,
            assignAdmin, fetchAlumniOnly,
            approve, reject, updateProfile,
            changePassword,
            fetchPendingAlumni, pendingAlumni, fetchDirectory,
            fetchDashboardStats, dashboardStats,
            fetchPosts, addPost, updatePost,
            fetchEventRegistrations, deleteEventRegistration,
            eventRegistrations,
            fetchAdmins, admins, revokeAdminAccess, promoteAdmin, updateAdminDepartment, updateUserDepartment,
            deleteUser, deletePost, exportAlumni, bulkRegisterAlumni,
            connections, myNotifications, connectedAlumniIds, sentConnections,
            galleryImages, aboutContent, contactInfo, homeContent,
            newsItems, notableAlumni, givingInitiatives, alumniServices, messageDeskItems,
            faqs, socialLinks, footerConfig,
            updateGallery, updateAbout, updateContact, updateHome,
            updateNews, editNews, removeNews, updateNotableAlumni, editNotableAlumni, removeNotableAlumni, updateGiving, updateServices,
            updateMessageDesk, deleteMessageDesk,
            updateFaq, deleteFaq, updateSocialLink, deleteSocialLink, saveFooterConfig,
            handleConnectionResponse, sendConnectionRequest,
            markNotificationRead, clearNotifications,
            mentorshipRequests, sendMentorshipRequest, respondToMentorship,
            careerRequests, incomingCareerRequests, sendCareerRequest, respondToCareerRequest,
            notify, confirm, confirmState
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() { return useContext(AppContext); }
