import React from "react";
import { useApp } from "../context/AppContext";
import AvatarImg from "./AvatarImg";
import { fmtDateTime } from "../utils/helpers";

/**
 * CareerManager: Component for alumni to manage incoming job applications and referral requests.
 */
export default function CareerManager() {
    const { incomingCareerRequests = [], respondToCareerRequest, currentUser, users, posts } = useApp();

    const getApplicant = (req) => req.applicant || users.find(u => u.id === req.applicant_id) || {};
    const getPost = (req) => req.post || posts.find(p => p.id === req.post_id) || {};

    if (incomingCareerRequests.length === 0) {
        return (
            <div className="empty-state-mini" style={{
                textAlign: 'center', padding: '32px', background: 'var(--gray-50)',
                borderRadius: '12px', border: '1px dashed var(--gray-200)', color: 'var(--gray-400)'
            }}>
                <p>No active career applications or referral requests yet.</p>
            </div>
        );
    }

    return (
        <div className="career-manager" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--indigo)', marginBottom: '8px' }}>
                📩 Incoming Career Requests ({incomingCareerRequests.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incomingCareerRequests.map(req => {
                    const applicant = getApplicant(req);
                    const post = getPost(req);
                    const isReferral = req.requestType === "REFERRAL_REQUEST";

                    return (
                        <div key={req.id} className="card" style={{ padding: '20px', borderRadius: '12px', background: 'white', border: '1px solid var(--gray-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <AvatarImg user={applicant} className="avatar avatar-md" />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>
                                            {applicant.name || "Alumni / Student"}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                                            {applicant.designation || "Student"} {applicant.company ? `@ ${applicant.company}` : ""}
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                            <span className="batch-badge" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                                Batch {applicant.batch || "N/A"}
                                            </span>
                                            {applicant.department && (
                                                <span className="batch-badge" style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--indigo-50)', color: 'var(--indigo)' }}>
                                                    {applicant.department}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                    <span className="type-badge" style={{
                                        fontSize: '11px',
                                        background: isReferral ? 'var(--indigo-100)' : 'var(--emerald-100)',
                                        color: isReferral ? 'var(--indigo-700)' : 'var(--emerald-700)'
                                    }}>
                                        {isReferral ? "🤝 Referral Request" : "💼 Application"}
                                    </span>
                                    <span className="type-badge" style={{
                                        fontSize: '11px',
                                        background: req.status === 'REFERRED' || req.status === 'APPLIED' ? 'var(--men-bg)' : (req.status === 'REJECTED' ? 'var(--req-rej-bg)' : 'var(--req-pend-bg)'),
                                        color: req.status === 'REFERRED' || req.status === 'APPLIED' ? 'var(--men-c)' : (req.status === 'REJECTED' ? 'var(--req-rej-c)' : 'var(--req-pend-c)')
                                    }}>
                                        {req.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginTop: '14px', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '8px', fontSize: '13px' }}>
                                <div style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Target Opportunity:</div>
                                <div style={{ color: 'var(--gray-900)', marginTop: '2px', fontWeight: 600 }}>{post.title || "Untitled Post"}</div>
                                {post.company && <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Company: {post.company}</div>}
                            </div>

                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                                    Submitted {fmtDateTime(req.createdAt)}
                                </span>
                                {req.status === "PENDING" && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className="btn btn-green btn-sm"
                                            onClick={() => respondToCareerRequest(req.id, isReferral ? "REFERRED" : "APPLIED")}
                                        >
                                            {isReferral ? "✓ Mark Referred" : "✓ Mark Applied"}
                                        </button>
                                        <button 
                                            className="btn btn-red btn-sm"
                                            onClick={() => respondToCareerRequest(req.id, "REJECTED")}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
