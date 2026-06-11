import { useApp } from "../context/AppContext";
import { timeAgo } from "../utils/helpers";
import AvatarImg from "./AvatarImg";
import s from "./NotificationsView.module.css";

function NotificationsView() {
    const {
        myNotifications = [], markNotificationRead, clearNotifications,
        setTab, handleConnectionResponse, connections = [], sentConnections = [], users = [], currentUser,
        approve, reject, pendingAlumni = [], fetchPendingAlumni
    } = useApp();

    return (
        <div className={s.notifWrap}>
            <div className={s.notifHead}>
                <div>
                    <h2 className={s.notifTitle}>Notifications</h2>
                    <p className={s.notifSub}>Stay updated on your network and requests</p>
                </div>
                {myNotifications.some(n => !n.read) && (
                    <button className="btn btn-ghost btn-sm" onClick={clearNotifications}>Mark all as read</button>
                )}
            </div>

            {myNotifications.length === 0 ? (
                <div className={s.emptyStateCard}>
                    <div className={s.emptyIcon}>??</div>
                    <h3>All caught up!</h3>
                    <p>When you get new connection requests, approvals, or messages, they'll appear here.</p>
                </div>
            ) : (
                <div className={s.notifList}>
                    {myNotifications.map(n => {
                        const isConnNotif = n.type === "CONNECTION_REQUEST" || n.type === "CONNECTION_ACCEPTED" || n.type === "CONNECTION_REJECTED";
                        const isRegistrationNotif = n.type === "REGISTRATION_APPROVAL";
                        const isOutreach = n.type === "OUTREACH_REQUEST";

                        const conn = isConnNotif
                            ? connections.find(c => c.id === n.relatedEntityId) || sentConnections.find(c => c.id === n.relatedEntityId)
                            : null;

                        const pendingUser = isRegistrationNotif
                            ? pendingAlumni.find(u => u.id === n.relatedEntityId) || users.find(u => u.id === n.relatedEntityId)
                            : null;

                        const sender = conn?.sender || users.find(u => u.id === conn?.sender?.id) || pendingUser;
                        const receiver = conn?.receiver || users.find(u => u.id === conn?.receiver?.id);
                        const isSender = sender?.id === currentUser?.id;
                        const isReceiver = receiver?.id === currentUser?.id;
                        const canRespond = n.type === "CONNECTION_REQUEST" && conn?.status === "PENDING" && isReceiver;
                        const canApproveRegistration = isRegistrationNotif && pendingUser && (currentUser?.role === "ROLE_ADMIN" || currentUser?.role === "ROLE_SUPER_ADMIN");

                        return (
                            <div
                                key={n.id}
                                className={`${s.notifCard} ${!n.read ? s.notifCardUnread : ""}`}
                                onClick={() => markNotificationRead(n.id)}
                            >
                                <div className={s.notifRow}>
                                    <div className={s.notifAvatarCol}>
                                        <AvatarImg user={sender || { name: 'S' }} size="md" />
                                        {!n.read && <span className={s.unreadPulse}></span>}
                                    </div>

                                    <div className={s.notifBody}>
                                        <div className={s.notifHeader}>
                                            <span className={s.notifSender}>{sender?.name || (isRegistrationNotif ? "New alumnus" : "A fellow alumni")}</span>
                                            <span className={s.notifTime}>{timeAgo(n.createdAt)}</span>
                                        </div>

                                        <div className={s.notifMessage}>{n.message}</div>

                                        {isConnNotif && sender?.batch && (
                                            <div className={s.notifMetaBox}>
                                                <span className={s.metaTag}>Batch {sender.batch}</span>
                                                {sender.company && <span className={s.metaTag}>?? {sender.company}</span>}
                                            </div>
                                        )}

                                        {isRegistrationNotif && pendingUser && (
                                            <div className={s.notifMetaBox}>
                                                <span className={s.metaTag}>Batch {pendingUser.batch || "N/A"}</span>
                                                <span className={s.metaTag}>{pendingUser.department || "No department set"}</span>
                                            </div>
                                        )}

                                        <div className={s.notifActions}>
                                            {canApproveRegistration && (
                                                <>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={(e) => { e.stopPropagation(); approve(pendingUser.id); markNotificationRead(n.id); }}
                                                    >? Approve</button>
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={(e) => { e.stopPropagation(); reject(pendingUser.id); markNotificationRead(n.id); }}
                                                    >? Reject</button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={(e) => { e.stopPropagation(); fetchPendingAlumni(); setTab("pending"); markNotificationRead(n.id); }}
                                                    >Review Queue ?</button>
                                                </>
                                            )}

                                            {canRespond && conn && (
                                                <>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={(e) => { e.stopPropagation(); handleConnectionResponse(conn.id, "ACCEPTED"); markNotificationRead(n.id); }}
                                                    >? Accept</button>
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={(e) => { e.stopPropagation(); handleConnectionResponse(conn.id, "REJECTED"); markNotificationRead(n.id); }}
                                                    >? Ignore</button>
                                                </>
                                            )}

                                            {isConnNotif && conn && !canRespond && (
                                                <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>
                                                    {conn.status === "ACCEPTED"
                                                        ? (isSender ? `? Connected with ${receiver?.name || "alumni"}` : `? Connection accepted by ${sender?.name || "alumni"}`)
                                                        : conn.status === "REJECTED"
                                                            ? (isSender ? `Request declined by ${receiver?.name || "alumni"}` : "You declined this request")
                                                            : isSender
                                                                ? "Waiting for response"
                                                                : "Already responded"}
                                                </span>
                                            )}

                                            {isConnNotif && !conn && (
                                                <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>
                                                    Connection update unavailable.
                                                </span>
                                            )}

                                            {isRegistrationNotif && !canApproveRegistration && (
                                                <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>
                                                    {pendingUser?.status === "APPROVED"
                                                        ? "Registration already approved"
                                                        : pendingUser?.status === "REJECTED"
                                                            ? "Registration rejected"
                                                            : "Waiting for admin review"}
                                                </span>
                                            )}

                                            {isOutreach && (
                                                <button className={`btn btn-sm ${s.btnIndigoLight}`} onClick={(e) => { e.stopPropagation(); setTab("feed"); }}>
                                                    View Outreach Request ?
                                                </button>
                                            )}

                                            {n.type === "NEW_MESSAGE" && (
                                                <button className={`btn btn-ghost btn-sm ${s.btnReply}`} onClick={(e) => { e.stopPropagation(); setTab("messages"); }}>
                                                    Reply to Message ?
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default NotificationsView;
