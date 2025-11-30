/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useEffect, useState } from 'react';
import { apiFetch } from "@/app/utils/apiClient";

export default function HeaderTop() {
    const [user, setUser] = useState<any>(null);
    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof window !== "undefined" && (window as any).$ && (window as any).$.fn.tooltip) {
                const $ = (window as any).$;

                $('[data-toggle="tooltip"]').tooltip({
                    trigger: 'hover'
                });

                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);


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
                fullName: null,
            });

        } catch (err) {
            console.error("Error decoding JWT", err);
        }
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        apiFetch("/employee")
            .then((res) => {
                const list = res?.emp || res || [];

                const me = list.find(
                    (e: any) =>
                        e.id === user.id ||
                        e.employeeId === user.id
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
            .catch((err) => console.error("Employee list fetch error:", err));
    }, [user?.id]);
    return (
        <div id="header_top" className="header_top">
            <div className="container">
                <div className="hleft">
                    <a className="header-brand" href="/main/hrms/dashboard"><img src="/assets/images/logo.jpeg" alt="Logo" className="brand-logo" /></a>
                    <div className="dropdown">
                        <a href="#" className="nav-link icon" data-toggle="tooltip" data-placement="right" title="Search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
                        </a>
                        <a href="#" className="nav-link icon app_inbox xs-hide" data-toggle="tooltip" data-placement="right" title="Calendar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /><path d="M7 14h.013" /><path d="M10.01 14h.005" /><path d="M13.01 14h.005" /><path d="M16.015 14h.005" /><path d="M13.015 17h.005" /><path d="M7.01 17h.005" /><path d="M10.01 17h.005" /></svg>
                        </a>
                        <a href="#" className="nav-link icon xs-hide" data-toggle="tooltip" data-placement="right" title="Chat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10" /><path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" /></svg>
                        </a>
                    </div>
                </div>
                <div className="hright mb-5">
                    <div className="dropdown">
                        {/*<a href="#" className="nav-link icon theme_btn" data-toggle="tooltip" data-placement="right" title="Themes">*/}
                        {/*    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M19 6h1a2 2 0 0 1 2 2a5 5 0 0 1 -5 5l-5 0v2" /><path d="M10 15m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /></svg>*/}
                        {/*</a>*/}
                        <a href="#"
                            onClick={(e) => e.preventDefault()} className="nav-link user_btn" data-toggle="tooltip" data-placement="right" title="User Menu" ><div className="avatar"
                                style={{
                                    backgroundColor: "#4e73df",
                                    color: "white",
                                }}>
                                {(user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U")}
                            </div>
                        </a>
                        <a
                            href="#"
                            className="nav-link icon menu_toggle"
                            onClick={(e) => {
                                e.preventDefault();
                                document.body.classList.toggle("offcanvas-active");
                            }}
                            data-toggle="tooltip"
                            title="Toggle"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 6h16" /><path d="M7 12h13" /><path d="M10 18h10" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}