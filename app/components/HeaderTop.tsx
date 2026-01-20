/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useState } from 'react';
import { apiFetch } from "@/app/utils/apiClient";

export default function HeaderTop() {
    const [user, setUser] = useState<any>(null);
    const [offcanvas, setOffcanvas] = useState(false);
    const [unreadTotal, setUnreadTotal] = useState(0);

    const toggleMenu = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setOffcanvas(prev => !prev);
    };

    useEffect(() => {
        document.body.classList.toggle("offcanvas-active", offcanvas);
    }, [offcanvas]);

    /* =========================
       DECODE JWT
    ========================= */
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const empId =
                payload["employeeId"] ||
                payload["nameid"] ||
                payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            const role =
                payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                "Employee";

            setUser({
                id: empId ? Number(empId) : null,
                role,
                fullName: null
            });
        } catch (err) {
            console.error("JWT decode error:", err);
        }
    }, []);

    /* =========================
       LOAD USER INFO
    ========================= */
    useEffect(() => {
        if (!user?.id) return;

        apiFetch("/employee")
            .then((res) => {
                const list = res?.emp || res || [];
                const me = list.find(
                    (e: any) => e.id === user.id || e.employeeId === user.id
                );

                if (me) {
                    setUser((prev: any) => ({
                        ...prev,
                        fullName: me.fullName || prev.fullName,
                        email: me.email,
                        phone: me.phoneNumber
                    }));
                }
            })
            .catch(console.error);
    }, [user?.id]);

    /* =========================
       LOAD UNREAD CHAT COUNT
    ========================= */
    const loadUnreadCount = async () => {
        try {
            const res = await apiFetch("/chat/available-users");
            if (!Array.isArray(res)) return;

            const total = res.reduce(
                (sum: number, u: any) => sum + (u.unreadCount || 0),
                0
            );

            setUnreadTotal(total);
        } catch { }
    };

    useEffect(() => {
        if (!user?.id) return;

        loadUnreadCount();
    }, [user?.id]);
    useEffect(() => {
        const handler = () => loadUnreadCount();

        window.addEventListener("chat-unread-updated", handler);
        return () =>
            window.removeEventListener("chat-unread-updated", handler);
    }, []);

    return (
        <div id="header_top" className="header_top">
            <div className="container">
                <div className="hleft">
                    <a className="header-brand" href="/main/hrms/dashboard">
                        <img src="/assets/images/logo.jpeg" alt="Logo" className="brand-logo" />
                    </a>

                    <div className="dropdown">
                        <a
                            href="/main/hrms/calendar"
                            className="nav-link icon app_inbox xs-hide"
                            title="Calendar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round" >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
                                <path d="M16 3v4" /><path d="M8 3v4" />
                                <path d="M4 11h16" /><path d="M7 14h.013" />
                                <path d="M10.01 14h.005" /><path d="M13.01 14h.005" />
                                <path d="M16.015 14h.005" /><path d="M13.015 17h.005" />
                                <path d="M7.01 17h.005" /><path d="M10.01 17h.005" />
                            </svg>
                        </a>

                        {/* ================= CHAT ICON (GIỮ NGUYÊN SVG) ================= */}
                        <a
                            href="/main/hrms/chat"
                            className="nav-link icon xs-hide"
                            title="Chat"
                            style={{ position: "relative" }}
                        >
                            {/* ✅ SVG ICON GỐC – KHÔNG ĐỔI */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10" />
                                <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" />
                            </svg>

                            {/* 🔴 BADGE CHƯA ĐỌC */}
                            {unreadTotal > 0 && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: -4,
                                        right: -6,
                                        minWidth: 18,
                                        height: 18,
                                        padding: "0 5px",
                                        borderRadius: 9,
                                        background: "#e53935",
                                        color: "#fff",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        lineHeight: "18px",
                                        boxShadow: "0 0 0 2px #fff"
                                    }}
                                >
                                    {unreadTotal > 9 ? "9+" : unreadTotal}
                                </span>
                            )}
                        </a>
                    </div>
                </div>

                <div className="hright mb-5">
                    <div className="dropdown">
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.dispatchEvent(new Event("toggle-user-panel"));
                            }}
                            className="nav-link user_btn"
                        >
                            <div
                                className="avatar"
                                style={{
                                    backgroundColor: "#4e73df",
                                    color: "white"
                                }}
                            >
                                {(user?.fullName
                                    ? user.fullName.charAt(0).toUpperCase()
                                    : "U")}
                            </div>
                        </a>

                        <a
                            href="#"
                            className="nav-link icon menu_toggle"
                            onClick={toggleMenu}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 6h16" />
                                <path d="M7 12h13" />
                                <path d="M10 18h10" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
