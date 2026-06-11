import { useState } from "react";
import { useApp } from "../context/AppContext";
import styles from "./ForgotPassword.module.css";

export default function ForgotPassword() {
    const { forgotPassword, resetPassword, setPage, footerConfig } = useApp();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Pass
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [showPass, setShowPass] = useState(false);

    async function handleRequestOtp(e) {
        e.preventDefault();
        setErr("");
        setBusy(true);
        const res = await forgotPassword(email.trim());
        setBusy(false);
        if (res.ok) {
            setStep(2);
            setMsg("OTP sent to your email. Please check your inbox.");
        } else {
            setErr(res.error || "Failed to send reset link. Please check the email.");
        }
    }

    async function handleReset(e) {
        e.preventDefault();
        setErr("");
        if (newPass !== confirmPass) {
            setErr("Passwords do not match.");
            return;
        }
        if (newPass.length < 8) {
            setErr("Password must be at least 8 characters.");
            return;
        }

        setBusy(true);
        const res = await resetPassword({ email: email.trim(), otp: otp.trim(), newPassword: newPass });
        setBusy(false);
        if (res.ok) {
            setStep(3); // Success
        } else {
            setErr(res.error || "Reset failed. Invalid OTP or session expired.");
        }
    }

    return (
        <div className={styles.authOuter}>
            <div className={styles.authCard}>
                <button className={styles.closeBtn} onClick={() => setPage("LOGIN")} title="Back to Login">✕</button>

                <div className={styles.authBrand}>
                    <div className={styles.authBrandIcon} style={footerConfig.appLogo ? { background: 'none', boxShadow: 'none' } : {}}>
                        {footerConfig.appLogo ? (
                            <img src={footerConfig.appLogo} alt="Logo" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "contain" }} />
                        ) : "🎓"}
                    </div>
                    <div>
                        <div className={styles.authTitle}>{footerConfig.appName || "AecianConnect"}</div>
                        <div className={styles.authSub}>Account Recovery Portal</div>
                    </div>
                </div>

                {step === 1 && (
                    <>
                        <h2 className={styles.stepTitle}>Forgot Password?</h2>
                        <p className={styles.stepDesc}>Enter your registered email address to receive a 6-digit verification code.</p>
                        <form onSubmit={handleRequestOtp}>
                            {err && <div className={styles.errBox}>⚠️ {err}</div>}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email Address</label>
                                <input
                                    className={styles.inp}
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@college.edu"
                                    required
                                />
                            </div>
                            <button className={styles.btnPrimary} type="submit" disabled={busy}>
                                {busy ? "Sending Code..." : "Send Reset Code →"}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 className={styles.stepTitle}>Verify & Reset</h2>
                        <p className={styles.stepDesc}>We've sent a code to <strong>{email}</strong>. Enter the code and your new password below.</p>
                        <form onSubmit={handleReset}>
                            {msg && <div className={styles.msgBox}>✅ {msg}</div>}
                            {err && <div className={styles.errBox}>⚠️ {err}</div>}

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>6-Digit OTP</label>
                                <input
                                    className={styles.inp}
                                    type="text"
                                    maxLength="6"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    placeholder="000000"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className={styles.inp}
                                        type={showPass ? "text" : "password"}
                                        value={newPass}
                                        onChange={e => setNewPass(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ paddingRight: '45px' }}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPass(!showPass)}
                                        style={{ 
                                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', 
                                            padding: '4px', opacity: 0.7, filter: 'grayscale(1)'
                                        }}
                                        title={showPass ? "Hide Password" : "Show Password"}
                                    >
                                        {showPass ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className={styles.inp}
                                        type={showPass ? "text" : "password"}
                                        value={confirmPass}
                                        onChange={e => setConfirmPass(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ paddingRight: '45px' }}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPass(!showPass)}
                                        style={{ 
                                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', 
                                            padding: '4px', opacity: 0.7, filter: 'grayscale(1)'
                                        }}
                                        title={showPass ? "Hide Password" : "Show Password"}
                                    >
                                        {showPass ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>
                            <button className={styles.btnPrimary} type="submit" disabled={busy}>
                                {busy ? "Resetting..." : "Reset Password →"}
                            </button>
                        </form>
                    </>
                )}

                {step === 3 && (
                    <div className={styles.successWrapper}>
                        <div className={styles.successIcon}>🎉</div>
                        <h2 className={styles.stepTitle}>Password Reset!</h2>
                        <p className={styles.stepDesc}>Your password has been successfully updated. You can now use your new credentials to sign in.</p>
                        <button className={styles.btnPrimary} onClick={() => setPage("LOGIN")}>Go to Login →</button>
                    </div>
                )}

                <div className={styles.footerLink}>
                    <button className={styles.linkBtn} onClick={() => setPage("LOGIN")}>← Remembered password? Sign in</button>
                </div>
            </div>
        </div>
    );
}
