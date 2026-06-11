const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// PostgreSQL connection pool
const poolConfig = process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'alumni_portal',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
    };

const pool = new Pool(poolConfig);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Online user tracking
let onlineUsers = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins their personal room and updates online status
    socket.on("join", (userId) => {
        onlineUsers[userId] = socket.id;
        socket.join(userId);
        io.emit("online_users", Object.keys(onlineUsers));
    });

    // Handle incoming real-time messages
    socket.on("send_message", async (data) => {
        const { senderId, receiverId, message } = data;
        try {
            const res = await pool.query(
                "INSERT INTO messages (sender_id, receiver_id, content, status) VALUES ($1, $2, $3, 'DELIVERED') RETURNING *",
                [senderId, receiverId, message]
            );
            const savedMsg = res.rows[0];

            // Emit to receiver's room
            io.to(receiverId.toString()).emit("receive_message", {
                id: savedMsg.id,
                senderId,
                content: message,
                createdAt: savedMsg.created_at,
                status: "DELIVERED",
            });

            // Emit back to sender as confirmation (optional, but good for UI sync)
            socket.emit("message_sent", savedMsg);

        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    // Real-time typing indicators
    socket.on("typing", ({ senderId, receiverId }) => {
        io.to(receiverId.toString()).emit("typing", { senderId });
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
        io.to(receiverId.toString()).emit("stop_typing", { senderId });
    });

    socket.on("disconnect", () => {
        for (let userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
            }
        }
        io.emit("online_users", Object.keys(onlineUsers));
        console.log("User disconnected");
    });
});

/**
 * API: Fetch chat history between two users
 */
app.get("/api/messages/:u1/:u2", async (req, res) => {
    const { u1, u2 } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1) 
       ORDER BY created_at ASC`,
            [u1, u2]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal database error" });
    }
});

/**
 * API: Get a list of active conversations for a user
 */
app.get("/api/conversations/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (partner_id) 
        partner_id, content, created_at, status
       FROM (
         SELECT receiver_id as partner_id, content, created_at, status FROM messages WHERE sender_id = $1
         UNION ALL
         SELECT sender_id as partner_id, content, created_at, status FROM messages WHERE receiver_id = $1
       ) AS combined
       ORDER BY partner_id, created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal database error" });
    }
});

/**
 * Internal API: Trigger mentorship notifications from Java backend
 */
app.post("/api/internal/mentorship-update", (req, res) => {
    const { type, request, targetId } = req.body;
    io.to(targetId.toString()).emit("mentorship_update", { type, request });
    res.sendStatus(200);
});

server.listen(5000, "0.0.0.0", () => {
    console.log("Alumni Chat Persistent Server running on port 5000");
});