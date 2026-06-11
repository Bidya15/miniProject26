import s from "./Legal.module.css";
import { useApp } from "../context/AppContext";

export default function Privacy() {
    const { setPage } = useApp();

    return (
        <div className={s.page}>
            <section className={s.hero}>
                <div className={s.heroContent}>
                    <span className={s.badge}>Legal & Privacy</span>
                    <h1 className={s.heroTitle}>Privacy <span className={s.gradientText}>Policy</span></h1>
                    <p className={s.heroSub}>
                        Your trust is our priority. Learn how AecianConnect protects and manages your data.
                    </p>
                    <div className={s.heroBtns}>
                        <button className={s.primaryBtn} onClick={() => setPage("HOME")}>Return Home</button>
                    </div>
                </div>
            </section>

            <section className={s.contentSection}>
                <div className={s.container}>
                    <div className={s.glassCard}>
                        <h2>1. Information We Collect</h2>
                        <p>We collect information you provide directly to us when you create an account, update your profile, or communicate with other alumni. This includes your name, email address, batch year, department, and professional details.</p>

                        <h2>2. How We Use Your Data</h2>
                        <p>Your data is used to facilitate networking, mentorship, and job opportunities within the AEC community. We do not sell your personal information to third parties.</p>

                        <h2>3. Verification Process</h2>
                        <p>To maintain a trusted network, all alumni accounts are verified by administrators. During this process, we may cross-reference your details with institutional records.</p>

                        <h2>4. Data Security</h2>
                        <p>We implement industry-standard security measures to protect your digital identity. This includes encryption, secure API endpoints, and regular system audits.</p>

                        <h2>5. Your Rights</h2>
                        <p>You have the right to access, update, or delete your profile at any time. For significant data requests, please contact the CSE Department administration.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
