import s from "./Legal.module.css";
import { useApp } from "../context/AppContext";

export default function Terms() {
    const { setPage } = useApp();

    return (
        <div className={s.page}>
            <section className={s.hero}>
                <div className={s.heroContent}>
                    <span className={s.badge}>Guidelines</span>
                    <h1 className={s.heroTitle}>Terms of <span className={s.gradientText}>Service</span></h1>
                    <p className={s.heroSub}>
                        By using AecianConnect, you agree to follow the community standards of Assam Engineering College.
                    </p>
                    <div className={s.heroBtns}>
                        <button className={s.primaryBtn} onClick={() => setPage("HOME")}>Return Home</button>
                    </div>
                </div>
            </section>

            <section className={s.contentSection}>
                <div className={s.container}>
                    <div className={s.glassCard}>
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing AecianConnect, you acknowledge that you have read and agreed to these terms. This platform is strictly for professional and institutional networking.</p>

                        <h2>2. Eligible Users</h2>
                        <p>Access is restricted to verified alumni and current students of Assam Engineering College. Misrepresentation of your affiliation may result in immediate account suspension.</p>

                        <h2>3. Professional Conduct</h2>
                        <p>All interactions on this platform must remain professional and respectful. Harassment, spamming, or sharing harmful content is strictly prohibited.</p>

                        <h2>4. Job & Mentorship Integrity</h2>
                        <p>Users participating in the Job Portal or Mentorship program must provide accurate information. Referral requests should be handled with professional integrity.</p>

                        <h2>5. Intellectual Property</h2>
                        <p>The "AecianConnect" brand and all original content are the property of the Alumni Association. Users retain rights to their own posts but grant the portal a license to display them.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
