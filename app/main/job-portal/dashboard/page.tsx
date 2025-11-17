"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/app/utils/apiClient";
import { ToastContainer, toast } from "react-toastify";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "react-toastify/dist/ReactToastify.css";

interface JobPost {
    id?: number;
    title?: string;
    content?: string;
    requirement?: string;
    postedBy?: string;
    createdAt?: string;
    requirementId?: number;
    status?: number;
}
interface Requirement {
    id?: number;
    requirement?: string;
    positionName?: string;
    employeeName?: string;
    status?: number;
}
interface Position {
    id?: number;
    positionName?: string;
    departmentName?: string;
}

export default function JobDashboardPage() {
    const [currentRole, setCurrentRole] = useState<string>("");
    const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
    const [filterDept, setFilterDept] = useState<string>("All");

    // Decode role from JWT
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const role =
                    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
                setCurrentRole(role);
            } catch (err) {
                console.error("JWT decode error", err);
            }
        }
    }, []);

    // Load data
    useEffect(() => {
        async function loadData() {
            try {
                const job = await apiFetch("/jobpost");
                const safeJob = Array.isArray(job) ? job : [];

                // Employee — chỉ xem JobPost
                if (currentRole === "Employee") {
                    setJobPosts(safeJob);
                    setRequirements([]);
                    setPositions([]);
                    return;
                }

                // HR / Manager — load thêm Requirement + Position
                const req = await apiFetch("/recruitmentrequirement");
                const pos = await apiFetch("/recruitmentposition");

                // Null → fallback về []
                setJobPosts(safeJob);
                setRequirements(Array.isArray(req) ? req : []);
                setPositions(Array.isArray(pos) ? pos : []);
            }
            catch (err) {
                // Nếu API fail → vẫn set dữ liệu rỗng, tránh crash UI
                console.warn("Dashboard loadData fallback:", err);

                setJobPosts([]);
                setRequirements([]);
                setPositions([]);

                toast.error("Failed to load dashboard data");
            }
            finally {
                setLoading(false);
            }
        }

        // tránh gọi trước khi decode role
        if (currentRole !== "") loadData();
    }, [currentRole]);


    if (loading) return <div>Loading dashboard...</div>;

    const isHR = currentRole === "HR";
    const isManager = currentRole === "Manager";

    // === STATS ===
    const count = {
        totalJob: jobPosts.length,
        totalReq: requirements.length,
        totalPos: positions.length,
        pending: requirements.filter((r) => r.status === 0).length,
        approved: requirements.filter((r) => r.status === 1).length,
        rejected: requirements.filter((r) => r.status === 2).length,
        completed: requirements.filter((r) => r.status === 3).length,
    };

    // === PIE CHART ===
    const chartData = {
        labels: ["Pending", "Approved", "Rejected", "Completed"],
        datasets: [
            {
                data: [count.pending, count.approved, count.rejected, count.completed],
                backgroundColor: ["#facc15", "#22c55e", "#ef4444", "#9ca3af"],
            },
        ],
    };

    // === DEPARTMENT PROGRESS BAR CHART ===
    const departmentProgressData = (() => {
        const deptMap: Record<string, number> = {};
        if (positions.length > 0) {
            positions.forEach((p) => {
                const relatedReqs = requirements.filter(
                    (r) => r.positionName === p.positionName
                );
                if (relatedReqs.length > 0) {
                    const completed = relatedReqs.filter((r) => r.status === 3).length;
                    deptMap[p.departmentName || "Unknown"] = Math.round(
                        (completed / relatedReqs.length) * 100
                    );
                }
            });
        }
        return {
            labels: Object.keys(deptMap),
            datasets: [
                {
                    label: "Recruitment Completion (%)",
                    data: Object.values(deptMap),
                    backgroundColor: "#2563eb",
                    borderRadius: 6,
                },
            ],
        };
    })();

    const getPostStatus = (status?: number) => {
        switch (status) {
            case 0:
                return <span className="badge bg-success">Hiring</span>;
            case 1:
                return <span className="badge bg-secondary">Closed</span>;
            default:
                return null;
        }
    };

    const StatBox = ({
        title,
        value,
        icon,
        color,
    }: {
        title: string;
        value: number | string;
        icon: string;
        color: string;
    }) => (
        <div className="col-lg-3 col-md-6 mb-3">
            <div
                className="card border-0 shadow-sm h-100"
                style={{ borderTop: `4px solid ${color}` }}
            >
                <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                        <h6 className="text-muted mb-1">{title}</h6>
                        <h3 className="fw-bold text-dark mb-0">{value}</h3>
                    </div>
                    <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: "44px",
                            height: "44px",
                            background: `${color}15`,
                            color: color,
                        }}
                    >
                        <i className={icon}></i>
                    </div>
                </div>
            </div>
        </div>
    );

    const recentActivities = jobPosts
        .sort(
            (a, b) =>
                new Date(b.createdAt || "").getTime() -
                new Date(a.createdAt || "").getTime()
        )
        .slice(0, 6)
        .map(
            (p) =>
                `${p.postedBy || "Unknown"} posted "${p.title}" on ${p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString("en-CA")
                    : ""
                }`
        );

    const filteredJobPosts =
        isHR && filterDept !== "All"
            ? jobPosts.filter((j) => {
                const req = requirements.find((r) => r.id === j.requirementId);
                const pos = positions.find(
                    (p) => p.positionName === req?.positionName
                );
                return pos?.departmentName === filterDept;
            })
            : jobPosts;

    /* =======================
       NEW CALENDAR COMPONENT
    ======================= */
    const Calendar = () => {
        const [currentDate, setCurrentDate] = useState(new Date());

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const goPrev = () => setCurrentDate(new Date(year, month - 1, 1));
        const goNext = () => setCurrentDate(new Date(year, month + 1, 1));

        const weeks: JSX.Element[][] = [];
        let day = 1;

        for (let i = 0; i < 6; i++) {
            const row: JSX.Element[] = [];

            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDay) || day > daysInMonth) {
                    row.push(<td key={j}></td>);
                } else {
                    const today = new Date();
                    const isToday =
                        day === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear();

                    row.push(
                        <td
                            key={j}
                            className={isToday ? "bg-primary text-white fw-bold rounded-circle" : ""}
                            style={{
                                cursor: "pointer",
                                width: "35px",
                                height: "35px",
                            }}
                        >
                            {day}
                        </td>
                    );
                    day++;
                }
            }
            weeks.push(row);
        }

        return (
            <div>
                {/* HEADER with Prev / Next */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={goPrev}
                    >
                        ◀
                    </button>

                    <h5 className="fw-bold text-primary mb-0">
                        {currentDate.toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                        })}
                    </h5>

                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={goNext}
                    >
                        ▶
                    </button>
                </div>

                {/* CALENDAR TABLE */}
                <table
                    className="table table-bordered text-center mb-0"
                    style={{ fontSize: "0.85rem" }}
                >
                    <thead>
                        <tr>
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                                <th key={i} className="bg-light text-secondary fw-normal">
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((row, i) => (
                            <tr key={i}>{row}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    /* ========================
         RETURN HTML LAYOUT
    ======================== */
    return (
        <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
            <div className="container-fluid py-4">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-semibold text-dark mb-0">Recruitment Dashboard</h3>

                    {isHR && (
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 200 }}
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            {[...new Set(positions.map((p) => p.departmentName))].map(
                                (d, i) => (
                                    <option key={i} value={d || "Unknown"}>
                                        {d}
                                    </option>
                                )
                            )}
                        </select>
                    )}
                </div>

                {/* ========================
                     DASHBOARD STATISTICS
                ======================== */}
                <div className="row mb-4">
                    <StatBox
                        title="Total Job Posts"
                        value={count.totalJob}
                        icon="fa-solid fa-briefcase"
                        color="#2563eb"
                    />

                    {(isHR || isManager) && (
                        <>
                            <StatBox
                                title="Approved Requirements"
                                value={count.approved}
                                icon="fa-solid fa-circle-check"
                                color="#16a34a"
                            />
                            <StatBox
                                title="Pending Requests"
                                value={count.pending}
                                icon="fa-solid fa-clock"
                                color="#f59e0b"
                            />
                            <StatBox
                                title="Total Positions"
                                value={count.totalPos}
                                icon="fa-solid fa-layer-group"
                                color="#6b7280"
                            />
                        </>
                    )}
                </div>

                {/* ========================
                     JOB POSTS LIST + DETAIL
                ======================== */}
                <div className="row g-4">
                    <div className={selectedJob ? "col-lg-7" : "col-lg-12"}>
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                <h5 className="fw-semibold text-dark mb-0">Job Posts</h5>
                                <small className="text-muted">
                                    Total: {filteredJobPosts.length}
                                </small>
                            </div>
                            <div
                                className="card-body"
                                style={{ maxHeight: "60vh", overflowY: "auto" }}
                            >
                                {filteredJobPosts.length === 0 ? (
                                    <p className="text-muted text-center">No job posts available.</p>
                                ) : (
                                    <div className="list-group">
                                        {filteredJobPosts.map((job) => (
                                            <div
                                                key={job.id}
                                                onClick={() => setSelectedJob(job)}
                                                className={`list-group-item list-group-item-action border-0 border-bottom py-3 ${selectedJob?.id === job.id ? "bg-light" : ""
                                                    }`}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="fw-semibold text-primary mb-0">
                                                        {job.title}{" "}
                                                        <span className="ms-2">
                                                            {getPostStatus(job.status)}
                                                        </span>
                                                    </h6>
                                                    <small className="text-muted">
                                                        {job.createdAt
                                                            ? new Date(job.createdAt).toLocaleDateString("en-CA")
                                                            : ""}
                                                    </small>
                                                </div>

                                                <p className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
                                                    {job.requirement}
                                                </p>

                                                <small className="text-secondary">
                                                    <i className="fa-solid fa-user me-1"></i>{job.postedBy}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {selectedJob && (
                        <div className="col-lg-5">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                    <h6 className="fw-bold mb-0">{selectedJob.title}</h6>
                                    <button
                                        className="btn btn-sm btn-light"
                                        onClick={() => setSelectedJob(null)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div
                                    className="card-body"
                                    style={{
                                        overflowY: "auto",
                                        maxHeight: "58vh",
                                        lineHeight: 1.6,
                                        color: "#333",
                                    }}
                                >
                                    <p><strong>Status:</strong> {getPostStatus(selectedJob.status)}</p>
                                    <p><strong>Posted By:</strong> {selectedJob.postedBy}</p>

                                    <p className="text-muted">
                                        {selectedJob.createdAt
                                            ? new Date(selectedJob.createdAt).toLocaleDateString("en-CA")
                                            : ""}
                                    </p>

                                    <hr />

                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: selectedJob.content || "",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* =======================
                    ANALYTICS (HR + Manager)
                ======================= */}
                {(isHR || isManager) && (
                    <div className="row g-4 mt-4 mb-4">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h6 className="fw-semibold text-dark mb-0">Request Status Overview</h6>
                                </div>
                                <div className="card-body d-flex align-items-center justify-content-center" style={{ height: "300px" }}>
                                    <div style={{ width: "90%", maxWidth: "360px", height: "260px" }}>
                                        <Pie
                                            data={chartData}
                                            options={{
                                                plugins: {
                                                    legend: {
                                                        position: "bottom",
                                                        labels: { boxWidth: 15, padding: 10 },
                                                    },
                                                },
                                                maintainAspectRatio: false,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h6 className="fw-semibold text-dark mb-0">Department Recruitment Progress</h6>
                                </div>
                                <div className="card-body" style={{ height: "300px" }}>
                                    <Bar
                                        data={departmentProgressData}
                                        options={{
                                            indexAxis: "y",
                                            scales: {
                                                x: { beginAtZero: true, max: 100 },
                                            },
                                            plugins: { legend: { display: false } },
                                            maintainAspectRatio: false,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* =======================
                     CALENDAR + HR METRICS
                ======================= */}
                <div className="row g-4 mt-4 mb-5">
                    {/* CALENDAR HERE */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-semibold text-dark mb-0">Upcoming Schedule</h6>
                            </div>
                            <div className="card-body text-center">
                                <Calendar />
                            </div>
                        </div>
                    </div>

                    {/* HR METRICS */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-semibold text-dark mb-0">HR Metrics Overview</h6>
                            </div>

                            <div className="card-body">
                                <ul className="list-group list-group-flush small">
                                    <li className="list-group-item border-0 d-flex justify-content-between">
                                        <span>
                                            <i className="fa-solid fa-building text-primary me-2"></i>
                                            Top Hiring Department
                                        </span>

                                        <span className="fw-semibold">
                                            {(() => {
                                                const deptCount: Record<string, number> = {};
                                                jobPosts.forEach((j) => {
                                                    const req = requirements.find((r) => r.id === j.requirementId);
                                                    const pos = positions.find((p) => p.positionName === req?.positionName);
                                                    if (pos?.departmentName)
                                                        deptCount[pos.departmentName] =
                                                            (deptCount[pos.departmentName] || 0) + 1;
                                                });

                                                const sorted = Object.entries(deptCount).sort((a, b) => b[1] - a[1]);
                                                return sorted[0]?.[0] || "—";
                                            })()}
                                        </span>
                                    </li>

                                    <li className="list-group-item border-0 d-flex justify-content-between">
                                        <span>
                                            <i className="fa-solid fa-clock text-success me-2"></i>
                                            Avg. Time to Hire
                                        </span>
                                        <span className="fw-semibold">12 days</span>
                                    </li>

                                    <li className="list-group-item border-0 d-flex justify-content-between">
                                        <span>
                                            <i className="fa-solid fa-user-tie text-warning me-2"></i>
                                            Active Recruiters
                                        </span>
                                        <span className="fw-semibold">
                                            {new Set(jobPosts.map((j) => j.postedBy)).size}
                                        </span>
                                    </li>

                                    <li className="list-group-item border-0 d-flex justify-content-between">
                                        <span>
                                            <i className="fa-solid fa-people-group text-info me-2"></i>
                                            Open Roles
                                        </span>
                                        <span className="fw-semibold">{jobPosts.length}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =======================
                         RECENT ACTIVITIES
                ======================= */}
                <div className="card border-0 shadow-sm mb-5">
                    <div className="card-header bg-white border-bottom">
                        <h6 className="fw-semibold text-dark mb-0">Recent Activities</h6>
                    </div>

                    <div className="card-body">
                        <ul className="list-unstyled mb-0">
                            {recentActivities.map((a, idx) => (
                                <li key={idx} className="mb-2 d-flex align-items-center text-secondary">
                                    
                                    {a}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}
