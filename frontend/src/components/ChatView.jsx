import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { timeAgo, avatarColor } from "../utils/helpers";
import AvatarImg from "./AvatarImg";
import s from "./ChatView.module.css";

function ChatView() {
    const { currentUser, socket, onlineUsers = [], connectedAlumniIds = [], users = [], setTab } = useApp();
    const [selectedId, setSelectedId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // List of people I can chat with (Connected users)
    const connectedUsers = users.filter(u => connectedAlumniIds.includes(u.id));

    // Fetch history when a user is selected
    useEffect(() => {
        if (!selectedId) return;

        async function fetchHistory() {
            try {
                const chatUrl = import.meta.env.VITE_CHAT_SERVER_URL || "http://localhost:5000";
                const res = await fetch(`${chatUrl}/api/messages/${currentUser.id}/${selectedId}`);
                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            }
        }

        fetchHistory();

        // Listen for new messages for this specific chat
        if (socket) {
            const handleMessage = (data) => {
                if (data.senderId === selectedId || data.senderId === currentUser.id) {
                    setMessages(prev => [...prev, data]);
                }
            };

            const handleTyping = (data) => {
                if (data.senderId === selectedId) setIsTyping(true);
            };

            const handleStopTyping = (data) => {
                if (data.senderId === selectedId) setIsTyping(false);
            };

            socket.on("receive_message", handleMessage);
            socket.on("message_sent", handleMessage);
            socket.on("typing", handleTyping);
            socket.on("stop_typing", handleStopTyping);

            return () => {
                socket.off("receive_message", handleMessage);
                socket.off("message_sent", handleMessage);
                socket.off("typing", handleTyping);
                socket.off("stop_typing", handleStopTyping);
            };
        }
    }, [selectedId, socket, currentUser.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    function handleSend(e) {
        e.preventDefault();
        if (!text.trim() || !selectedId || !socket) return;

        socket.emit("send_message", {
            senderId: currentUser.id,
            receiverId: selectedId,
            message: text.trim()
        });

        setText("");
        socket.emit("stop_typing", { senderId: currentUser.id, receiverId: selectedId });
    }

    const onInputChange = (e) => {
        setText(e.target.value);
        if (!socket || !selectedId) return;

        socket.emit("typing", { senderId: currentUser.id, receiverId: selectedId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", { senderId: currentUser.id, receiverId: selectedId });
        }, 2000);
    };

    const selectedUser = users.find(u => u.id === selectedId);

    return (
        <div className={s.chatContainer}>
            {/* Sidebar: Contacts */}
            <aside className={s.chatSidebar}>
                <div className={s.chatSidebarHeader}>
                    <h3>Messages</h3>
                    <div className={s.sidebarBadge}>{connectedUsers.length}</div>
                </div>

                <div className={s.chatContactList}>
                    {connectedUsers.length === 0 ? (
                        <div className="empty-state-mini">
                            <p>Connect with alumni to start a conversation</p>
                        </div>
                    ) : (
                        connectedUsers.map(u => {
                            const isActive = selectedId === u.id;
                            const isOnline = onlineUsers.includes(u.id.toString());

                            return (
                                <div
                                    key={u.id}
                                    onClick={() => setSelectedId(u.id)}
                                    className={`${s.contactItem} ${isActive ? s.contactItemActive : ""}`}
                                >
                                    <div className={s.avatarWrapper}>
                                        <AvatarImg user={u} size="md" />
                                        <span className={`${s.statusDot} ${isOnline ? s.statusDotOnline : s.statusDotOffline}`}></span>
                                    </div>
                                    <div className={s.contactInfo}>
                                        <div className={s.contactNameRow}>
                                            <span className={`${s.contactName} ${isActive ? s.contactNameActive : ""}`}>{u.name}</span>
                                        </div>
                                        <p className={s.contactSnippet}>
                                            {isOnline ? "Active now" : "Offline"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* Main: Chat Window */}
            <main className={s.chatMain}>
                {!selectedId ? (
                    <div className={s.chatWelcome}>
                        <div className={s.welcomeIcon}>💬</div>
                        <h2>Your Inbox</h2>
                        <p>Select a connection from the left to start messaging. Your conversations are persistent and real-time.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <header className={s.chatHeader}>
                            <div className={s.headerUser}>
                                <AvatarImg user={selectedUser} size="md" />
                                <div>
                                    <div className={s.headerName}>{selectedUser.name}</div>
                                    <div className={s.headerStatus}>
                                        {isTyping ? (
                                            <span className={s.typingText}>typing...</span>
                                        ) : (
                                            <span className={s.statusText}>{onlineUsers.includes(selectedId.toString()) ? "Online" : "Offline"}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button className="btn btn-ghost btn-sm" onClick={() => setTab("profile")}>View Profile</button>
                            </div>
                        </header>

                        {/* Messages List */}
                        <div ref={scrollRef} className={s.messageList}>
                            {messages.length === 0 ? (
                                <div className={s.messageEmpty}>
                                    <div className={s.waveIcon}>👋</div>
                                    <p>Say hello to <strong>{selectedUser.name.split(' ')[0]}</strong>!</p>
                                    <p>Start a conversation by sending a message below.</p>
                                </div>
                            ) : (
                                messages.map((m, idx) => {
                                    const isMe = m.sender_id ? (Number(m.sender_id) === currentUser.id) : (m.senderId === currentUser.id);
                                    const prevMsg = messages[idx - 1];
                                    const prevSenderId = prevMsg ? (prevMsg.sender_id || prevMsg.senderId) : null;
                                    const currentSenderId = m.sender_id || m.senderId;
                                    const isSameUser = prevSenderId === currentSenderId;

                                    return (
                                        <div
                                            key={m.id || idx}
                                            className={[
                                                s.messageRow,
                                                isMe ? s.messageRowMe : "",
                                                isSameUser ? s.messageRowConsecutive : "",
                                            ].filter(Boolean).join(" ")}
                                        >
                                            {!isMe && !isSameUser && (
                                                <AvatarImg
                                                    user={selectedUser}
                                                    size="sm"
                                                />
                                            )}
                                            {isMe && !isSameUser && <div className={s.avatarSpacer}></div>}

                                            <div className={[
                                                s.messageBubble,
                                                isMe
                                                    ? (isSameUser ? s.messageBubbleMineConsecutive : s.messageBubbleMine)
                                                    : (isSameUser ? s.messageBubbleTheirsConsecutive : s.messageBubbleTheirs),
                                            ].join(" ")}>
                                                <div>{m.content}</div>
                                                <div className={s.messageMeta}>
                                                    {new Date(m.created_at || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <span style={{ marginLeft: '4px' }}>✓✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {isTyping && (
                                <div className={s.messageRow}>
                                    <AvatarImg user={selectedUser} size="sm" />
                                    <div className={`${s.messageBubble} ${s.messageBubbleTheirs}`}>
                                        <div className={s.typingDots}>...</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <footer className={s.chatInputArea}>
                            <form onSubmit={handleSend} className={s.chatInputPill}>
                                <button type="button" className={s.inputActBtn}>📎</button>
                                <input
                                    className={s.chatInputField}
                                    value={text}
                                    onChange={onInputChange}
                                    placeholder={`Message ${selectedUser.name.split(' ')[0]}...`}
                                />
                                <button type="submit" className={s.chatSendBtn} disabled={!text.trim()}>
                                    <span>Send</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>
                        </footer>
                    </>
                )}
            </main>
        </div>
    );
}

export default ChatView;
