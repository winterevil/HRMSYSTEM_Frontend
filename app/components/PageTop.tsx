"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/utils/apiClient";
type Notification = {
    id: number;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
};
export default function PageTop() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loadingNoti, setLoadingNoti] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const [openNoti, setOpenNoti] = useState(false);

    const handleLogout = async () => {
        try {
            await apiFetch("/auth/logout", "POST", null, undefined, true);
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("jwt");
            document.cookie = "jwt=; path=/; max-age=0";

            router.push("/auth/login");
        }
    };
    const fetchNotifications = async () => {
        try {
            setLoadingNoti(true);

            const data = await apiFetch("/notification", "GET");

            const sorted = Array.isArray(data)
                ? data.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                )
                : [];

            setNotifications(sorted);
        } catch (e) {
            console.error("Load notifications failed", e);
        } finally {
            setLoadingNoti(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 1000); 

        return () => clearInterval(interval);
    }, []);


    return (
        <div id="page_top" className="section-body top_dark sticky-top">
            <div className="container-fluid">
                <div className="page-header">
                    <div className="left">
                        <h1 className="page-title">HR Dashboard</h1>
                    </div>
                    <div className="right">
                        <ul className="nav nav-pills">
                            {/*<li className="nav-item dropdown">*/}
                            {/*    <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Language</a>*/}
                            {/*    <div className="dropdown-menu">*/}
                            {/*        <a className="dropdown-item" href="#"><img className="w20 mr-2" src="https://puffintheme.com/template/epic-pro/assets/images/flags/us.svg"/>English</a>*/}
                            {/*    </div>*/}
                            {/*</li>*/}
                            {/*<li className="nav-item dropdown">*/}
                            {/*    <a className="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Reports</a>*/}
                            {/*    <div className="dropdown-menu">*/}
                            {/*        <a className="dropdown-item" href="#"><i className="dropdown-icon fa-solid fa-file-excel"></i> MS Excel</a>*/}
                            {/*        <a className="dropdown-item" href="#"><i className="dropdown-icon fa-solid fa-file-word"></i> MS Word</a>*/}
                            {/*        <a className="dropdown-item" href="#"><i className="dropdown-icon fa-solid fa-file-pdf"></i> PDF</a>*/}
                            {/*    </div>*/}
                            {/*</li>*/}
                        </ul>
                        <div className="notification d-flex">
                            <div className="notification d-flex">
                                <div className="dropdown d-flex position-relative">
                                    {/* Bell */}
                                    <a
                                        className="nav-link icon d-none d-md-flex btn btn-default btn-icon ml-1"
                                        onClick={() => setOpenNoti(prev => !prev)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-bell">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                                            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                                        </svg>

                                        {notifications.some(n => !n.isRead) && (
                                            <span className="badge badge-primary nav-unread">
                                                {notifications.filter(n => !n.isRead).length}
                                            </span>
                                        )}
                                    </a>

                                    {/* Dropdown */}
                                    {openNoti && (
                                        <div
                                            className="dropdown-menu dropdown-menu-right dropdown-menu-arrow show"
                                            style={{
                                                width: "420px",
                                                maxWidth: "90vw",
                                                position: "absolute",
                                                right: 0,
                                                top: "100%",
                                                zIndex: 1050,
                                            }}
                                        >
                                            <ul
                                                className="list-unstyled feeds_widget mb-0"
                                                style={{
                                                    maxHeight: "360px",   
                                                    overflowY: "auto",    
                                                }}
                                            >

                                                {loadingNoti && (
                                                    <li className="text-center text-muted py-3">
                                                        Loading...
                                                    </li>
                                                )}

                                                {!loadingNoti && notifications.length === 0 && (
                                                    <li className="text-center text-muted py-3">
                                                        No notifications
                                                    </li>
                                                )}

                                                {notifications.slice(0, visibleCount).map(n => (
                                                    <li
                                                        key={n.id}
                                                        className={!n.isRead ? "bg-light" : ""}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <div className="feeds-left">
                                                            <i className="fa fa-bell"></i>
                                                        </div>

                                                        <div className="feeds-body">
                                                            <h4
                                                                className={`title ${!n.isRead ? "text-primary" : ""}`}
                                                                style={{
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    maxWidth: "320px",
                                                                }}
                                                            >
                                                                {n.title}
                                                                <small className="float-right text-muted">
                                                                    {new Date(n.createdAt).toLocaleTimeString()}
                                                                </small>
                                                            </h4>

                                                            <small
                                                                style={{
                                                                    display: "block",
                                                                    whiteSpace: "normal",
                                                                    wordBreak: "break-word",
                                                                    maxHeight: "48px",
                                                                    overflow: "hidden",
                                                                }}
                                                            >
                                                                {n.content}
                                                            </small>

                                                            {n.content.length > 120 && (
                                                                <div
                                                                    className="text-primary"
                                                                    style={{ fontSize: "12px", cursor: "pointer" }}
                                                                >
                                                                    View more
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>

                                            {notifications.length > visibleCount && (
                                                <li className="text-center py-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => setVisibleCount(prev => prev + 5)}
                                                    >
                                                        Load more
                                                    </button>
                                                </li>
                                            )}

                                            <div className="dropdown-divider"></div>

                                            <a
                                                href="#"
                                                className="dropdown-item text-center text-muted-dark readall"
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    await Promise.all(
                                                        notifications
                                                            .filter(n => !n.isRead)
                                                            .map(n =>
                                                                apiFetch(`/notification/${n.id}/read`, "POST")
                                                            )
                                                    );

                                                    setNotifications(prev =>
                                                        prev.map(n => ({ ...n, isRead: true }))
                                                    );
                                                }}
                                            >
                                                Mark all as read
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="dropdown d-flex">
                                <a className="nav-link icon d-none d-md-flex btn btn-default btn-icon ml-1" data-toggle="dropdown">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-user"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /></svg>
                                </a>
                                <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                                    <a className="dropdown-item" href="/main/account/profile"><i className="dropdown-icon fa-solid fa-user"></i> Profile</a>
                                    <a className="dropdown-item" href="#"><i className="dropdown-icon fa-solid fa-gear"></i> Settings</a>
                                    <div className="dropdown-divider"></div>
                                    <a className="dropdown-item" href="#"><i className="dropdown-icon fa-solid fa-circle-question"></i> Need help?</a>
                                    <a className="dropdown-item" href="/auth/forgot-password"><i className="dropdown-icon fa-solid fa-lock-open"></i> Forgot Password</a>
                                    <a className="dropdown-item" href="#" onClick={handleLogout}><i className="dropdown-icon fa-solid fa-right-from-bracket"></i> Sign out</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}