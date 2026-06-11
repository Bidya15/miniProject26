import React from 'react';
import { useApp } from '../context/AppContext';
import AvatarImg from './AvatarImg';
import { fmtDateTime } from '../utils/helpers';

/**
 * MentorshipManager: Component for alumni to manage incoming mentorship requests.
 */
export default function MentorshipManager() {
    const { mentorshipRequests = [], respondToMentorship, currentUser, users, posts, setTab } = useApp();

    // Filter incoming requests for the current alumni mentor
    const incoming = mentorshipRequests.filter(r => (r.mentor?.id || r.mentor_id) === currentUser?.id);
    // Filter outgoing requests
    const outgoing = mentorshipRequests.filter(r => (r.mentee?.id || r.mentee_id) === currentUser?.id);

    const getMentee = (req) => req.mentee || users.find(u => u.id === req.mentee_id) || {};
    const getPost = (req) => req.post || posts.find(p => p.id === req.post_id) || {};

    if (incoming.length === 0 && outgoing.length === 0) {
        return (
            <div className="empty-state-mini">
                <p>No active mentorship requests yet.</p>
            </div>
        );
    }

    return (
        <div className="mentorship-manager">
            {incoming.length > 0 && (
                <div className="manager-section" style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--indigo)' }}>📩 Incoming Requests</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {incoming.map(req => {
                            const mentee = getMentee(req);
                            const post = getPost(req);
                            return (
                                <div key={req.id} className="card" style={{ padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <AvatarImg user={mentee} className="avatar avatar-sm" />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '13px' }}>{mentee.name || 'Student'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Requested: {post.title}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {req.status === 'ACCEPTED' && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    style={{ padding: '2px 8px', fontSize: '11px' }}
                                                    onClick={(e) => { e.stopPropagation(); setTab("messages"); }}
                                                >
                                                    💬 Message
                                                </button>
                                            )}
                                            <span className={`type-badge`} style={{
                                                fontSize: '10px',
                                                background: req.status === 'ACCEPTED' ? 'var(--men-bg)' : (req.status === 'REJECTED' ? 'var(--req-rej-bg)' : 'var(--req-pend-bg)'),
                                                color: req.status === 'ACCEPTED' ? 'var(--men-c)' : (req.status === 'REJECTED' ? 'var(--req-rej-c)' : 'var(--req-pend-c)')
                                            }}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                    {req.message && (
                                        <div style={{ marginTop: '10px', padding: '8px', background: 'var(--gray-50)', borderRadius: '6px', fontSize: '12px', color: 'var(--gray-600)' }}>
                                            "{req.message}"
                                        </div>
                                    )}
                                    <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--gray-400)' }}>
                                        Sent {fmtDateTime(req.createdAt || req.created_at)}
                                    </div>
                                    {req.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <button className="btn btn-green btn-full btn-sm" onClick={() => respondToMentorship(req.id, 'ACCEPTED')}>Accept</button>
                                            <button className="btn btn-red btn-full btn-sm" onClick={() => respondToMentorship(req.id, 'REJECTED')}>Decline</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {outgoing.length > 0 && (
                <div className="manager-section">
                    <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--gray-500)' }}>📤 Your Requests</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {outgoing.map(req => {
                            const post = getPost(req);
                            return (
                                <div key={req.id} className="card" style={{ padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{post.title}</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {req.status === 'ACCEPTED' && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    style={{ padding: '2px 8px', fontSize: '11px' }}
                                                    onClick={(e) => { e.stopPropagation(); setTab("messages"); }}
                                                >
                                                    💬 Message
                                                </button>
                                            )}
                                            <span className={`type-badge`} style={{
                                                fontSize: '10px',
                                                background: req.status === 'ACCEPTED' ? 'var(--men-bg)' : (req.status === 'REJECTED' ? 'var(--req-rej-bg)' : 'var(--req-pend-bg)'),
                                                color: req.status === 'ACCEPTED' ? 'var(--men-c)' : (req.status === 'REJECTED' ? 'var(--req-rej-c)' : 'var(--req-pend-c)')
                                            }}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--gray-400)' }}>
                                        Status updated: {fmtDateTime(req.updatedAt || req.updated_at)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
