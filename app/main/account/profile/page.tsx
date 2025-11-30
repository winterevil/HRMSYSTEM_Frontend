'use client';
import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/app/utils/apiClient";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toPng } from "html-to-image";
import ExcelJS from "exceljs";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const calendarCardRef = useRef<HTMLDivElement>(null);
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
    const [stats, setStats] = useState({
        totalHours: 0,
        totalLeave: 0,
        totalOT: 0
    });

    const [rating, setRating] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const toggleFullscreen = () => {
        const elem = calendarCardRef.current;
        if (!elem) return;

        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };
    const downloadPNG = () => {
        if (!calendarCardRef.current) {
            toast.error("Calendar frame not found!");
            return;
        }

        toPng(calendarCardRef.current)
            .then((dataUrl) => {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = "calendar.png";
                link.click();
                toast.success("Calendar downloaded successfully!");
            })
            .catch((err) => {
                console.error("Error generating PNG:", err);
                toast.error("Failed to download calendar!");
            });
    };
    const downloadTimelineWord = async () => {
        try {
            if (timeline.length === 0) {
                toast.warning("No timeline data to export!");
                return;
            }

            const children = [
                new Paragraph({
                    children: [
                        new TextRun({ text: "Timeline Activity", bold: true, size: 32 })
                    ]
                }),
                new Paragraph("")
            ];

            timeline.forEach(item => {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${item.title} - `, bold: true }),
                            new TextRun(new Date(item.time).toLocaleString())
                        ]
                    })
                );
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun(item.content || "")
                        ]
                    })
                );
                children.push(new Paragraph(""));
            });

            const doc = new Document({
                sections: [{ children }]
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, "timeline.docx");

            toast.success("Timeline Word downloaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to export timeline Word!");
        }
    };

    const downloadExcel = async () => {
        try {
            if (timeline.length === 0) {
                toast.warning("No timeline data to export!");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Timeline");

            sheet.columns = [
                { header: "Title", key: "title", width: 40 },
                { header: "Time", key: "time", width: 25 },
                { header: "Content", key: "content", width: 60 }
            ];

            timeline.forEach(item => {
                sheet.addRow({
                    title: item.title,
                    time: new Date(item.time).toLocaleString(),
                    content: item.content
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "timeline.xlsx";
            link.click();

            toast.success("Timeline Excel downloaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to download timeline Excel!");
        }
    };

    const downloadProfileWord = async () => {
        try {
            if (!profile) {
                toast.warning("No profile data available!");
                return;
            }

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Employee Profile",
                                        bold: true,
                                        size: 32,
                                    }),
                                ],
                            }),
                            new Paragraph(""),

                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Full Name: `, bold: true }),
                                    new TextRun(profile.fullName || ""),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Email: `, bold: true }),
                                    new TextRun(profile.email || ""),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Phone: `, bold: true }),
                                    new TextRun(profile.phone || ""),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Gender: `, bold: true }),
                                    new TextRun(profile.gender || ""),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Date of Birth: `, bold: true }),
                                    new TextRun(
                                        profile.dob
                                            ? new Date(profile.dob).toLocaleDateString()
                                            : ""
                                    ),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Address: `, bold: true }),
                                    new TextRun(profile.address || ""),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Department: `, bold: true }),
                                    new TextRun(
                                        departments.find(d => d.id === profile.departmentId)?.departmentName || ""
                                    ),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Employee Type: `, bold: true }),
                                    new TextRun(
                                        employeeTypes.find(t => t.id === profile.employeeTypeId)?.typeName || ""
                                    ),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Role: `, bold: true }),
                                    new TextRun(profile.roleName || ""),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Status: `, bold: true }),
                                    new TextRun(statuses.find(s => s.value === profile.status)?.label || ""),
                                ],
                            }),
                        ],
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            saveAs(blob, "profile.docx");

            toast.success("Profile downloaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Error generating Word file");
        }
    };
    const downloadProfileExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Profile");

            sheet.columns = [
                { header: "Field", key: "field", width: 30 },
                { header: "Value", key: "value", width: 50 }
            ];

            sheet.addRow({ field: "Full Name", value: profile.fullName });
            sheet.addRow({ field: "Email", value: profile.email });
            sheet.addRow({ field: "Phone", value: profile.phone });
            sheet.addRow({ field: "Gender", value: profile.gender });
            sheet.addRow({
                field: "Date of Birth",
                value: profile.dob ? new Date(profile.dob).toLocaleDateString() : ""
            });
            sheet.addRow({ field: "Address", value: profile.address });
            sheet.addRow({
                field: "Department",
                value: departments.find(d => d.id === profile.departmentId)?.departmentName || ""
            });
            sheet.addRow({
                field: "Employee Type",
                value: employeeTypes.find(t => t.id === profile.employeeTypeId)?.typeName || ""
            });
            sheet.addRow({ field: "Role", value: profile.roleName });
            sheet.addRow({
                field: "Status",
                value: statuses.find(s => s.value === profile.status)?.label || ""
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer]);

            saveAs(blob, "profile.xlsx");
            toast.success("Profile Excel downloaded!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to download profile Excel!");
        }
    };

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
                attendance?.forEach((a: any) => {
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

    const updateProfile = async () => {
        try {
            if (profile.oldPassword || profile.newPassword || profile.confirmPassword) {

                if (!profile.oldPassword) {
                    toast.error("Please enter old password");
                    return;
                }

                if (!profile.newPassword) {
                    toast.error("Please enter new password");
                    return;
                }

                if (!profile.confirmPassword) {
                    toast.error("Please confirm password");
                    return;
                }

                if (profile.newPassword !== profile.confirmPassword) {
                    toast.error("New password and confirm password do not match");
                    return;
                }
            }

            const body = {
                id: profile.id,
                fullName: profile.fullName,
                email: profile.email,
                gender: profile.gender,
                dob: profile.dob ? new Date(profile.dob).toISOString() : null,
                phone: profile.phone,
                address: profile.address,

                role: isHR
                    ? roles.find(r => r.id === profile.roleId)?.name
                    : profile.roleName,

                roleId: profile.roleId,

                departmentId: profile.departmentId,
                employeeTypeId: profile.employeeTypeId,
                status: profile.status,

                oldPassword: profile.oldPassword || null,
                newPassword: profile.newPassword || null
            };

            await apiFetch("/employee", "PUT", body);

            toast.success("Profile updated successfully!");

            // Nếu có thay đổi password → logout
            if (profile.newPassword) {
                toast.success("Password changed, please login again.", { autoClose: 1500 });
                setTimeout(() => {
                    localStorage.removeItem("jwt");
                    window.location.href = "/auth/login";
                }, 1500);
            }

        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="section-body mt-3">
            <div className="container-fluid">
                <div className="row clearfix">
                    <div className="col-md-12">
                        <div className="card card-profile">
                            <div className="card-body text-center">
                                <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        backgroundColor: "#4e73df",
                                        color: "white",
                                        fontSize: "32px",
                                        fontWeight: "bold",
                                    }}>
                                    {(user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U")}
                                </div>
                                <h4 className="mb-3">{user?.fullName}</h4>
                                <ul className="social-links list-inline mb-3 mt-2">
                                    <li className="list-inline-item"><a href={`mailto:${user?.email || ""}`} title="Email" data-toggle="tooltip"><i className="fa fa-envelope"></i></a></li>
                                    <li className="list-inline-item"><a href={`tel:${user?.phone || ""}`} title="Phone" data-toggle="tooltip"><i className="fa fa-phone"></i></a></li>
                                </ul>
                                <p className="mb-4">A dedicated and valued member of our company, <br /> always contributing positively to the team and maintaining a strong professional spirit.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid">
                <div className="row clearfix">
                    <div className="col-12">
                        <ul className="nav nav-tabs mb-3" id="pills-tab" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link active" id="pills-calendar-tab" data-toggle="pill" href="#pills-calendar" role="tab" aria-controls="pills-calendar" aria-selected="false">Calendar</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" id="pills-timeline-tab" data-toggle="pill" href="#pills-timeline" role="tab" aria-controls="pills-timeline" aria-selected="true">Timeline</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" id="pills-profile-tab" data-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false">Profile</a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-lg-8 col-md-12">
                        <div className="tab-content" id="pills-tabContent">
                            <div className="tab-pane fade show active" id="pills-calendar" role="tabpanel" aria-labelledby="pills-calendar-tab">
                                <div className="card" ref={calendarCardRef}>
                                    <div className="card-header bline">
                                        <h3 className="card-title">Calendar</h3>
                                        <div className="card-options">
                                            <a onClick={toggleFullscreen} className="card-options-fullscreen" style={{ cursor: "pointer" }}>
                                                <i className="fa fa-maximize"></i>
                                            </a>
                                            <a onClick={downloadPNG} className="card-options" style={{ cursor: "pointer" }}>
                                                <i className="fa fa-cloud-download"></i>
                                            </a>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <FullCalendar
                                            plugins={[dayGridPlugin, interactionPlugin]}
                                            initialView="dayGridMonth"
                                            height="auto"
                                            headerToolbar={{
                                                left: 'prev,next today',
                                                center: 'title',
                                                right: ''
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="pills-timeline" role="tabpanel" aria-labelledby="pills-timeline-tab">
                                <div className="card">
                                    <div className="card-header border-bottom">
                                        <h3 className="card-title">Activity</h3>
                                        <div className="card-options">
                                            {/* Download Excel */}
                                            <a onClick={downloadExcel} style={{ cursor: "pointer", marginLeft: 10 }}>
                                                <i className="fa fa-file-excel text-success"></i>
                                            </a>

                                            {/* Download Word */}
                                            <a onClick={downloadTimelineWord} style={{ cursor: "pointer", marginLeft: 15 }}>
                                                <i className="fa fa-file-word text-success"></i>
                                            </a>
                                        </div>

                                    </div>
                                    <div className="card-body">
                                        {timeline.length === 0 ? (
                                            <p className="text-muted text-center">No activity yet.</p>
                                        ) : (
                                            timeline.map((item, index) => (
                                                <div key={index} className="timeline_item mb-4">
                                                    <span>
                                                        <i className={item.icon} style={{ marginRight: 8 }}></i>
                                                        <strong>{item.title}</strong>
                                                        <small className="float-right text-muted">
                                                            {new Date(item.time).toLocaleDateString("en-CA")}
                                                            {" "}
                                                            {new Date(item.time).toLocaleTimeString()}
                                                        </small>
                                                    </span>
                                                    <div className="msg mt-2">
                                                        <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                                                            {item.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                <div className="card">
                                    <div className="card-header border-bottom">
                                        <h3 className="card-title">Edit Profile</h3>
                                        <div className="card-options">

                                            {/* Word */}
                                            <a onClick={downloadProfileWord} style={{ cursor: "pointer", marginLeft: 10 }}>
                                                <i className="fa fa-file-word text-success"></i>
                                            </a>

                                            {/* Excel */}
                                            <a onClick={downloadProfileExcel} style={{ cursor: "pointer", marginLeft: 15 }}>
                                                <i className="fa fa-file-excel text-success"></i>
                                            </a>

                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row clearfix">

                                            {/* Full Name */}
                                            <div className="col-md-6">
                                                <label className="form-label">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={profile.fullName || ""}
                                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                                />
                                            </div>

                                            {/* Email (không sửa được) */}
                                            <div className="col-md-6">
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-control" disabled value={profile.email || ""} />
                                            </div>

                                            {/* Phone */}
                                            <div className="col-md-6">
                                                <label className="form-label">Phone</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={profile.phone || ""}
                                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                />
                                            </div>

                                            {/* DOB */}
                                            <div className="col-md-6">
                                                <label className="form-label">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={profile.dob ? new Date(profile.dob).toISOString().split("T")[0] : ""}
                                                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                                />
                                            </div>

                                            {/* Gender */}
                                            <div className="col-md-6">
                                                <label className="form-label">Gender</label>
                                                <select
                                                    className="form-control"
                                                    value={profile.gender || ""}
                                                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                                >
                                                    <option value="">Select gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>

                                            {/* Address */}
                                            <div className="col-md-6">
                                                <label className="form-label">Address</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={profile.address || ""}
                                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                                />
                                            </div>

                                            {/* Department */}
                                            <div className="col-md-6">
                                                <label className="form-label">Department</label>
                                                <select
                                                    className="form-control"
                                                    disabled={!isHR}
                                                    value={profile.departmentId || ""}
                                                    onChange={(e) => setProfile({ ...profile, departmentId: Number(e.target.value) })}
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map(d => (
                                                        <option key={d.id} value={d.id}>{d.departmentName}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Employee Type */}
                                            <div className="col-md-6">
                                                <label className="form-label">Employee Type</label>
                                                <select
                                                    className="form-control"
                                                    disabled={!isHR}
                                                    value={profile.employeeTypeId || ""}
                                                    onChange={(e) => setProfile({ ...profile, employeeTypeId: Number(e.target.value) })}
                                                >
                                                    <option value="">Select employee type</option>
                                                    {employeeTypes.map(t => (
                                                        <option key={t.id} value={t.id}>{t.typeName}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Role */}
                                            <div className="col-md-6">
                                                <label className="form-label">Role</label>
                                                <select
                                                    className="form-control"
                                                    disabled={!isHR}
                                                    value={profile.roleId || ""}
                                                    onChange={(e) => setProfile({ ...profile, roleId: Number(e.target.value) })}
                                                >
                                                    <option value="">Select Role</option>
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Status */}
                                            <div className="col-md-6">
                                                <label className="form-label">Status</label>
                                                <select
                                                    className="form-control"
                                                    disabled={!isHR}
                                                    value={profile.status ?? ""}
                                                    onChange={(e) => setProfile({ ...profile, status: Number(e.target.value) })}
                                                >
                                                    <option value="">Select Status</option>
                                                    {statuses.map(s => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-12 mt-4">
                                                <h5 className="mb-3">Change Password</h5>
                                            </div>

                                            {/* OLD PASSWORD */}
                                            <div className="col-md-4">
                                                <label className="form-label">Old Password</label>
                                                <div className="input-group">
                                                    <input
                                                        type={showOld ? "text" : "password"}
                                                        className="form-control"
                                                        value={profile.oldPassword || ""}
                                                        onChange={(e) => setProfile({ ...profile, oldPassword: e.target.value })}
                                                    />
                                                    <div className="input-group-append" onClick={() => setShowOld(!showOld)} style={{ cursor: "pointer" }}>
                                                        <span className="input-group-text">
                                                            <i className={`fa ${showOld ? "fa-eye-slash" : "fa-eye"}`}></i>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* NEW PASSWORD */}
                                            <div className="col-md-4">
                                                <label className="form-label">New Password</label>
                                                <div className="input-group">
                                                    <input
                                                        type={showNew ? "text" : "password"}
                                                        className="form-control"
                                                        value={profile.newPassword || ""}
                                                        onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                                                    />
                                                    <div className="input-group-append" onClick={() => setShowNew(!showNew)} style={{ cursor: "pointer" }}>
                                                        <span className="input-group-text">
                                                            <i className={`fa ${showNew ? "fa-eye-slash" : "fa-eye"}`}></i>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CONFIRM PASSWORD */}
                                            <div className="col-md-4">
                                                <label className="form-label">Confirm Password</label>
                                                <div className="input-group">
                                                    <input
                                                        type={showConfirm ? "text" : "password"}
                                                        className="form-control"
                                                        value={profile.confirmPassword || ""}
                                                        onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                                                    />
                                                    <div className="input-group-append" onClick={() => setShowConfirm(!showConfirm)} style={{ cursor: "pointer" }}>
                                                        <span className="input-group-text">
                                                            <i className={`fa ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}></i>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer text-right">
                                        <button className="btn btn-primary" onClick={updateProfile}>
                                            Update Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="widgets1">
                                    <div className="icon">
                                        <i className="fa fa-clock text-primary font-30"></i>
                                    </div>
                                    <div className="details">
                                        <h6 className="mb-0 font600">Total Hours Worked</h6>
                                        <span className="mb-0">{stats.totalHours.toFixed(1)} hours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="widgets1">
                                    <div className="icon">
                                        <i className="fa fa-calendar text-warning font-30"></i>
                                    </div>
                                    <div className="details">
                                        <h6 className="mb-0 font600">Leave Requests</h6>
                                        <span className="mb-0">{stats.totalLeave}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="widgets1">
                                    <div className="icon">
                                        <i className="fa fa-bolt text-danger font-30"></i>
                                    </div>
                                    <div className="details">
                                        <h6 className="mb-0 font600">OT Requests</h6>
                                        <span className="mb-0">{stats.totalOT}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <div className="widgets1">
                                    <div className="icon">
                                        <i className="fa fa-star text-info font-30"></i>
                                    </div>
                                    <div className="details">
                                        <h6 className="mb-0 font600">Employee Rating</h6>
                                        <span className="mb-0">{rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}