"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch } from "@/app/utils/apiClient";

interface RecruitmentRequirementDto {
    id?: number;
    requirement?: string;
    positionId?: number;
    positionName?: string;
    employeeId?: number;
    employeeName?: string;
    status?: number;
}

interface RecruitmentPosition {
    id: number;
    positionName: string;
    description?: string;
    departmentId?: number;
    departmentName?: string;
}

export default function RecruitmentPage() {
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [requirements, setRequirements] = useState<RecruitmentRequirementDto[]>([]);
    const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [currentRequirement, setCurrentRequirement] =
        useState<RecruitmentRequirementDto | null>(null);
    const [processRequirements, setProcessRequirements] =
        useState<RecruitmentRequirementDto | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<number | null>(null);

    const [currentRole, setCurrentRole] = useState<string>("");

    const statuses = [
        { value: 0, label: "Pending", className: "badge badge-warning" },
        { value: 1, label: "Approved", className: "badge badge-success" },
        { value: 2, label: "Rejected", className: "badge badge-danger" },
        { value: 3, label: "Completed", className: "badge badge-primary" },
        { value: 4, label: "Cancelled", className: "badge badge-secondary" },
    ];

    // Filter safely (no crash when null)
    const filteredRequirements = (requirements ?? []).filter((req) => {
        const matchesSearch =
            req.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === null || req.status === filterStatus;

        return matchesSearch && matchesStatus;
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Tính tổng số trang
    const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);

    // Tính dữ liệu đang hiển thị theo trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequirements.slice(indexOfFirstItem, indexOfLastItem);
    // Load role from JWT
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const role =
                payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";

            setCurrentRole(role);
        } catch (err) {
            console.error("JWT decode error:", err);
        }
    }, []);

    // OPEN MODALS
    function openAdd() {
        setModalMode("add");
        setCurrentRequirement({
            requirement: "",
            positionId: undefined,
            status: 0,
        });
    }

    function openEdit(req: RecruitmentRequirementDto) {
        setModalMode("edit");
        setCurrentRequirement(req);
    }

    function openProcess(req: RecruitmentRequirementDto) {
        setProcessRequirements(req);
    }

    // LOAD DATA
    useEffect(() => {
        async function loadData() {
            try {
                // Load positions
                let positionsUrl = "/recruitmentposition";
                if (currentRole === "Manager")
                    positionsUrl = "/recruitmentposition/by-department";

                const posData = await apiFetch(positionsUrl).catch(() => []);
                setPositions(Array.isArray(posData) ? posData : []);

                // Load requirements
                const reqData = await apiFetch("/recruitmentrequirement").catch(() => []);
                setRequirements(Array.isArray(reqData) ? reqData : []);

                setLoading(false);
            } catch (err: unknown) {
                const error = err as Error;
                setError(error.message);
                setPositions([]);
                setRequirements([]);
                setLoading(false);
            }
        }

        loadData();
    }, [currentRole]);

    if (loading) return <div>Loading...</div>;
    if (currentRole !== "Manager" && currentRole !== "HR") {
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
                    This page is restricted to HR and Manager roles.
                </h2>

                <p style={{ fontSize: "16px", color: "#555" }}>
                    Your role does not include access to recruitment requests.
                </p>
            </div>
        );
    }

    // SAVE REQUIREMENT
    async function handleSave() {
        try {
            const token = localStorage.getItem("jwt");
            if (!token) return;

            const payload = JSON.parse(atob(token.split(".")[1]));
            const empId = payload["employeeId"] || payload["sub"];

            const body =
                modalMode === "add"
                    ? {
                        requirement: currentRequirement?.requirement,
                        positionId: currentRequirement?.positionId,
                        employeeId: empId,
                        status: 0,
                    }
                    : {
                        id: currentRequirement?.id,
                        requirement: currentRequirement?.requirement,
                        positionId: currentRequirement?.positionId,
                        status: currentRequirement?.status,
                    };

            const url =
                modalMode === "add"
                    ? "/recruitmentrequirement"
                    : `/recruitmentrequirement/${currentRequirement?.id}`;

            const method = modalMode === "add" ? "POST" : "PUT";

            await apiFetch(url, method, body);

            toast.success("Requirement saved successfully");

            const reqs = await apiFetch("/recruitmentrequirement").catch(() => []);
            setRequirements(Array.isArray(reqs) ? reqs : []);

            (window as any).$("#exampleModal").modal("hide");
        } catch (err: any) {
            toast.error(err.message || "Save failed");
        }
    }

    // PROCESS APPROVAL
    async function handleProcess() {
        if (!processRequirements?.id) return;

        try {
            await apiFetch(
                `/recruitmentrequirement/approve/${processRequirements.id}`,
                "POST",
                processRequirements.status
            );

            toast.success("Requirement processed!");

            const reqs = await apiFetch("/recruitmentrequirement").catch(() => []);
            setRequirements(Array.isArray(reqs) ? reqs : []);

            (window as any).$("#processModal").modal("hide");
        } catch (err: any) {
            toast.error(err.message || "Process failed");
        }
    }

    return (
        <div className="section-body mt-3">
            <div className="container-fluid">

                {/* SEARCH + FILTER */}
                <div className="card">
                    <div className="card-body">
                        <div className="row">

                            <div className="col-lg-6">
                                <label>Search</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search requester..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            <div className="col-lg-6">
                                <label>Status</label>
                                <select
                                    className="custom-select"
                                    value={filterStatus ?? ""}
                                    onChange={(e) => {
                                        setFilterStatus(
                                            e.target.value ? Number(e.target.value) : null
                                        );
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">All Status</option>
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="card mt-3">
                    <div className="card-header border-bottom d-flex justify-content-between">
                        <h3 className="card-title">Recruitment Requirements</h3>

                        {currentRole === "Manager" ? (
                            <button
                                className="btn btn-primary"
                                data-toggle="modal"
                                data-target="#exampleModal"
                                onClick={openAdd}
                            >
                                <i className="fa fa-plus mr-2"></i>Add
                            </button>
                        ) : null}
                    </div>

                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>ID</th>
                                        <th>Requester</th>
                                        <th>Requirement</th>
                                        <th>Position</th>
                                        <th>Status</th>
                                        {(currentRole === "HR" || currentRole === "Manager") ? (
                                            <th>Action</th>
                                        ) : null}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(currentItems ?? []).map((r) => (
                                        <tr key={r.id}>
                                            <td>
                                                <input type="checkbox" />
                                            </td>
                                            <td>{r.id}</td>
                                            <td>{r.employeeName}</td>
                                            <td>{r.requirement}</td>
                                            <td>{r.positionName}</td>
                                            <td>
                                                {(() => {
                                                    const status = statuses.find(
                                                        (s) => s.value === r.status
                                                    );
                                                    return status ? (
                                                        <span className={status.className}>
                                                            {status.label}
                                                        </span>
                                                    ) : (
                                                        "N/A"
                                                    );
                                                })()}
                                            </td>

                                            {(currentRole === "HR" || currentRole === "Manager") ? (
                                                <td>
                                                    {currentRole === "Manager" ? (
                                                        <button
                                                            className="btn btn-icon"
                                                            data-toggle="modal"
                                                            data-target="#exampleModal"
                                                            onClick={() => openEdit(r)}
                                                        >
                                                            <i className="fa fa-edit"></i>
                                                        </button>
                                                    ) : null}

                                                    {currentRole === "HR" ? (
                                                        <button
                                                            className="btn btn-icon"
                                                            data-toggle="modal"
                                                            data-target="#processModal"
                                                            onClick={() => openProcess(r)}
                                                        >
                                                            <i className="fa fa-check-circle"></i>
                                                        </button>
                                                    ) : null}
                                                </td>
                                            ) : null}
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

                {/* MODAL: ADD / EDIT */}
                <div className="modal fade" id="exampleModal">
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5>{modalMode === "add" ? "Add Requirement" : "Edit Requirement"}</h5>
                                <button className="close" data-dismiss="modal">&times;</button>
                            </div>

                            <div className="modal-body">

                                {/* REQUIREMENT TEXT */}
                                <div className="form-group">
                                    <label>Requirement</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentRequirement?.requirement ?? ""}
                                        onChange={(e) =>
                                            setCurrentRequirement((prev) => ({
                                                ...(prev || {}),
                                                requirement: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* POSITION SELECT */}
                                <div className="form-group">
                                    <label>Position</label>
                                    <select
                                        className="form-control"
                                        value={currentRequirement?.positionId ?? ""}
                                        onChange={(e) =>
                                            setCurrentRequirement((prev) => ({
                                                ...(prev || {}),
                                                positionId: Number(e.target.value),
                                            }))
                                        }
                                    >
                                        <option value="">Select Position</option>
                                        {positions.map((pos) => (
                                            <option key={pos.id} value={pos.id}>
                                                {pos.positionName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* STATUS ONLY IN EDIT */}
                                {modalMode === "edit" && (
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            className="form-control"
                                            value={currentRequirement?.status ?? ""}
                                            onChange={(e) =>
                                                setCurrentRequirement((prev) => ({
                                                    ...(prev || {}),
                                                    status: Number(e.target.value),
                                                }))
                                            }
                                        >
                                            <option value="">Select Status</option>
                                            {statuses.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
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
                                    Save
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* MODAL: PROCESS */}
                <div className="modal fade" id="processModal">
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5>Process Requirement</h5>
                                <button className="close" data-dismiss="modal">&times;</button>
                            </div>

                            <div className="modal-body">
                                <label>Status</label>
                                <select
                                    className="form-control"
                                    value={processRequirements?.status ?? ""}
                                    onChange={(e) =>
                                        setProcessRequirements((prev) => ({
                                            ...(prev || {}),
                                            status: Number(e.target.value),
                                        }))
                                    }
                                >
                                    <option value="">Select Status</option>
                                    {statuses
                                        .filter((s) => s.value === 1 || s.value === 2 || s.value === 3)
                                        .map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-secondary" data-dismiss="modal">
                                    Close
                                </button>
                                <button className="btn btn-success" onClick={handleProcess}>
                                    Save
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <ToastContainer />
            </div>
        </div>
    );
}
