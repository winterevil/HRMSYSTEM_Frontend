'use client';
import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/app/utils/apiClient";

export default function UserPanel() {
    const [user, setUser] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>({});
    const [roles, setRoles] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employeeTypes, setEmployeeTypes] = useState<any[]>([]);
    const [statuses] = useState([
        { value: 0, label: "Active" },
        { value: 1, label: "OnLeave" },
        { value: 2, label: "Resigned" },
        { value: 3, label: "Retired" },
        { value: 4, label: "Probation" },
    ]);
    const statusTextColors: any = {
        0: "text-success",     // Active
        1: "text-warning",     // OnLeave
        2: "text-danger",      // Resigned
        3: "text-secondary",   // Retired
        4: "text-info",        // Probation
    };
    const currentStatus = statuses.find(s => s.value === profile?.status);

    const [stats, setStats] = useState({
        totalHours: 0,
        totalLeave: 0,
        totalOT: 0
    });

    const [rating, setRating] = useState("");
    const latestTimeline = timeline.slice(0, 5);

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
    const isHR = user?.role === "HR";

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

    useEffect(() => {
        if (!user?.id) return;

        const loadActivity = async () => {
            try {
                const [
                    attendance,
                    leaves,
                    overtime,
                    jobposts,
                    requirements,
                    positions
                ] = await Promise.all([
                    apiFetch("/attendance"),
                    apiFetch("/leaverequest"),
                    apiFetch("/overtimerequest"),
                    apiFetch("/jobpost"),
                    apiFetch("/recruitmentrequirement"),
                    apiFetch("/recruitmentposition")
                ]);

                const activities: any[] = [];

                //1. Attendance
                attendance?.forEach((a: any) => {
                    if (a.employeeId === user.id) {
                        activities.push({
                            type: "attendance",
                            icon: "fa fa-check-circle text-success",
                            title: "Checked in",
                            time: a.checkinTime,
                            content: `Checked in at ${new Date(a.checkinTime).toLocaleTimeString()}`
                        });
                    }
                });

                //2. Leave Request
                leaves?.forEach((l: any) => {
                    if (l.employeeId === user.id) {
                        const status =
                            l.status === 0 ? "Pending" :
                                l.status === 1 ? "Approved" :
                                    l.status === 2 ? "Rejected" :
                                        "Cancelled";

                        activities.push({
                            type: "leave",
                            icon: "fa fa-calendar-minus text-warning",
                            title: `Leave request (${status})`,
                            time: l.startTime,
                            content: `Leave: ${new Date(l.startTime).toLocaleString()} → ${new Date(l.endTime).toLocaleString()}
                            Reason: ${l.reason}`
                        });
                    }
                });

                //3. Overtime Request
                overtime?.forEach((o: any) => {
                    if (o.employeeId === user.id) {
                        const status =
                            o.status === 0 ? "Pending" :
                                o.status === 1 ? "Approved" :
                                    o.status === 2 ? "Rejected" :
                                        "Cancelled";

                        activities.push({
                            type: "overtime",
                            icon: "fa fa-clock text-primary",
                            title: `Overtime request (${status})`,
                            time: o.startTime,
                            content: `OT: ${new Date(o.startTime).toLocaleString()} → ${new Date(o.endTime).toLocaleString()}
                            Reason: ${o.reason}`
                        });
                    }
                });

                //4. Job Posts
                jobposts?.forEach((j: any) => {
                    if (j.postedBy?.toLowerCase() === user.fullName?.toLowerCase()) {
                        activities.push({
                            type: "jobpost",
                            icon: "fa fa-briefcase text-info",
                            title: "Created job post",
                            time: j.createdAt,
                            content: j.title
                        });
                    }
                });

                //5. Recruitment Requirements
                requirements?.forEach((r: any) => {
                    if (
                        r.employeeName?.toLowerCase() === user.fullName?.toLowerCase() ||
                        r.createdBy === user.id
                    ) {
                        const status =
                            r.status === 0 ? "Pending" :
                                r.status === 1 ? "Approved" :
                                    r.status === 2 ? "Rejected" :
                                        "Completed";

                        activities.push({
                            type: "requirement",
                            icon: "fa fa-file-alt text-secondary",
                            title: `Recruitment Requirement (${status})`,
                            time: r.createdAt,
                            content: r.requirement || r.positionName
                        });
                    }
                });

                //6. Recruitment Positions
                positions?.forEach((p: any) => {
                    if (p.createdBy === user.id) {
                        activities.push({
                            type: "position",
                            icon: "fa fa-users text-purple",
                            title: "Created new recruitment position",
                            time: p.createdAt,
                            content: `${p.positionName} (${p.departmentName})`
                        });
                    }
                });
                // === Statistics ===

                // 1. Total Hours Worked
                let totalHoursWorked = 0;
                attendance?.forEach(a => {
                    if (a.employeeId === user.id && a.checkinTime && a.checkoutTime) {
                        const start = new Date(a.checkinTime).getTime();
                        const end = new Date(a.checkoutTime).getTime();
                        totalHoursWorked += (end - start) / (1000 * 60 * 60);
                    }
                });

                // 2. Total Leave Requests
                const totalLeaveRequests = leaves?.filter(l => l.employeeId === user.id).length || 0;

                // 3. Total OT Requests
                const totalOTRequests = overtime?.filter(o => o.employeeId === user.id).length || 0;

                // Update stats
                setStats({
                    totalHours: totalHoursWorked,
                    totalLeave: totalLeaveRequests,
                    totalOT: totalOTRequests
                });

                // === Employee Rating ===
                let employeeRating = "";

                if (totalHoursWorked > 160 && totalLeaveRequests <= 1) {
                    employeeRating = "Excellent";
                }
                else if (totalHoursWorked > 150 && totalLeaveRequests <= 2) {
                    employeeRating = "Good";
                }
                else if (totalHoursWorked >= 100) {
                    employeeRating = "Average";
                }
                else {
                    employeeRating = "Bad";
                }

                setRating(employeeRating);

                activities.sort(
                    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
                );

                setTimeline(activities);
            } catch (err) {
                console.error("Timeline load error:", err);
            }
        };

        loadActivity();
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;

        const loadProfile = async () => {
            try {
                const [emps, rolesData, deps, types] = await Promise.all([
                    apiFetch("/employee"),
                    apiFetch("/role"),
                    apiFetch("/department"),
                    apiFetch("/employeetype"),
                ]);

                const me = emps.find((e: any) => e.id === user.id);
                if (me) {
                    const userRoleName = me.roles?.[0]?.roleName || me.role || me.roleName;

                    setProfile({
                        ...me,
                        roleName: userRoleName,
                        roleId: rolesData.find(r => r.name === userRoleName)?.id || null
                    });
                }


                setRoles(rolesData);
                setDepartments(deps);
                setEmployeeTypes(types);
            } catch (err) {
                console.error("Profile load error:", err);
            }
        };

        loadProfile();
    }, [user?.id]);


    return (
        <div className="user_div">
            <h5 className="brand-name mb-4">
                My HRM
                <a href="#"
                    onClick={(e) => e.preventDefault()} className="user_btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" /><path d="M15 12h-12l3 -3" /><path d="M6 15l-3 -3" /></svg>
                </a>
            </h5>
            <div className="card">
                <div className="card-body">
                    <div className="media">
                        <div className="avatar avatar-xl mr-3"
                            style={{
                                backgroundColor: "#4e73df",
                                color: "white",
                            }}>
                            {(user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U")}
                        </div>
                        <div className="media-body">
                            <h6 className="m-0">{user?.fullName}</h6>
                            <p className="text-muted mb-0">{profile?.departmentName}</p>
                            <ul className="social-links list-inline mb-0 mt-2">
                                <li className="list-inline-item"><a href={`mailto:${user?.email || ""}`} title="Email" data-toggle="tooltip"><i className="fa fa-envelope"></i></a></li>
                                <li className="list-inline-item"><a href={`tel:${user?.phone || ""}`} title="Phone" data-toggle="tooltip"><i className="fa fa-phone"></i></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header border-bottom">
                    <h3 className="card-title">Statistics</h3>
                </div>
                <div className="card-body">
                    <div className="text-center">
                        <div className="row">
                            <div className="col-6 pb-3">
                                <h4 className="font-30 font-weight-bold">{profile?.roleName}</h4>
                            </div>
                            <div className="col-6 pb-3">
                                <h4 className={`font-20 font-weight-bold ${statusTextColors[profile?.status] || ""}`}>
                                    {currentStatus?.label || "Unknown"}
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="d-block">Total Hours Worked<span className="float-right">{stats.totalHours.toFixed(1)}</span></label>
                    </div>
                    <div className="form-group">
                        <label className="d-block">Leave Requests <span className="float-right">{stats.totalLeave}</span></label>
                    </div>
                    <div className="form-group mb-0">
                        <label className="d-block">Overtime Requests <span className="float-right">{stats.totalOT}</span></label>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header border-bottom">
                    <h3 className="card-title">Recent Activity</h3>
                </div>

                <div className="card-body p-3">

                    {latestTimeline.length === 0 ? (
                        <p className="text-muted text-center small">No recent activity</p>
                    ) : (
                        latestTimeline.map((item, index) => (
                            <div key={index} className="d-flex align-items-start mb-3">

                                {/* Icon */}
                                <div
                                    className="rounded-circle d-flex justify-content-center align-items-center"
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        background: "#f1f5f9",
                                        fontSize: "14px",
                                    }}
                                >
                                    <i className={item.icon}></i>
                                </div>

                                {/* Content */}
                                <div className="ml-3" style={{ width: "calc(100% - 50px)" }}>
                                    <div className="font-weight-bold" style={{ fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {item.title}
                                    </div>

                                    <div className="text-muted" style={{ fontSize: "11px" }}>
                                        {new Date(item.time).toLocaleDateString("en-CA")}
                                        {" "}
                                        {new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>

                                    <div className="text-muted" style={{
                                        fontSize: "12px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {item.content}
                                    </div>
                                </div>

                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}