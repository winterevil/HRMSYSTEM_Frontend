"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { apiFetch } from "@/app/utils/apiClient";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employeeTypes, setEmployeeTypes] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [overtime, setOvertime] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [quote, setQuote] = useState("");
    const [weather, setWeather] = useState<{ tempC: number; condition: string } | null>(null);
    const filterByCurrentMonth = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
        );
    };
    // Decode JWT user info
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
                email: null,
                phone: null,
                departmentId: null,
            });

        } catch (err) {
            console.error("Error decoding JWT", err);
        }
    }, []);

    // Random motivational quotes
    const quotes = [
        "Stay focused and make today amazing",
        "Small progress each day adds up to big results",
        "You are capable of great things — keep going",
        "Do something today that your future self will thank you for",
        "Success is not an accident; it’s hard work, patience, and passion",
    ];

    // Weather map 
    const weatherMap: Record<number, string> = {
        0: "Clear sky ☀️",
        1: "Mainly clear 🌤",
        2: "Partly cloudy ⛅",
        3: "Overcast ☁️",
        45: "Fog 🌫",
        48: "Depositing rime fog 🌫",
        51: "Light drizzle 🌦",
        61: "Rain 🌧",
        71: "Snowfall ❄️",
        95: "Thunderstorm ⛈",
    };

    // Fetch data + weather 
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Random quote
                setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

                // Fetch dashboard data
                const [emp, dep, types, leave, ot, att] = await Promise.all([
                    apiFetch("/employee"),
                    apiFetch("/department"),
                    apiFetch("/employeetype"),
                    apiFetch("/leaverequest"),
                    apiFetch("/overtimerequest"),
                    apiFetch("/attendance")
                ]);

                const employeeList = emp?.emp || emp || [];
                setEmployees(employeeList);
                setDepartments(dep?.dep || dep || []);
                setEmployeeTypes(types?.type || types || []);
                setLeaves(
                    (leave?.leave || leave || []).filter(l =>
                        l.startTime && filterByCurrentMonth(l.startTime)
                    )
                );
                setOvertime(
                    (ot?.ot || ot || []).filter(o =>
                        o.startTime && filterByCurrentMonth(o.startTime)
                    )
                );
                setAttendance(
                    (att?.att || att || []).filter(a =>
                        a.checkinTime && filterByCurrentMonth(a.checkinTime)
                    )
                );

                // Update user info using employee data
                setUser(prev => {
                    if (!prev?.id) return prev;

                    const me = employeeList.find(
                        e => e.id === prev.id || e.employeeId === prev.id
                    );

                    return {
                        ...prev,
                        fullName: me?.fullName || "Employee",
                        email: me?.email || null,
                        phone: me?.phoneNumber || null,
                        departmentId: me?.departmentId || null,
                    };
                });

                // WEATHER FETCH 
                const fetchWeather = async () => {
                    try {
                        if (!navigator.geolocation) {
                            console.warn("Geolocation not supported.");
                            return;
                        }

                        navigator.geolocation.getCurrentPosition(
                            async (pos) => {
                                const lat = pos.coords.latitude;
                                const lon = pos.coords.longitude;

                                const res = await fetch(
                                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
                                );
                                const data = await res.json();

                                if (data.current_weather) {
                                    setWeather({
                                        tempC: data.current_weather.temperature,
                                        condition:
                                            weatherMap[data.current_weather.weathercode] ||
                                            "Cloudy ☁️",
                                    });
                                }
                            },
                            async () => {
                                const res = await fetch(
                                    `https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current_weather=true`
                                );
                                const data = await res.json();

                                if (data.current_weather) {
                                    setWeather({
                                        tempC: data.current_weather.temperature,
                                        condition:
                                            weatherMap[data.current_weather.weathercode] ||
                                            "Cloudy ☁️",
                                    });
                                }
                            }
                        );
                    } catch (err) {
                        console.error("Weather fetch error:", err);
                    }
                };

                fetchWeather();

            } catch (err) {
                console.error("Dashboard load failed:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) return <div className="text-center p-5 text-muted">Loading dashboard...</div>;

    const role = user?.role || "Employee";
    const displayName = user?.fullName || "Employee";

    // ROLE FILTER 
    const filteredEmployees =
        role === "Manager"
            ? employees.filter((e) => e.departmentId === user?.departmentId)
            : employees;
    const filteredAttendance =
        role === "Employee"
            ? attendance.filter((a) => a.employeeId === user?.id)
            : attendance;
    const filteredLeaves =
        role === "Employee"
            ? leaves.filter((l) => l.employeeId === user?.id)
            : leaves;

    // SUMMARY
    const totalEmployees = filteredEmployees.length;
    const totalDepartments = departments.length;

    // EMPLOYEE GENDER
    const genderSummary = filteredEmployees.reduce<Record<string, number>>((acc, e) => {
        const key = e?.gender || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    const genderLabels = Object.keys(genderSummary);
    const genderSeries = Object.values(genderSummary);

    // EMPLOYEE TYPE
    const typeSummary = employeeTypes.map((t) => ({
        type: t.typeName || "Unknown",
        total: filteredEmployees.filter((e) => e.employeeTypeId === t.id).length,
    }));
    const typeLabels = typeSummary.map((t) => t.type);
    const typeSeries = typeSummary.map((t) => t.total);

    // LEAVE BY DEPARTMENT
    const approvedLeaves = filteredLeaves.filter((l) => l.status === 1);
    const leaveDeptSummary = departments.map((d) => {
        const count = approvedLeaves.filter((l) => {
            const emp = employees.find(
                (e) => e.id === l.employeeId || e.employeeId === l.employeeId
            );
            return emp && emp.departmentId === d.id;
        }).length;
        return { dept: d.departmentName, total: count };
    });
    const leaveDeptLabels = leaveDeptSummary.map((d) => d.dept);
    const leaveDeptCounts = leaveDeptSummary.map((d) => d.total);

    // OVERTIME
    const otSummary: Record<string, number> = {};
    overtime
        .filter((o) => o.status === 1)
        .forEach((o) => {
            const emp =
                filteredEmployees.find(
                    (e) => e.id === o.employeeId || e.employeeId === o.employeeId
                )?.fullName || "Unknown";
            const start = new Date(o.startTime);
            const end = new Date(o.endTime);
            const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if (diffHours > 0) otSummary[emp] = (otSummary[emp] || 0) + diffHours;
        });
    const otNames = Object.keys(otSummary);
    const otHours = Object.values(otSummary);

    // ATTENDANCE
    let onTime = 0,
        late = 0,
        absent = 0;
    const checkedEmployees = new Set<number>();
    filteredAttendance.forEach((a) => {
        if (!a.checkinTime) return;
        checkedEmployees.add(a.employeeId);
        const checkin = new Date(a.checkinTime);
        const hour = checkin.getHours() + checkin.getMinutes() / 60;
        if (hour <= 8.5) onTime++;
        else late++;
    });
    absent = Math.max(0, filteredEmployees.length - checkedEmployees.size);
    const total = onTime + late + absent || 1;

    // DEPARTMENT EMPLOYEE COUNT
    const deptSummary = departments.map((d) => ({
        dept: d.departmentName,
        total: filteredEmployees.filter((e) => e.departmentId === d.id).length,
    }));
    const deptLabels = deptSummary.map((d) => d.dept);
    const deptCounts = deptSummary.map((d) => d.total);

    const tips = [
        " Stay positive and proactive every morning.",
        " Help a teammate today — it strengthens the culture.",
        " Learn one new thing every week.",
        " Plan your top 3 priorities before lunch.",
    ];

    // CALENDAR
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
                if ((i === 0 && j < firstDay) || day > daysInMonth)
                    row.push(<td key={j}></td>);
                else {
                    const isToday =
                        day === new Date().getDate() &&
                        month === new Date().getMonth() &&
                        year === new Date().getFullYear();

                    row.push(
                        <td
                            key={j}
                            className={
                                isToday
                                    ? "bg-primary text-white fw-bold rounded-circle"
                                    : ""
                            }
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
                {/* Header Month Navigation */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <button
                        onClick={goPrev}
                        className="btn btn-sm btn-outline-primary"
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
                        onClick={goNext}
                        className="btn btn-sm btn-outline-primary"
                    >
                        ▶
                    </button>
                </div>

                <table
                    className="table table-bordered text-center mb-0"
                    style={{ fontSize: "0.85rem" }}
                >
                    <thead>
                        <tr>
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                                (d, i) => (
                                    <th key={i}>{d}</th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((r, i) => (
                            <tr key={i}>{r}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const CHART_COLORS = [
        "#4f46e5", // Indigo
        "#10b981", // Green
        "#f59e0b", // Amber
        "#ef4444", // Red
        "#3b82f6", // Blue
        "#ec4899", // Pink
        "#8b5cf6", // Purple
    ];

    const donutBase = {
        chart: {
            type: "donut",
            toolbar: { show: true },
        },
        legend: {
            position: "bottom",
            fontSize: "14px",
            labels: { colors: "#374151" },
            markers: { width: 12, height: 12, radius: 4 },
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => {
                return val < 10 ? "" : `${val.toFixed(1)}%`;
            },
            style: {
                fontSize: "10px",
                fontWeight: "600",
                colors: ["#ffffff"],
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            fontSize: "14px",
                            color: "#111827",
                            fontWeight: 600,
                        },
                    },
                },
            },
        },
        colors: CHART_COLORS,
    };

    const barBase = {
        chart: {
            type: "bar",
            toolbar: { show: true },
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: "45%",
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => Math.round(val),
            style: {
                fontSize: "13px",
                fontWeight: 600,
                colors: ["#111827"],
            },
        },
        xaxis: {
            labels: {
                style: {
                    fontSize: "11px",
                },
                formatter: (value) => {
                    return value.length > 12 ? value.replace(/ /g, "\n") : value;
                }
            }
        },
    };

    // Attendance Donut
    const attendanceChart = {
        series: [
            Math.round((onTime / total) * 100),
            Math.round((late / total) * 100),
            Math.round((absent / total) * 100),
        ],
        options: {
            ...donutBase,
            labels: ["On Time", "Late", "Absent"],
        },
    };

    // Gender Donut
    const genderChart = {
        series: genderSeries.length ? genderSeries : [1],
        options: {
            ...donutBase,
            labels: genderLabels,
        },
    };

    // Employee Type Donut
    const typeChart = {
        series: typeSeries.length ? typeSeries : [1],
        options: {
            ...donutBase,
            labels: typeLabels,
        },
    };

    // Department Bar
    const deptChart = {
        series: [{ name: "Employees", data: deptCounts }],
        options: {
            ...barBase,
            xaxis: {
                ...barBase.xaxis,
                categories: deptLabels,
            },
            colors: ["#6366f1"],
        },
    };

    // Leave Bar
    const leaveDeptChart = {
        series: [{ name: "Leaves", data: leaveDeptCounts }],
        options: {
            ...barBase,
            xaxis: {
                ...barBase.xaxis,
                categories: leaveDeptLabels,
            },
            colors: ["#f59e0b"],
        },
    };

    // Overtime Bar
    const overtimeChart = {
        series: [
            {
                name: "Overtime Hours",
                data: otHours.map((n) => Math.round(n)),
            },
        ],
        options: {
            ...barBase,
            xaxis: {
                ...barBase.xaxis,
                categories: otNames,
            },
            colors: ["#10b981"],
        },
    };

    return (
        <div className="section-body">
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4 className="font600 mb-1 text-primary">Welcome back, {displayName}!</h4>
                        <small className="text-muted">{quote}</small>
                    </div>
                    {weather && (
                        <div className="text-end">
                            <div className="card p-2 shadow-sm border-0">
                                <div className="fw-semibold">{Math.round(weather.tempC)}°C</div>
                                <div className="small text-muted">{weather.condition}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary cards */}
                <div className="row clearfix mt-4">
                    {role === "Employee" ? (
                        <>
                            <div className="col-md-6 text-center">
                                <div className="card p-3"><h6>Approved Leaves</h6><h3>{approvedLeaves.length}</h3></div>
                            </div>
                            <div className="col-md-6 text-center">
                                <div className="card p-3"><h6>Approved Overtime</h6><h3>{overtime.filter(o => o.status === 1).length}</h3></div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="col-md-3 text-center"><div className="card p-3"><h6>Employees</h6><h3>{totalEmployees}</h3></div></div>
                            <div className="col-md-3 text-center"><div className="card p-3"><h6>Departments</h6><h3>{totalDepartments}</h3></div></div>
                            <div className="col-md-3 text-center"><div className="card p-3"><h6>Approved Leaves</h6><h3>{approvedLeaves.length}</h3></div></div>
                            <div className="col-md-3 text-center"><div className="card p-3"><h6>Approved Overtime</h6><h3>{overtime.filter(o => o.status === 1).length}</h3></div></div>
                        </>
                    )}
                </div>

                {/* Charts */}
                {role === "Employee" ? (
                    <div className="row clearfix row-deck mt-4">
                        <div className="col-xl-4"><div className="card text-center"><div className="card-header"><h3>Your Attendance</h3></div><div className="card-body"><ApexChart options={attendanceChart.options} series={attendanceChart.series} type="donut" height={220} /></div></div></div>
                        <div className="col-xl-8"><div className="card"><div className="card-header"><h3>Your Overtime</h3></div><div className="card-body"><ApexChart options={overtimeChart.options} series={overtimeChart.series} type="bar" height={300} /></div></div></div>
                    </div>
                ) : (
                    <div className="row clearfix row-deck mt-4">
                        <div className="col-xl-6"><div className="card"><div className="card-header"><h3>Employees by Department</h3></div><div className="card-body"><ApexChart options={deptChart.options} series={deptChart.series} type="bar" height={300} /></div></div></div>
                        <div className="col-xl-6"><div className="card"><div className="card-header"><h3>Overtime by Employee</h3></div><div className="card-body"><ApexChart options={overtimeChart.options} series={overtimeChart.series} type="bar" height={300} /></div></div></div>
                        <div className="col-xl-4"><div className="card text-center"><div className="card-header"><h3>Attendance Overview</h3></div><div className="card-body"><ApexChart options={attendanceChart.options} series={attendanceChart.series} type="donut" height={220} /></div></div></div>
                        <div className="col-xl-4"><div className="card text-center"><div className="card-header"><h3>Employee Gender</h3></div><div className="card-body"><ApexChart options={genderChart.options} series={genderChart.series} type="pie" height={220} /></div></div></div>
                        <div className="col-xl-4"><div className="card text-center"><div className="card-header"><h3>Employee Type</h3></div><div className="card-body"><ApexChart options={typeChart.options} series={typeChart.series} type="pie" height={220} /></div></div></div>
                        <div className="col-xl-12"><div className="card"><div className="card-header"><h3>Leave by Department</h3></div><div className="card-body"><ApexChart options={leaveDeptChart.options} series={leaveDeptChart.series} type="bar" height={300} /></div></div></div>
                    </div>
                )}

                <div className="row g-4 mt-5 row-cols-1 row-cols-lg-3">
                    {/* Calendar */}
                    <div className="col">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white">
                                <h6 className="fw-semibold mb-0 text-dark">Company Calendar</h6>
                            </div>
                            <div className="card-body text-center">
                                <Calendar />
                            </div>
                        </div>
                    </div>

                    {/* HR Insights & Updates */}
                    <div className="col">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-semibold text-dark mb-0">HR Insights & Updates</h6>
                            </div>
                            <div className="card-body d-flex flex-column justify-content-between">
                                <ul className="list-group list-group-flush mb-3">
                                    <li className="list-group-item border-0">
                                        <strong>Top Department:</strong>{" "}
                                        {deptLabels.length
                                            ? deptLabels[deptCounts.indexOf(Math.max(...deptCounts))]
                                            : "N/A"}
                                    </li>
                                    <li className="list-group-item border-0">
                                        <strong>Lowest Leave Requests:</strong>{" "}
                                        {leaveDeptLabels.length
                                            ? leaveDeptLabels[
                                            leaveDeptCounts.indexOf(Math.min(...leaveDeptCounts))
                                            ]
                                            : "N/A"}
                                    </li>
                                    <li className="list-group-item border-0">
                                        <strong>Most Active Employees:</strong>{" "}
                                        {otNames.slice(0, 2).join(", ") || "No Data"}
                                    </li>
                                    <li className="list-group-item border-0">
                                        <strong>Average Attendance Rate:</strong>{" "}
                                        {Math.round((onTime / total) * 100)}%
                                    </li>
                                </ul>
                                <div>
                                    <hr className="my-2" />
                                    <p className="small text-muted mb-0">
                                        Upcoming: Annual HR review on{" "}
                                        <span className="text-dark fw-semibold">Dec 10</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Work Tips */}
                    <div className="col">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-header bg-white">
                                <h6 className="fw-semibold mb-0 text-dark">Work Tips</h6>
                            </div>
                            <div className="card-body d-flex flex-column justify-content-between">
                                <ul className="list-group list-group-flush flex-grow-1 mb-3">
                                    {tips.map((tip, i) => (
                                        <li
                                            key={i}
                                            className="list-group-item border-0 text-secondary small"
                                        >
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                                <p className="small text-muted mb-0 text-center">
                                    Refresh your mindset every day for better results.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
