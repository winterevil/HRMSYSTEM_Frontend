"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch } from "@/app/utils/apiClient";

interface LeaveRequestDto {
    id?: number;
    startTime?: string;
    endTime?: string;
    reason?: string;
    employeeId?: number;
    employeeName?: string;
    approvedById?: number;
    approvedByName?: string;
    status?: number;
}

export default function LeaveRequest() {
    // ======================= STATE =======================
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [processRequest, setProcessRequest] = useState<LeaveRequestDto | null>(null);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequestDto[]>([]);
    const [currentRequest, setCurrentRequest] = useState<LeaveRequestDto | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentRole, setCurrentRole] = useState<string>("");

    const filteredRequests = leaveRequests.filter((r) =>
        r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Tính tổng số trang
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    // Tính dữ liệu đang hiển thị theo trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    // ======================= GET ROLE =======================
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const role =
                payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
            setCurrentRole(role);
        } catch (err) {
            console.error("Error decoding JWT", err);
        }
    }, []);

    // ======================= STATUS =======================
    const statuses = [
        { value: 0, label: "Pending", className: "badge badge-warning" },
        { value: 1, label: "Approved", className: "badge badge-success" },
        { value: 2, label: "Rejected", className: "badge badge-danger" },
        { value: 3, label: "Cancelled", className: "badge badge-secondary" },
    ];

    // ======================= HELPER =======================
    function filterByMonth(requests: LeaveRequestDto[], monthOffset = 0) {
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

        return requests.filter((r) => {
            if (!r.startTime) return false;
            const d = new Date(r.startTime);
            return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
        });
    }

    function calcStats(requests: LeaveRequestDto[]) {
        const pending = requests.filter((r) => r.status === 0).length;
        const approved = requests.filter((r) => r.status === 1).length;
        const rejected = requests.filter((r) => r.status === 2).length;

        const approvedDays = requests
            .filter((r) => r.status === 1 && r.startTime && r.endTime)
            .reduce((sum, r) => {
                const start = new Date(r.startTime!).getTime();
                const end = new Date(r.endTime!).getTime();
                const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                return sum + diffDays;
            }, 0);

        return { pending, approved, rejected, approvedDays };
    }

    function comparePercent(current: number, previous: number) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
    }

    function toDateInputValue(dateString?: string): string {
        if (!dateString) return "";
        const d = new Date(dateString);
        return d.toISOString().split("T")[0];
    }

    // ======================= STATS CALC =======================
    const hasData = leaveRequests.length > 0;
    const currentMonth = hasData ? filterByMonth(leaveRequests, 0) : [];
    const prevMonth = hasData ? filterByMonth(leaveRequests, -1) : [];

    const currentStats = hasData
        ? calcStats(currentMonth)
        : { pending: 0, approved: 0, rejected: 0, approvedDays: 0 };

    const prevStats = hasData
        ? calcStats(prevMonth)
        : { pending: 0, approved: 0, rejected: 0, approvedDays: 0 };

    const pendingChange = comparePercent(currentStats.pending, prevStats.pending);
    const approvedChange = comparePercent(currentStats.approved, prevStats.approved);
    const rejectedChange = comparePercent(currentStats.rejected, prevStats.rejected);
    const approvedDaysChange = comparePercent(currentStats.approvedDays, prevStats.approvedDays);

    // ======================= LOAD DATA =======================
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await apiFetch("/leaverequest");
            setLeaveRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading leave requests", err);
            setLeaveRequests([]);
        }
    }

    // ======================= BUTTON FUNCTIONS =======================
    function openAdd() {
        setModalMode("add");
        setCurrentRequest(null);
    }

    function openEdit(request: LeaveRequestDto) {
        setModalMode("edit");
        setCurrentRequest(request);
    }

    function openProcess(request: LeaveRequestDto) {
        setProcessRequest(request);
    }

    // ======================= SAVE =======================
    async function handleSave() {
        try {
            const token = localStorage.getItem("jwt");
            if (!token) return;

            const payload = JSON.parse(atob(token.split(".")[1]));
            const empId = payload["employeeId"] || payload["sub"];

            const body =
                modalMode === "add"
                    ? {
                        startTime: currentRequest?.startTime,
                        endTime: currentRequest?.endTime,
                        reason: currentRequest?.reason,
                        employeeId: empId,
                        status: 0,
                    }
                    : {
                        id: currentRequest?.id,
                        startTime: currentRequest?.startTime,
                        endTime: currentRequest?.endTime,
                        reason: currentRequest?.reason,
                        status: currentRequest?.status,
                    };

            const method = modalMode === "add" ? "POST" : "PUT";

            await apiFetch("/leaverequest", method, body);
            toast.success("Save successful");

            loadData();
            (window as any)["$"]("#exampleModal").modal("hide");
        } catch (err: any) {
            toast.error(err.message);
        }
    }

    // ======================= PROCESS =======================
    async function handleProcessSave() {
        if (!processRequest?.id) return;

        try {
            await apiFetch(
                `/leaverequest/approve/${processRequest.id}?status=${processRequest.status}`,
                "POST"
            );
            toast.success("Process successful");

            loadData();
            (window as any)["$"]("#processModal").modal("hide");
        } catch (err: any) {
            toast.error(err.message);
        }
    }

    // ============================================================
    //                         RENDER UI
    // ============================================================
    return (
        <div className="section-body">
            <div className="container-fluid">
                {/* Nếu Admin -> Chỉ ẩn nội dung, KHÔNG return sớm */}
                {currentRole === "Admin" ? (
                    <div
                        style={{
                            height: "70vh",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <i className="fa-solid fa-ban text-danger" style={{ fontSize: 70 }}></i>
                        <h3 className="text-danger mt-3">
                            Administrators are not allowed to request leave.
                        </h3>
                        <p>Only Employees, HR and Managers can access leave requests.</p>
                    </div>
                ) : (
                    <>
                        {/* ---------- Action Header ---------- */}
                        <div className="d-flex justify-content-between align-items-center">
                            <ul className="nav nav-tabs page-header-tab"></ul>

                            <div className="header-action">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-toggle="modal"
                                    data-target="#exampleModal"
                                    onClick={openAdd}
                                >
                                    <i className="fa-solid fa-plus mr-2"></i>Add
                                </button>
                            </div>
                        </div>

                        {/* ---------- Statistics ---------- */}
                        <div className="row clearfix mt-4">
                            <div className="col-lg-3 col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h6>Pending</h6>
                                        <h3 className="pt-3">{currentStats.pending}</h3>
                                        <span className={parseFloat(pendingChange) >= 0 ? "text-success" : "text-danger"}>
                                            {pendingChange}%
                                        </span>{" "}
                                        Since last month
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h6>Approved</h6>
                                        <h3 className="pt-3">{currentStats.approved}</h3>
                                        <span className={parseFloat(approvedChange) >= 0 ? "text-success" : "text-danger"}>
                                            {approvedChange}%
                                        </span>{" "}
                                        Since last month
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h6>Rejected</h6>
                                        <h3 className="pt-3">{currentStats.rejected}</h3>
                                        <span className={parseFloat(rejectedChange) >= 0 ? "text-success" : "text-danger"}>
                                            {rejectedChange}%
                                        </span>{" "}
                                        Since last month
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-3 col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <h6>Total Leave Days</h6>
                                        <h3 className="pt-3">{currentStats.approvedDays}</h3>
                                        <span className={parseFloat(approvedDaysChange) >= 0 ? "text-success" : "text-danger"}>
                                            {approvedDaysChange}%
                                        </span>{" "}
                                        Since last month
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ---------- Table ---------- */}
                        <div className="card mt-4">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Leave Request</h3>
                                <div className="card-options">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped text-nowrap">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Start</th>
                                                <th>End</th>
                                                <th>Reason</th>
                                                <th>Status</th>
                                                <th>Processed By</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {currentItems.map((r) => (
                                                <tr key={r.id}>
                                                    <td>{r.id}</td>
                                                    <td>{r.employeeName}</td>
                                                    <td>{r.startTime ? new Date(r.startTime).toLocaleDateString("en-CA") : ""}</td>
                                                    <td>{r.endTime ? new Date(r.endTime).toLocaleDateString("en-CA") : ""}</td>
                                                    <td>{r.reason}</td>
                                                    <td>
                                                        <span className={statuses.find((s) => s.value === r.status)?.className}>
                                                            {statuses.find((s) => s.value === r.status)?.label}
                                                        </span>
                                                    </td>
                                                    <td>{r.approvedByName || ""}</td>

                                                    <td>
                                                        {/* EDIT */}
                                                        <button
                                                            className="btn btn-sm btn-icon"
                                                            data-toggle="modal"
                                                            data-target="#exampleModal"
                                                            onClick={() => openEdit(r)}
                                                        >
                                                            <i className="fa-solid fa-edit"></i>
                                                        </button>

                                                        {/* PROCESS (Only HR + Manager) */}
                                                        {currentRole !== "Employee" && (
                                                            <button
                                                                className="btn btn-sm btn-icon ml-2"
                                                                data-toggle="modal"
                                                                data-target="#processModal"
                                                                onClick={() => setProcessRequest(r)}
                                                            >
                                                                <i className="fa-solid fa-check-circle"></i>
                                                            </button>
                                                        )}
                                                    </td>
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
                    </>
                )}
            </div>

            {/* ================= MODAL ADD/EDIT ================= */}
            <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {modalMode === "add" ? "Request Leave" : "Edit Leave Request"}
                            </h5>
                            <button type="button" className="close" data-dismiss="modal">
                                <span>&times;</span>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={toDateInputValue(currentRequest?.startTime)}
                                    onChange={(e) =>
                                        setCurrentRequest({
                                            ...currentRequest,
                                            startTime: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="date"
                                    className="form-control"
                                    value={toDateInputValue(currentRequest?.endTime)}
                                    onChange={(e) =>
                                        setCurrentRequest({
                                            ...currentRequest,
                                            endTime: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Reason"
                                    value={currentRequest?.reason || ""}
                                    onChange={(e) =>
                                        setCurrentRequest({
                                            ...currentRequest,
                                            reason: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {modalMode === "edit" && (
                                <div className="form-group">
                                    <select
                                        className="form-control"
                                        value={currentRequest?.status}
                                        onChange={(e) =>
                                            setCurrentRequest({
                                                ...currentRequest,
                                                status: Number(e.target.value),
                                            })
                                        }
                                    >
                                        <option value="">Select status</option>
                                        {statuses.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-dismiss="modal">
                                Close
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= MODAL PROCESS ================= */}
            <div className="modal fade" id="processModal" tabIndex={-1} role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Process Leave Request</h5>
                            <button type="button" className="close" data-dismiss="modal">
                                <span>&times;</span>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <select
                                    className="form-control"
                                    value={processRequest?.status ?? ""}
                                    onChange={(e) =>
                                        setProcessRequest({
                                            ...processRequest,
                                            status: Number(e.target.value),
                                        })
                                    }
                                >
                                    <option value="">Select Status</option>

                                    {statuses
                                        .filter((s) => s.value === 1 || s.value === 2)
                                        .map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-dismiss="modal">
                                Close
                            </button>
                            <button className="btn btn-success" onClick={handleProcessSave}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}
