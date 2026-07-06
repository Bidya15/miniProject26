import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useApp, DEPARTMENTS } from "../context/AppContext";
import styles from "./Login.module.css";

export default function Login() {
    const [role, setRole] = useState("ALUMNI"); // "ALUMNI", "ADMIN", "SUPER_ADMIN"
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [branch, setBranch] = useState("");
    const [otp, setOtp] = useState("");
    const [method, setMethod] = useState("password"); // "password" or "otp"
    const [step, setStep] = useState("credentials"); // "credentials" or "otp-verify"
    const [showPass, setShowPass] = useState(false);
    const [busy, setBusy] = useState(false);
    const [timer, setTimer] = useState(0);
    
    const { login, confirmLoginOtp, loginWithGoogle, setPage, footerConfig, notify, api } = useApp();

    async function handlePasswordLogin(e) {
        e.preventDefault();
        if (!email.trim() || !pass) return notify("Please enter both email and password", "err", true);
        if (role !== "SUPER_ADMIN" && !branch) return notify("Please select your branch", "err", true);
        setBusy(true);
        const res = await login(email.trim(), pass, role === "SUPER_ADMIN" ? "" : branch, role);
        setBusy(false);
        if (res.ok) {
            if (res.otpRequired) setStep("otp-verify");
        }
    }

    async function handleOtpOnlyRequest(e) {
        if (e) e.preventDefault();
        if (role !== "SUPER_ADMIN" && !branch) return notify("Please select your branch", "err", true);
        if (!email.trim()) return notify("Please enter your email", "err", true);
        if (timer > 0) return;
        setBusy(true);
        try {
            await api.post("/auth/send-otp", null, { params: { email: email.trim() } });
            notify("Login code sent to your email!", "ok", true);
            setStep("otp-verify");
            setTimer(60);
            const interval = setInterval(() => {
                setTimer(t => {
                    if (t <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        } catch (err) {
            notify(err.response?.data || "Failed to send OTP", "err", true);
        } finally {
            setBusy(false);
        }
    }

    async function handleVerify(e) {
        e.preventDefault();
        if (!otp) return notify("Please enter the 6-digit code", "err", true);
        setBusy(true);
        const res = await confirmLoginOtp(email.trim(), otp, role === "SUPER_ADMIN" ? "" : branch);
        setBusy(false);
    }

    return (
        <div className={styles.authOuter}>
            <div className={styles.authCard}>
                <button className={styles.closeBtn} onClick={() => setPage("HOME")} title="Back to Home">✕</button>

                <div className={styles.authBrand}>
                    <div className={styles.authBrandIcon}>
                        {footerConfig.appLogo ? (
                            <img src={footerConfig.appLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        ) : "🎓"}
                    </div>
                    <div>
                        <div className={styles.authTitle}>{footerConfig.appName || "AecianConnect"}</div>
                        <div className={styles.authSub}>Central Tracking System Login</div>
                    </div>
                </div>

                <div className={styles.roleTabs}>
                    <button 
                        type="button"
                        className={`${styles.roleTab} ${role === 'ALUMNI' ? styles.active : ''}`}
                        onClick={() => setRole('ALUMNI')}
                    >
                        🎓 Alumni
                    </button>
                    <button 
                        type="button"
                        className={`${styles.roleTab} ${role === 'ADMIN' ? styles.active : ''}`}
                        onClick={() => setRole('ADMIN')}
                    >
                        ⚙️ Dept Admin
                    </button>
                    <button 
                        type="button"
                        className={`${styles.roleTab} ${role === 'SUPER_ADMIN' ? styles.active : ''}`}
                        onClick={() => setRole('SUPER_ADMIN')}
                    >
                        🛡️ Super Admin
                    </button>
                </div>

                <div className={styles.methodSelector}>
                    <button 
                        className={`${styles.methodBtn} ${method === 'password' ? styles.active : ''}`}
                        onClick={() => { setMethod('password'); setStep('credentials'); }}
                    >
                        🔑 Password
                    </button>
                    <button 
                        className={`${styles.methodBtn} ${method === 'otp' ? styles.active : ''}`}
                        onClick={() => { setMethod('otp'); setStep('credentials'); }}
                    >
                        📧 Email OTP
                    </button>
                </div>

                {step === "credentials" ? (
                    <>
                        <form onSubmit={method === "password" ? handlePasswordLogin : handleOtpOnlyRequest}>
                            {role !== "SUPER_ADMIN" && (
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Branch / Department</label>
                                    <select 
                                        className={styles.inp} 
                                        value={branch} 
                                        onChange={e => setBranch(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose Branch *</option>
                                        {DEPARTMENTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email Address</label>
                                <input className={styles.inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" required />
                            </div>

                            {method === "password" && (
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className={styles.inp}
                                            type={showPass ? "text" : "password"}
                                            value={pass}
                                            onChange={e => setPass(e.target.value)}
                                            placeholder="••••••••"
                                            style={{ paddingRight: '42px' }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(p => !p)}
                                            className={styles.togglePassBtn}
                                        >
                                            {showPass ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {method === "password" && (
                                <div className={styles.forgotPassRow}>
                                    <button type="button" className={styles.linkBtn} onClick={() => setPage("FORGOT_PASSWORD")}>
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <button className={styles.btnPrimary} type="submit" disabled={busy}>
                                {busy ? "Working..." : (method === "password" ? "Sign In →" : "Send Login Code →")}
                            </button>
                        </form>

                        <div className={styles.divider}><span>OR</span></div>
                        
                        <div className={styles.googleBox}>
                            <GoogleLogin
                                onSuccess={credentialResponse => {
                                    if (role !== "SUPER_ADMIN" && !branch) return notify("Please select your branch", "err", true);
                                    setBusy(true);
                                    loginWithGoogle(
                                        credentialResponse.credential,
                                        role === "SUPER_ADMIN" ? "ROLE_SUPER_ADMIN" : role === "ADMIN" ? "ROLE_ADMIN" : "ROLE_ALUMNI",
                                        role === "SUPER_ADMIN" ? "" : branch
                                    ).finally(() => setBusy(false));
                                }}
                                onError={() => notify("Google Login Failed", "err", true)}
                                // useOneTap disabled to prevent multiple GSI_LOGGER warnings in dev
                            />
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleVerify}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Verification Code</label>
                            <p className={styles.otpHint}>We've sent a 6-digit code to <strong>{email}</strong></p>
                            <input
                                className={styles.inp}
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>

                        <button className={styles.btnPrimary} type="submit" disabled={busy}>
                            {busy ? "Verifying..." : "Complete Login →"}
                        </button>

                        <div className={styles.otpActions}>
                            <button type="button" className={styles.linkBtn} onClick={() => setStep("credentials")}>
                                ← Back
                            </button>
                            <span className={styles.sep}>|</span>
                            <button 
                                type="button" 
                                className={styles.linkBtn} 
                                disabled={timer > 0}
                                onClick={method === "password" ? handlePasswordLogin : handleOtpOnlyRequest}
                            >
                                {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                            </button>
                        </div>
                    </form>
                )}

                <p className={styles.registerLink}>
                    Don't have an account?{" "}
                    <button className={styles.linkBtn} onClick={() => setPage("REGISTER")}>Register Here →</button>
                </p>
            </div>
        </div>
    );
}
