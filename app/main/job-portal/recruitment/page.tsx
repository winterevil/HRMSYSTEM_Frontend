"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [processRequirements, setProcessRequirements] = useState<RecruitmentRequirementDto | null>(null);
    const [currentRequirement, setCurrentRequirement] = useState<RecruitmentRequirementDto | null>(null);
    const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<number | null>(null);
    const statuses = [
        { value: 0, label: "Pending", className: "badge badge-warning" },
        { value: 1, label: "Approved", className: "badge badge-success" },
        { value: 2, label: "Rejected", className: "badge badge-danger" },
        { value: 3, label: "Completed", className: "badge badge-primary" },
        { value: 4, label: "Cancelled", className: "badge badge-secondary" },
    ];

    const filteredRequirements = requirements.filter((emp) => {
        const matchesSearch = emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === undefined ||
            filterStatus === null ||
            isNaN(filterStatus) ||
            emp.status === filterStatus;
        return matchesSearch && matchesStatus;
    });


    // Lấy vai trò hiện tại từ JWT
    const [currentRole, setCurrentRole] = useState<string>("");

    // Giải mã JWT để lấy vai trò
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                // Giải mã payload của JWT
                const payload = JSON.parse(atob(token.split(".")[1]));

                // Lấy vai trò từ payload
                const role =
                    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                    "";

                setCurrentRole(role);
            } catch (err) {
                console.error("Error decoding JWT", err);
            }
        }
    }, []);

    function openAdd() {
        setModalMode("add");
        setCurrentRequirement(null);
    }

    function openEdit(requirement: RecruitmentRequirementDto) {
        setModalMode("edit");
        setCurrentRequirement(requirement);
    }

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            window.location.href = "/auth/login";
            return;
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        async function loadData() {
            try {
                const token = localStorage.getItem("jwt");
                const headers = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                };

                const payload = JSON.parse(atob(token.split(".")[1]));
                const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

                let positionsUrl = "https://localhost:7207/api/recruitmentposition";
                if (role === "Manager") {
                    positionsUrl = "https://localhost:7207/api/recruitmentposition/by-department";
                }

                // Fetch từng cái để tránh throw toàn bộ
                const positionsRes = await fetch(positionsUrl, { headers });
                const positionsData = await positionsRes.json();
                setPositions(positionsData);

                const requirementsRes = await fetch("https://localhost:7207/api/recruitmentrequirement", { headers });
                if (requirementsRes.ok) {
                    const requirementsData = await requirementsRes.json();
                    setRequirements(requirementsData);
                } else {
                    console.warn("⚠️ RecruitmentRequirement fetch failed:", requirementsRes.status);
                }

                setLoading(false);
            } catch (err) {
                const error = err as Error;
                setError(error.message);
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    //if (error) return <div className="alert alert-danger">{error}</div>;

    async function handleSave() {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }

        try {
            let body: any = {};

            if (modalMode === "add") {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const empId = payload["employeeId"] || payload["sub"];
                body = {
                    requirement: currentRequirement?.requirement,
                    positionId: currentRequirement?.positionId,
                    employeeId: empId,
                    status: 0
                };
            } else {
                body = {
                    id: currentRequirement?.id,
                    requirement: currentRequirement?.requirement,
                    positionId: currentRequirement?.positionId,
                    status: currentRequirement?.status
                };
            }
            const url = modalMode === "add"
                ? "https://localhost:7207/api/recruitmentrequirement"
                : `https://localhost:7207/api/recruitmentrequirement/${currentRequirement?.id}`;

            const method = modalMode === "add" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || "Something went wrong");
            }

            toast.success("Requirement saved successfully", {
                position: "top-right",
                autoClose: 3000,
            });

            const requirementsRes = await fetch("https://localhost:7207/api/recruitmentrequirement", { headers });
            const requirements = await requirementsRes.json();
            setRequirements(requirements);

            (window as any).$("#exampleModal").modal("hide");
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    }

    function openProcess(requirement: RecruitmentRequirementDto) {
        setProcessRequirements(requirement);
    }

    async function handleProcess() {
        if (!processRequirements?.id) return;
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }

        try {
            const url = `https://localhost:7207/api/recruitmentrequirement/approve/${processRequirements.id}`;
            const body = JSON.stringify(processRequirements.status); 

            const response = await fetch(url, {
                method: "POST",
                headers,
                body
            });

            if (!response.ok) throw new Error(await response.text());

            toast.success("Requirement processed successfully", {
                position: "top-right",
                autoClose: 3000,
            });

            const requirementsRes = await fetch("https://localhost:7207/api/recruitmentrequirement", { headers });
            const requirements = await requirementsRes.json();
            setRequirements(requirements);

            (window as any).$("#processModal").modal("hide");
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    }
    return (
        <div className="section-body mt-3">
            <div className="container-fluid">
                <div className="row clearfix">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-sm-6">
                                        <label>Search</label>
                                        <div className="input-group">
                                            <input type="text" className="form-control" placeholder="Enter name to search..."
                                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="col-lg-6 col-md-6 col-sm-6">
                                        <label>Status</label>
                                        <div className="form-group">
                                            <select className="custom-select" value={filterStatus ?? ""} 
                                                onChange={(e) =>
                                                    setFilterStatus(e.target.value ? Number(e.target.value) : null)
                                                }>
                                                <option value="">All Statuses</option>
                                                {statuses.map((status) => (
                                                    <option key={status.value} value={status.value}>{status.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="tab-content mt-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <ul className="nav nav-tabs page-header-tab">

                                </ul>
                                {currentRole === "Manager" && (
                                    <div className="header-action">
                                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onClick={() => openAdd()}><i className="fa-solid fa-plus mr-2"></i>Add</button>
                                    </div>
                                )}
                            </div>
                            <div className="tab-pane fade show active" id="Departments-list" role="tabpanel">
                                <div className="card">
                                    <div className="card-header border-bottom">
                                        <h3 className="card-title">Recruitment Requirement List</h3>

                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-striped table-vcenter table-hover mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>ID</th>
                                                        <th>Requester</th>
                                                        <th>Requirement</th>
                                                        <th>Position</th>
                                                        <th>Status</th>
                                                        {(currentRole === "HR" || currentRole === "Manager") && (
                                                            <th>Action</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredRequirements.map((requirement) => (
                                                        <tr key={requirement.id}>
                                                            <td className="w40">
                                                                <label className="custom-control custom-checkbox">
                                                                    <input type="checkbox" className="custom-control-input" name="example-checkbox1" value="option1" />
                                                                    <span className="custom-control-label">&nbsp;</span>
                                                                </label>
                                                            </td>
                                                            <td>{requirement.id}</td>
                                                            <td><div className="font-15">{requirement.employeeName}</div></td>
                                                            <td>{requirement.requirement}</td>
                                                            <td>{requirement.positionName}</td>
                                                            <td>{(() => {
                                                                const status = statuses.find((s) => s.value === requirement.status);
                                                                return status ? (
                                                                    <span className={status.className}>{status.label}</span>
                                                                ) : (
                                                                    "N/A"
                                                                );
                                                            })()}</td>
                                                            {(currentRole === "HR" || currentRole === "Manager") && (
                                                                <td>
                                                                    {currentRole === "Manager" && (
                                                                        <button type="button" className="btn btn-icon" title="Edit" data-toggle="modal" data-target="#exampleModal" onClick={() => openEdit(requirement)}><i className="fa-solid fa-edit"></i></button>
                                                                    )}
                                                                    {currentRole === "HR" && (
                                                                        <button type="button" className="btn btn-icon" title="Process" data-toggle="modal" data-target="#processModal" onClick={() => openProcess(requirement)}>
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
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ul className="pagination mt-2">
                            <li className="page-item"><a className="page-link" href="javascript:void(0);">Previous</a></li>
                            <li className="page-item active"><a className="page-link" href="javascript:void(0);">1</a></li>
                            <li className="page-item"><a className="page-link" href="javascript:void(0);">2</a></li>
                            <li className="page-item"><a className="page-link" href="javascript:void(0);">3</a></li>
                            <li className="page-item"><a className="page-link" href="javascript:void(0);">Next</a></li>
                        </ul>
                    </div>
                </div>
            </div>


            <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{modalMode === "add" ? "Add Requirement" : "Edit Requirement"}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <div className="row clearfix">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="hidden" className="form-control" placeholder="Requirement Id"
                                            value={currentRequirement?.id ?? ""} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Requirement"
                                            value={currentRequirement?.requirement ?? ""}
                                            onChange={(e) => setCurrentRequirement({ ...currentRequirement, requirement: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <select
                                            className="form-control"
                                            value={currentRequirement?.positionId ?? ""}
                                            onChange={(e) =>
                                                setCurrentRequirement({
                                                    ...(currentRequirement || {}),
                                                    positionId: Number(e.target.value),
                                                })
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
                                </div>

                                {modalMode === "edit" && (
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <select className="form-control" value={currentRequirement?.status ?? ""}
                                                onChange={(e) => setCurrentRequirement({ ...currentRequirement, status: Number(e.target.value) })}>
                                                <option value="">Select Status</option>
                                                {statuses.map((status) => (
                                                    <option key={status.value} value={status.value}>{status.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSave}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="processModal" tabIndex={-1} role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Process Overtime</h5>
                            <button type="button" className="close" data-dismiss="modal"><span>&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <div className="form-group">
                                    <select className="form-control" value={processRequirements?.status ?? ""}
                                        onChange={(e) => setProcessRequirements({ ...processRequirements, status: Number(e.target.value) })}>
                                        <option value="">Select Status</option>
                                        {statuses
                                            .filter(s => s.value === 1 || s.value === 2 || s.value === 3)
                                            .map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-success" onClick={() => handleProcess()}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}