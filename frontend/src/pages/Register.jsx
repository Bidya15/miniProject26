import { useState } from "react";
import { useApp, DEPARTMENTS } from "../context/AppContext";
import styles from "./Register.module.css";

function Success({ onBack }) {
    return (
        <div className={styles.authOuter}>
            <div className={styles.successCard}>
                <div className={styles.successIcon}>🎉</div>
                <h2 className={styles.successTitle}>Registration Submitted!</h2>
                <p className={styles.successMsg}>
                    Your alumni profile has been submitted for admin review.
                    You will be able to log in once your account is approved.
                </p>
                <button className={styles.btnPrimary} onClick={onBack}>Back to Login →</button>
            </div>
        </div>
    );
}

const F = ({ form, handleChange, label, name, type = "text", placeholder = "", req = false, full = false, isYear = false, isDegree = false, showPass, setShowPass }) => (
    <div className={`${styles.formGroup}${full ? ` ${styles.full}` : ""}`}>
        <label className={styles.formLabel}>{label}{req && " *"}</label>
        {isYear ? (
            <select
                className={styles.inp}
                value={form[name]}
                onChange={handleChange(name)}
                required={req}
            >
                <option value="">Select Year</option>
                {Array.from({ length: 70 }, (_, i) => new Date().getFullYear() + 5 - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        ) : isDegree ? (
            <select
                className={styles.inp}
                value={form[name]}
                onChange={handleChange(name)}
                required={req}
            >
                <option value="">Select Degree / Program</option>
                <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                <option value="M.Tech">M.Tech (Master of Technology)</option>
                <option value="MCA">MCA (Master of Computer Applications)</option>
                <option value="MBA">MBA (Master of Business Administration)</option>
                <option value="PhD">Ph.D. (Doctor of Philosophy)</option>
                <option value="Other">Other</option>
            </select>
        ) : name === "department" ? (
            <select
                className={styles.inp}
                value={form[name]}
                onChange={handleChange(name)}
                required={req}
            >
                <option value="">Choose Department *</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
        ) : (
            <div style={{ position: 'relative' }}>
                <input
                    className={styles.inp}
                    type={name === "password" ? (showPass ? "text" : "password") : type}
                    value={form[name]}
                    onChange={handleChange(name)}
                    placeholder={placeholder}
                    required={req}
                />
                {name === "password" && (
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
                )}
            </div>
        )}
    </div>
);

export default function Register() {
    const { register, setPage, footerConfig, notify } = useApp();
    const [done, setDone] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const [form, setForm] = useState({
        name: "", email: "", password: "", role: "ROLE_ALUMNI", batch: "", degree: "",
        department: "", company: "", designation: "", location: "", techStack: "", linkedinUrl: "",
    });
    const [customDegree, setCustomDegree] = useState("");

    function handleChange(k) {
        return e => setForm(f => ({ ...f, [k]: e.target.value }));
    }

    async function submit(e) {
        e.preventDefault();

        const required = ["name", "email", "password", "batch", "degree", "department"];
        for (const k of required) {
            if (!form[k]) {
                return notify(`${k.charAt(0).toUpperCase() + k.slice(1)} is required.`, "err", true);
            }
        }

        if (Number(form.batch) < 1900 || Number(form.batch) > new Date().getFullYear() + 5) {
            return notify("Please enter a valid graduation year.", "err", true);
        }

        let finalDegree = form.degree;
        if (form.degree === "Other") {
            if (!customDegree.trim()) {
                return notify("Please specify your custom degree.", "err", true);
            }
            finalDegree = customDegree.trim();
        }

        const payload = {
            ...form,
            batch: parseInt(form.batch),
            degree: finalDegree
        };

        const res = await register(payload);
        if (res.ok) {
            setDone(true);
            notify("Account created successfully! Awaiting admin approval.", "ok", true);
        } else {
            notify(res.message || "Registration failed. Please try again.", "err", true);
        }
    }

    if (done) return <Success onBack={() => setPage("LOGIN")} />;

    return (
        <div className={styles.authOuter}>
            <div className={styles.regCard}>
                <button className={styles.closeBtn} onClick={() => setPage("HOME")} title="Back to Home">✕</button>

                <div className={styles.authBrand}>
                    <div className={styles.authBrandIcon}>
                        {footerConfig.appLogo ? (
                            <img src={footerConfig.appLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        ) : "🎓"}
                    </div>
                    <div>
                        <div className={styles.authTitle}>{footerConfig.appName || "AecianConnect"}</div>
                        <div className={styles.authSub}>Join the central tracking system</div>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className={styles.infoBox}>
                        📋 Alumni accounts require <strong>admin approval</strong> before you can log in.
                    </div>
                    <div className={styles.regGrid}>
                        <F form={form} handleChange={handleChange} label="Full Name" name="name" req placeholder="e.g. Priya Sharma" />
                        <F form={form} handleChange={handleChange} label="Email Address" name="email" req type="email" placeholder="you@example.com" />
                        <F form={form} handleChange={handleChange} label="Password" name="password" req type="password" placeholder="Min 8 characters" showPass={showPass} setShowPass={setShowPass} />
                        <F form={form} handleChange={handleChange} label="Graduation Year" name="batch" req isYear />
                        <F form={form} handleChange={handleChange} label="Degree / Program" name="degree" req isDegree />
                        <F form={form} handleChange={handleChange} label="Department / Branch" name="department" req />
                        
                        {form.degree === "Other" && (
                            <div className={`${styles.formGroup} ${styles.full}`}>
                                <label className={styles.formLabel}>Please Specify Degree *</label>
                                <input
                                    className={styles.inp}
                                    placeholder="e.g. Ph.D. in AI"
                                    value={customDegree}
                                    onChange={e => setCustomDegree(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        
                        <F form={form} handleChange={handleChange} label="Current Company" name="company" placeholder="e.g. Google" />
                        <F form={form} handleChange={handleChange} label="Designation" name="designation" placeholder="e.g. Software Engineer" />
                        <F form={form} handleChange={handleChange} label="Location (City)" name="location" placeholder="e.g. Bangalore" />
                        
                        <div className={`${styles.formGroup} ${styles.full}`}>
                            <label className={styles.formLabel}>Tech Stack / Skills</label>
                            <input className={styles.inp} value={form.techStack} onChange={handleChange("techStack")} placeholder="e.g. React, Spring Boot, MySQL" />
                        </div>
                        <div className={`${styles.formGroup} ${styles.full}`}>
                            <label className={styles.formLabel}>LinkedIn Profile URL</label>
                            <input className={styles.inp} type="url" value={form.linkedinUrl} onChange={handleChange("linkedinUrl")} placeholder="https://linkedin.com/in/yourprofile" />
                        </div>
                    </div>

                    <div className={styles.btnRow}>
                        <button type="button" className={styles.btnOutline} onClick={() => setPage("LOGIN")}>← Back to Login</button>
                        <button type="submit" className={styles.btnPrimary}>Submit Registration →</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
