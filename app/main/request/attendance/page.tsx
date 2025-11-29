"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch } from "@/app/utils/apiClient";

// Định nghĩa kiểu dữ liệu cho Attendance
interface AttendanceDto {
    id?: number;
    checkinTime?: string;
    checkoutTime?: string;
    checkinDate?: string;
    employeeId?: number;
    employeeName?: string;
}

export default function AttendancePage() {
    // Các trạng thái liên quan đến việc tải dữ liệu
    const [attendances, setAttendances] = useState<AttendanceDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState("");
    const filteredRequests = (attendances || []).filter((request) =>
        (request.employeeName || "")
            .toLowerCase()
            .includes((searchTerm || "").toLowerCase())
    );
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Tính tổng số trang
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    // Tính dữ liệu đang hiển thị theo trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

    // Giải mã vai trò từ JWT
    const [currentRole, setCurrentRole] = useState<string>("");
    const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));

                const role =
                    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
                const email =
                    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
                    payload["email"] ||
                    "";
                const empId =
                    payload["employeeId"] || payload["nameid"] || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

                setCurrentRole(role);
                setCurrentUserEmail(email);
                if (empId) setCurrentUserId(Number(empId)); 
            } catch (err) {
                console.error("Error decoding JWT", err);
            }
        }
    }, []);

    // === Tính thống kê dữ liệu tháng hiện tại ===
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Hàm tính thống kê cho 1 tháng cụ thể
    function calcStats(data: AttendanceDto[] = [], year: number, month: number) {
        const filtered = data.filter(a => {
            if (!a.checkinDate) return false;
            const d = new Date(a.checkinDate);
            return d.getFullYear() === year && d.getMonth() === month;
        });

        // Không có dữ liệu thì trả về mặc định
        if (filtered.length === 0) {
            return { total: 0, attendanceRate: 0, avgHours: 0 };
        }

        // Danh sách nhân viên duy nhất trong tháng đó
        const employees = [...new Set(filtered.map(a => a.employeeId))];
        const employeeCount = employees.length || 1; 

        // Số ngày làm việc trong tháng (trừ T7, CN)
        const workingDays = Array.from({ length: 31 }, (_, i) => {
            const d = new Date(year, month, i + 1);
            return d.getMonth() === month && d.getDay() !== 0 && d.getDay() !== 6;
        }).filter(Boolean).length || 1;

        // --- Tổng giờ làm ---
        const total = filtered.reduce((sum, a) => {
            if (!a.checkinTime || !a.checkoutTime) return sum;
            const start = new Date(a.checkinTime).getTime();
            const end = new Date(a.checkoutTime).getTime();
            return sum + Math.max(0, (end - start) / (1000 * 60 * 60));
        }, 0);

        // --- Tỉ lệ điểm danh trung bình ---
        const employeeRates = employees.map(empId => {
            const empDays = new Set(
                filtered
                    .filter(x => x.employeeId === empId)
                    .map(x => new Date(x.checkinDate!).toDateString())
            ).size;

            return workingDays > 0 ? (empDays / workingDays) * 100 : 0;
        });

        const attendanceRate =
            employeeRates.length > 0
                ? employeeRates.reduce((s, r) => s + r, 0) / employeeRates.length
                : 0;

        // --- Tổng ngày có mặt trung bình ---
        const avgPresentDays =
            employeeRates.length > 0
                ? employeeRates.reduce((s, r) => s + (r / 100) * workingDays, 0) / employeeRates.length
                : 0;

        // --- Giờ trung bình mỗi ngày ---
        const avgHours = avgPresentDays > 0 ? total / avgPresentDays : 0;

        // Đảm bảo không NaN
        return {
            total: isFinite(total) ? total : 0,
            attendanceRate: isFinite(attendanceRate) ? attendanceRate : 0,
            avgHours: isFinite(avgHours) ? avgHours : 0,
        };
    }

    // Tính thống kê cho tháng hiện tại và tháng trước
    const currentStats = calcStats(attendances, currentYear, currentMonth);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevStats = calcStats(attendances, prevYear, prevMonth);

    // Hàm so sánh %
    function comparePercent(current: number, previous: number) {
        if (!isFinite(previous) || previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    // Tính phần trăm thay đổi
    const totalChange = comparePercent(currentStats.total, prevStats.total);
    const rateChange = comparePercent(currentStats.attendanceRate, prevStats.attendanceRate);
    const avgChange = comparePercent(currentStats.avgHours, prevStats.avgHours);

    // === Fetch Attendance ===
    useEffect(() => {
        fetchAttendances();

    }, []);
    useEffect(() => {
        if (currentUserId && attendances.length > 0) {
            updateCheckinStatus();
        }
    }, [currentUserId, attendances]);

    // Chặn Admin không cho truy cập OT
    if (currentRole === "Admin") {
        return (
            <div
                style={{
                    height: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                }}
            >
                <i
                    className="fa-solid fa-ban"
                    style={{
                        fontSize: "60px",
                        color: "red",
                        marginBottom: "20px",
                    }}
                ></i>

                <h2 className="text-danger" style={{ fontSize: "26px", marginBottom: "10px" }}>
                    Administrators are not allowed to checkin/ checkout.
                </h2>

                <p style={{ fontSize: "16px", color: "#555" }}>
                    Only Employees, HR and Managers are permitted to access attendance records.
                </p>
            </div>
        );
    }


    async function fetchAttendances() {
        setLoading(true);
        try {
            const data: AttendanceDto[] = await apiFetch("/attendance");
            setAttendances(Array.isArray(data) ? data : []); 
        } catch (err) {
            console.error("Error fetching attendances:", err);
            toast.error("Error loading attendance data");
            setAttendances([]); 
        } finally {
            setLoading(false);
        }
    }

    function updateCheckinStatus() {
        if (!currentUserId) return; 
        const today = new Date().toISOString().split("T")[0];

        const myAttendance = attendances.filter(
            (a) => a.employeeId === currentUserId
        );

        const todayRecord = myAttendance.find(
            (a) =>
                a.checkinDate?.split("T")[0] === today &&
                (a.checkoutTime === null || a.checkoutTime === undefined)
        );

        setIsCheckedIn(!!todayRecord);
    }

    // === Checkin / Checkout ===
    async function handleCheck() {
        setLoading(true);
        try {
            const endpoint = isCheckedIn
                ? "/attendance/checkout"
                : "/attendance/checkin";

            const res = await apiFetch(endpoint, "POST");

            const message =
                typeof res === "string"
                    ? res
                    : res?.message || (isCheckedIn ? "Checked out!" : "Checked in!");

            if (message.toLowerCase().includes("success")) {
                toast.success(message, { position: "top-right", autoClose: 3000 });
            } else {
                throw new Error(message || "Operation failed");
            }

            await fetchAttendances();
        } catch (err: any) {
            toast.error(err.message || "Error checking in/out", {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="section-body">
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center">
                    <ul className="nav nav-tabs page-header-tab">
                    </ul>
                    <div className="header-action">
                        <button type="button" className={`btn ${isCheckedIn ? "btn-danger" : "btn-success"}`}
                            onClick={handleCheck}
                        >
                            <i className={`fa-solid ${isCheckedIn
                                ? "fa-arrow-right-from-bracket"
                                : "fa-arrow-right-to-bracket"
                                }`}></i>
                            {" "}
                            {isCheckedIn ? "Checkout" : "Checkin"}</button>
                    </div>
                </div>
                <div className="tab-content mt-3">
                    <div className="tab-pane fade show active" id="Payroll-Salary" role="tabpanel">
                        {currentRole !== "Admin" && (
                            <div className="row clearfix">
                                <div className="col-md-4">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6>Total Working Hours</h6>
                                            <h3 className="pt-3">
                                                <span className="counter">{currentStats.total.toFixed(1)}</span>
                                            </h3>
                                            <span>
                                                <span className={totalChange >= 0 ? "text-success" : "text-danger"}>
                                                    <i className={`fa ${totalChange >= 0 ? "fa-long-arrow-up" : "fa-long-arrow-down"} mr-1`}></i>
                                                    {Math.abs(totalChange).toFixed(2)}%
                                                </span>{" "}
                                                Since last month
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6>Attendance Rate</h6>
                                            <h3 className="pt-3">
                                                <span className="counter">{currentStats.attendanceRate.toFixed(1)}%</span>
                                            </h3>
                                            <span>
                                                <span className={rateChange >= 0 ? "text-success" : "text-danger"}>
                                                    <i className={`fa ${rateChange >= 0 ? "fa-long-arrow-up" : "fa-long-arrow-down"} mr-1`}></i>
                                                    {Math.abs(rateChange).toFixed(2)}%
                                                </span>{" "}
                                                Since last month
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6>Average Hours / Day</h6>
                                            <h3 className="pt-3">
                                                <span className="counter">{currentStats.avgHours.toFixed(1)}</span>
                                            </h3>
                                            <span>
                                                <span className={avgChange >= 0 ? "text-success" : "text-danger"}>
                                                    <i className={`fa ${avgChange >= 0 ? "fa-long-arrow-up" : "fa-long-arrow-down"} mr-1`}></i>
                                                    {Math.abs(avgChange).toFixed(2)}%
                                                </span>{" "}
                                                Since last month
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Attendance</h3>
                                <div className="card-options">
                                    <form>
                                        <div className="input-group">
                                            <input type="text" className="form-control form-control-sm" placeholder="Enter name to search..." name="s"
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                }} />
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped table-vcenter text-nowrap">
                                        <thead>
                                            <tr>
                                                <th style={{ width: "20px" }}>Id</th>
                                                <th className="w200">Name</th>
                                                <th className="w200">Checkin Time</th>
                                                <th className="w200">Checkout Time</th>
                                                <th className="w100">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((attendance) => (
                                                <tr key={attendance.id}>
                                                    <td>
                                                        <span>{attendance.id}</span>
                                                    </td>
                                                    <td>
                                                        {attendance.employeeName}
                                                    </td>
                                                    <td>{attendance.checkinTime
                                                        ? new Date(attendance.checkinTime).toLocaleTimeString("vi-VN", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                        })
                                                        : ""}</td>
                                                    <td>{attendance.checkoutTime
                                                        ? new Date(attendance.checkoutTime).toLocaleTimeString("vi-VN", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                        })
                                                        : ""}</td>
                                                    <td>{attendance.checkinDate
                                                        ? new Date(attendance.checkinDate).toLocaleDateString("en-CA")
                                                        : ""}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <nav aria-label="Page navigation">
                                    <ul className="pagination mb-0 justify-content-end">

                                        {/* Previous */}
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <a className="page-link"
                                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                            >
                                                Previous
                                            </a>
                                        </li>

                                        {/* Page Numbers */}
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                                <a className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                                    {i + 1}
                                                </a>
                                            </li>
                                        ))}

                                        {/* Next */}
                                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                            <a className="page-link"
                                                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                            >
                                                Next
                                            </a>
                                        </li>

                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <ToastContainer />
        </div>
    );
}