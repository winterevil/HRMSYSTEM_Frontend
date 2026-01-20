"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/app/utils/apiClient";
import * as signalR from "@microsoft/signalr";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function getCurrentUser() {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("jwt");
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const id =
            payload["employeeId"] ||
            payload["nameid"] ||
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        return { id: Number(id) };
    } catch {
        return null;
    }
}

export default function ChatPage() {
    const currentUser = getCurrentUser();

    const [users, setUsers] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [activeUser, setActiveUser] = useState<any>(null);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageText, setMessageText] = useState("");

    const connectionRef = useRef<signalR.HubConnection | null>(null);

    const loadUsers = async () => {
        try {
            const res = await apiFetch("/chat/available-users");
            if (Array.isArray(res)) setUsers(res);
        } catch {
            toast.error("Failed to load users");
        }
    };

    const loadPendingRequests = async () => {
        try {
            const res = await apiFetch("/chat/pending-requests");
            if (Array.isArray(res)) setPendingRequests(res);
        } catch { }
    };

    useEffect(() => {
        loadUsers();
        loadPendingRequests();
    }, []);

    const handleSelectUser = async (u: any) => {
        try {
            const res = await apiFetch("/chat/start", "POST", {
                fromId: currentUser!.id,
                toId: u.id
            });

            if (res.needApproval) {
                toast.info("Chat request sent. Please wait for approval.");
                loadUsers();
                return;
            }

            if (!res.canChat || !res.conversationId) {
                toast.error("You are not allowed to chat with this user.");
                return;
            }

            setActiveUser(u);
            setConversationId(res.conversationId);

            await apiFetch(`/chat/${res.conversationId}/mark-read`, "POST");
            window.dispatchEvent(new Event("chat-unread-updated"));
            loadUsers();
        } catch {
            toast.error("Action failed");
        }
    };

    const approveRequest = async (requestId: number) => {
        try {
            await apiFetch(`/chat/approve/${requestId}`, "POST");
            toast.success("Chat approved");

            setPendingRequests(prev =>
                prev.filter(x => x.requestId !== requestId)
            );

            loadUsers();
        } catch {
            toast.error("Approve failed");
        }
    };

    useEffect(() => {
        if (!conversationId) return;

        apiFetch(`/chat/${conversationId}/messages`)
            .then(res => Array.isArray(res) && setMessages(res))
            .catch(() => toast.error("Failed to load messages"));
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) return;

        const connect = async () => {
            if (connectionRef.current) {
                await connectionRef.current.stop();
            }

            const conn = new signalR.HubConnectionBuilder()
                .withUrl("https://localhost:7207/hubs/chat", {
                    accessTokenFactory: () =>
                        localStorage.getItem("jwt") || ""
                })
                .withAutomaticReconnect()
                .build();

            conn.on("ReceiveMessage", async (msg) => {
                setMessages(prev => [...prev, msg]);

                if (msg.senderId !== currentUser?.id) {
                    await apiFetch(
                        `/chat/${conversationId}/mark-read`,
                        "POST"
                    );
                    loadUsers();
                }
            });

            await conn.start();
            await conn.invoke("JoinConversation", conversationId);
            connectionRef.current = conn;
        };

        connect();
        return () => connectionRef.current?.stop();
    }, [conversationId]);

    const sendMessage = async () => {
        if (!messageText || !conversationId) return;

        await connectionRef.current?.invoke("SendMessage", conversationId, {
            senderId: currentUser!.id,
            content: messageText
        });

        setMessageText("");
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={2500} />

            <div
                style={{
                    height: "calc(100vh - 120px)",
                    display: "flex",
                    gap: "12px",
                    padding: "10px",
                    overflow: "hidden"
                }}
            >
                {/* CHAT */}
                <div
                    className="card chat_box"
                    style={{
                        flex: 3,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0
                    }}
                >
                    <div className="card-header border-bottom">
                        <h4 className="card-title text-primary">
                            {activeUser?.fullName || "Chat"}
                        </h4>
                    </div>

                    <div className="card-body" style={{ flex: 1, overflowY: "auto" }}>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: 12,
                                    textAlign:
                                        m.senderId === currentUser?.id
                                            ? "right"
                                            : "left"
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "8px 12px",
                                        borderRadius: 8,
                                        background:
                                            m.senderId === currentUser?.id
                                                ? "#4caf50"
                                                : "#f1f3f4",
                                        color:
                                            m.senderId === currentUser?.id
                                                ? "#fff"
                                                : "#333",
                                        fontWeight: 500
                                    }}
                                >
                                    {m.content}
                                </span>
                                <div style={{ fontSize: 11, color: "#888" }}>
                                    {new Date(m.createdAt).toLocaleTimeString(
                                        "vi-VN",
                                        { hour: "2-digit", minute: "2-digit" }
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {conversationId && (
                        <div style={{ display: "flex", padding: 10, borderTop: "1px solid #ddd" }}>
                            <input
                                className="form-control"
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage()}
                                placeholder="Type message..."
                            />
                            <button className="btn btn-primary ml-2" onClick={sendMessage}>
                                Send
                            </button>
                        </div>
                    )}
                </div>

                {/* USER LIST */}
                <div
                    className="card chat_list"
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                        overflow: "hidden"
                    }}
                >
                    <div className="card-header border-bottom">
                        <strong className="card-title">Users</strong>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
                        {pendingRequests.length > 0 && (
                            <>
                                <strong className="text-danger d-block mb-2">
                                    Chat Requests
                                </strong>
                                {pendingRequests.map(r => (
                                    <div
                                        key={r.requestId}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: 6
                                        }}
                                    >
                                        <span>{r.fromEmployeeName}</span>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => approveRequest(r.requestId)}
                                        >
                                            Approve
                                        </button>
                                    </div>
                                ))}
                                <hr />
                            </>
                        )}

                        {users.map(u => (
                            <div
                                key={u.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 10
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, color: "#2c3e50" }}>
                                        {u.fullName}
                                    </div>
                                    <small className="text-muted">{u.role}</small>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {u.unreadCount > 0 && (
                                        <span
                                            style={{
                                                minWidth: 20,
                                                height: 20,
                                                padding: "0 6px",
                                                borderRadius: 10,
                                                background: "#e53935",
                                                color: "#fff",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            {u.unreadCount > 9 ? "9+" : u.unreadCount}
                                        </span>
                                    )}

                                    {u.canChatDirect && (
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleSelectUser(u)}
                                        >
                                            Chat
                                        </button>
                                    )}

                                    {u.isPending && (
                                        <span className="badge badge-secondary">
                                            Pending
                                        </span>
                                    )}

                                    {!u.canChatDirect && !u.isPending && u.needApproval && (
                                        <button
                                            className="btn btn-sm btn-warning"
                                            onClick={() => handleSelectUser(u)}
                                        >
                                            Request
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
