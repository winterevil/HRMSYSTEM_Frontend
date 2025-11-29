"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch } from "@/app/utils/apiClient";

interface OvertimeRequestDto {
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

export default function OvertimeRequest() {
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [processRequest, setProcessRequest] = useState<OvertimeRequestDto | null>(null);

    const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequestDto[]>([]);
    const [currentRequest, setCurrentRequest] = useState<OvertimeRequestDto | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [currentRole, setCurrentRole] = useState<string>("");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    // ---- Decode JWT ----
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));

            const role =
                payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";

            const empId =
                payload["employeeId"] ||
                payload["nameid"] ||
                payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            setCurrentRole(role);
            setCurrentUserId(empId ? Number(empId) : null);

            console.log("Decoded in LeaveRequest:", { empId, role });

        } catch (err) {
            console.error("Error decoding JWT", err);
        }
    }, []);


    const statuses = [
        { value: 0, label: "Pending", className: "badge badge-warning" },
        { value: 1, label: "Approved", className: "badge badge-success" },
        { value: 2, label: "Rejected", className: "badge badge-danger" },
        { value: 3, label: "Cancelled", className: "badge badge-secondary" },
    ];

    const formatDateTime = (v?: string) => {
        if (!v) return "";
        const d = new Date(v);
        return (
            d.toLocaleDateString("en-CA") +
            " | " +
            d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        );
    };

    // ---- Stats ----
    const filterByMonth = (list: OvertimeRequestDto[], offset = 0) => {
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        return list.filter((r) => {
            if (!r.startTime) return false;
            const d = new Date(r.startTime);
            return (
                d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth()
            );
        });
    };

    const calcStats = (list: OvertimeRequestDto[]) => {
        const pending = list.filter((r) => r.status === 0).length;
        const approved = list.filter((r) => r.status === 1).length;
        const rejected = list.filter((r) => r.status === 2).length;

        const approvedHours = list
            .filter((r) => r.status === 1 && r.startTime && r.endTime)
            .reduce((sum, r) => {
                const start = new Date(r.startTime!).getTime();
                const end = new Date(r.endTime!).getTime();
                return sum + (end - start) / 3600000;
            }, 0);

        return { pending, approved, rejected, approvedHours };
    };

    const comparePercent = (cur: number, prev: number) => {
        if (prev === 0) return cur > 0 ? 100 : 0;
        return ((cur - prev) / prev * 100).toFixed(1);
    };

    const hasData = overtimeRequests.length > 0;
    const curMonth = hasData ? filterByMonth(overtimeRequests, 0) : [];
    const prevMonth = hasData ? filterByMonth(overtimeRequests, -1) : [];
    const curStats = hasData ? calcStats(curMonth) : { pending: 0, approved: 0, rejected: 0, approvedHours: 0 };
    const prevStats = hasData ? calcStats(prevMonth) : { pending: 0, approved: 0, rejected: 0, approvedHours: 0 };

    const pendingChange = comparePercent(curStats.pending, prevStats.pending);
    const approvedChange = comparePercent(curStats.approved, prevStats.approved);
    const rejectedChange = comparePercent(curStats.rejected, prevStats.rejected);
    const approvedHoursChange = comparePercent(curStats.approvedHours, prevStats.approvedHours);

    // ---- Open modals ----
    const openAdd = () => {
        setModalMode("add");
        setCurrentRequest(null);
    };

    const openEdit = (r: OvertimeRequestDto) => {
        setModalMode("edit");
        setCurrentRequest(r);
    };

    const openProcess = (r: OvertimeRequestDto) => {
        setProcessRequest(r);
    };

    // ---- Load data ----
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await apiFetch("/overtimerequest");
            setOvertimeRequests(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Load error", e);
            setOvertimeRequests([]);
        }
    }

    // ---- SAVE ----
    async function handleSave() {
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

        try {
            await apiFetch("/overtimerequest", method, body);
            toast.success("Save successful");
            loadData();
            (window as any).$("#exampleModal").modal("hide");
        } catch (e: any) {
            toast.error(e.message);
        }
    }

    // ---- PROCESS ----
    async function handleProcessSave() {
        if (!processRequest?.id) return;

        try {
            await apiFetch(
                `/overtimerequest/approve/${processRequest.id}?status=${processRequest.status}`,
                "POST"
            );
            toast.success("Process successful");
            loadData();
            (window as any).$("#processModal").modal("hide");
        } catch (e: any) {
            toast.error(e.message);
        }
    }

    // ---- FILTER ----
    const filteredRequests =
        overtimeRequests.filter((r) =>
            r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ?? [];
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Tính tổng số trang
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    // Tính dữ liệu đang hiển thị theo trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    return (
        <div className="section-body">
            <div className="container-fluid">

                {/* ------- HEADER + BUTTON ADD -------- */}
                <div className="d-flex justify-content-between align-items-center">
                    <ul className="nav nav-tabs page-header-tab"></ul>

                    {currentRole !== "Admin" && (
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
                    )}
                </div>

                {/* ------- DASHBOARD -------- */}
                {currentRole !== "Admin" && (
                    <div className="row clearfix mt-3">
                        {/* Pending */}
                        <div className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <h6>Waiting for HR</h6>
                                    <h3 className="pt-3">{curStats.pending}</h3>
                                    <span className={parseFloat(pendingChange) >= 0 ? "text-success" : "text-danger"}>
                                        {pendingChange}%</span> Since last month
                                </div>
                            </div>
                        </div>

                        {/* Approved */}
                        <div className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <h6>Approved by HR</h6>
                                    <h3 className="pt-3">{curStats.approved}</h3>
                                    <span className={parseFloat(approvedChange) >= 0 ? "text-success" : "text-danger"}>
                                        {approvedChange}%</span> Since last month
                                </div>
                            </div>
                        </div>

                        {/* Rejected */}
                        <div className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <h6>Rejected</h6>
                                    <h3 className="pt-3">{curStats.rejected}</h3>
                                    <span className={parseFloat(rejectedChange) >= 0 ? "text-success" : "text-danger"}>
                                        {rejectedChange}%</span> Since last month
                                </div>
                            </div>
                        </div>

                        {/* Total Hours */}
                        <div className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <h6>Total OT</h6>
                                    <h3 className="pt-3">{curStats.approvedHours.toFixed(1)}</h3>
                                    <span className={parseFloat(approvedHoursChange) >= 0 ? "text-success" : "text-danger"}>
                                        {approvedHoursChange}%</span> Since last month
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ------- TABLE -------- */}
                <div className="card mt-3">
                    <div className="card-header border-bottom">
                        <h3 className="card-title">Overtime Request</h3>
                        <div className="card-options">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Enter name to search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="table-responsive">

                            <table className="table table-hover table-striped table-vcenter text-nowrap overtime-table">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Name</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Processed By</th>
                                        {currentRole !== "Admin" && <th>Action</th>}
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentItems.map((r) => (
                                        <tr key={r.id}>
                                            <td>{r.id}</td>
                                            <td>{r.employeeName}</td>
                                            <td>{formatDateTime(r.startTime)}</td>
                                            <td>{formatDateTime(r.endTime)}</td>
                                            <td>{r.reason}</td>
                                            <td>
                                                <span className={statuses.find(s => s.value === r.status)?.className}>
                                                    {statuses.find(s => s.value === r.status)?.label}
                                                </span>
                                            </td>
                                            <td>{r.approvedByName || ""}</td>

                                            {currentRole !== "Admin" && (
                                                <td>
                                                    {r.employeeId === currentUserId && (
                                                        <button
                                                            className="btn btn-icon"
                                                            data-toggle="modal"
                                                            data-target="#exampleModal"
                                                            onClick={() => openEdit(r)}
                                                        >
                                                            <i className="fa-solid fa-edit"></i>
                                                        </button>
                                                    )}

                                                    {currentRole !== "Employee" && (
                                                        <button
                                                            className="btn btn-icon"
                                                            data-toggle="modal"
                                                            data-target="#processModal"
                                                            onClick={() => openProcess(r)}
                                                        >
                                                            <i className="fa-solid fa-check-circle"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            )}
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

            {/* ----------- MODALS ----------- */}

            {/* ADD & EDIT */}
            <div className="modal fade" id="exampleModal" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                {modalMode === "add" ? "Request Overtime" : "Edit Overtime"}
                            </h5>
                            <button className="close" data-dismiss="modal">
                                <span>&times;</span>
                            </button>
                        </div>

                        <div className="modal-body">

                            <input type="hidden" value={currentRequest?.id ?? ""} />

                            <div className="form-group">
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={currentRequest?.startTime ?? ""}
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
                                    type="datetime-local"
                                    className="form-control"
                                    value={currentRequest?.endTime ?? ""}
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
                                    value={currentRequest?.reason ?? ""}
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
                                        value={currentRequest?.status ?? ""}
                                        onChange={(e) =>
                                            setCurrentRequest({
                                                ...currentRequest,
                                                status: Number(e.target.value),
                                            })
                                        }
                                    >
                                        <option value="">Select Status</option>
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

            {/* PROCESS */}
            <div className="modal fade" id="processModal" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">Process Overtime</h5>
                            <button className="close" data-dismiss="modal">
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
                                            <option value={s.value} key={s.value}>
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
