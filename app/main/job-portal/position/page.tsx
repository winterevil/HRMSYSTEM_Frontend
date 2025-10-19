"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Định nghĩa kiểu dữ liệu cho vị trí tuyển dụng
interface RecruitmentPosition {
    id?: number;
    positionName?: string;
    description?: string;
    departmentName?: string;
    departmentId?: number;
}

export default function PositionPage() {
    // Chế độ của modal: "add" hoặc "edit"
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    // Trạng thái danh sách vị trí tuyển dụng
    const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Trạng thái cho modal
    const [currentPosition, setCurrentPosition] = useState<RecruitmentPosition | null>(null);
    const [departments, setDepartments] = useState<{ id: number; departmentName: string }[]>([]);
    const [deletePositionId, setDeletePositionId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

    // Lọc vị trí dựa trên từ khóa tìm kiếm và bộ lọc phòng ban
    const filteredPositions = positions.filter((emp) => {
        const matchesSearch = emp.positionName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesDepartment =
            selectedDepartmentId === "" ||
            emp.departmentId?.toString() === selectedDepartmentId;
        return matchesSearch && matchesDepartment;
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
        setCurrentPosition(null);
        setModalMode("add");
    }

    function openEdit(position: RecruitmentPosition) {
        setCurrentPosition(position);
        setModalMode("edit");
    }

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            window.location.href = "/login"; // Redirect to login if no token
            return;
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }

        async function loadData() {
            try {
                const [positionsRes, departmentsRes] = await Promise.all([
                    fetch("https://localhost:7207/api/recruitmentposition", { headers }),
                    fetch("https://localhost:7207/api/department", { headers }),
                ]);

                if (!positionsRes.ok) throw new Error(await positionsRes.text());
                if (!departmentsRes.ok) throw new Error(await departmentsRes.text());

                const positionsData = await positionsRes.json();
                const departmentsData = await departmentsRes.json();

                setPositions(positionsData);
                setDepartments(departmentsData);
                setLoading(false);
            } catch (err: unknown) {
                const error = err as Error;
                setError(error.message);
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    async function handleSave() {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }

        try {
            let body: any = {};

            if (modalMode === "add") {
                body = {
                    positionName: currentPosition?.positionName,
                    description: currentPosition?.description,
                    departmentId: currentPosition?.departmentId,
                    departmentName: departments.find(d => d.id === currentPosition?.departmentId)?.departmentName
                };
            } else {
                body = {
                    id: currentPosition?.id,
                    positionName: currentPosition?.positionName,
                    description: currentPosition?.description,
                    departmentId: currentPosition?.departmentId,
                    departmentName: departments.find(d => d.id === currentPosition?.departmentId)?.departmentName
                };
            }
            const url = modalMode === "add"
                ? "https://localhost:7207/api/recruitmentposition"
                : "https://localhost:7207/api/recruitmentposition";

            const method = modalMode === "add" ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || "Something went wrong");
            }

            toast.success("Position saved successfully", {
                position: "top-right",
                autoClose: 3000,
            });

            const positionRes = await fetch("https://localhost:7207/api/recruitmentposition", { headers });
            const positions = await positionRes.json();
            setPositions(positions);

            (window as any).$("#exampleModal").modal("hide");
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    }

    function openDelete(id: number) {
        setDeletePositionId(id);
    }

    async function handleDelete() {
        if (!deletePositionId) return;

        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        }

        try {
            const res = await fetch(`https://localhost:7207/api/recruitmentposition/${deletePositionId}`, {
                method: "DELETE",
                headers,
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || "Something went wrong");
            }
            toast.success("Position deleted successfully", {
                position: "top-right",
                autoClose: 3000,
            });
            setPositions(positions.filter(pos => pos.id !== deletePositionId));
            setDeletePositionId(null);
            (window as any).$("#confirmDeleteModal").modal("hide");
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
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="col-lg-6 col-md-6 col-sm-6">
                                        <label>Department</label>
                                        <div className="form-group">
                                            <select className="custom-select" value={selectedDepartmentId}
                                                onChange={(e) => setSelectedDepartmentId(e.target.value)}>
                                                <option value="">All Departments</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id.toString()}>{dept.departmentName}</option>
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
                                {currentRole === "HR" && (
                                    <div className="header-action">
                                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onClick={openAdd}><i className="fa-solid fa-plus mr-2"></i>Add</button>
                                    </div>
                                )}
                            </div>
                            <div className="tab-pane fade show active" id="Departments-list" role="tabpanel">
                                <div className="card">
                                    <div className="card-header border-bottom">
                                        <h3 className="card-title">Job Position List</h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-striped table-vcenter table-hover mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>ID</th>
                                                        <th>Position Name</th>
                                                        <th>Description</th>
                                                        <th>Department</th>
                                                        {currentRole === "HR" && (
                                                            <th>Action</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredPositions.map((position) => (
                                                        <tr key={position.id}>
                                                            <td className="w40">
                                                                <label className="custom-control custom-checkbox">
                                                                    <input type="checkbox" className="custom-control-input" name="example-checkbox1" value="option1" />
                                                                    <span className="custom-control-label">&nbsp;</span>
                                                                </label>
                                                            </td>
                                                            <td>{position.id}</td>
                                                            <td><div className="font-15">{position.positionName}</div></td>
                                                            <td>{position.description}</td>
                                                            <td>{position.departmentName}</td>
                                                            {currentRole === "HR" && (
                                                                <td>
                                                                    <button type="button" className="btn btn-icon" title="Edit" data-toggle="modal" data-target="#exampleModal" onClick={() => openEdit(position)}><i className="fa-solid fa-edit"></i></button>
                                                                    <button type="button" className="btn btn-icon js-sweetalert" title="Delete" data-type="confirm" data-toggle="modal" data-target="#confirmDeleteModal" onClick={() => openDelete(position.id!)}><i className="fa-solid fa-trash"></i></button>
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
            <div
                className="modal fade"
                id="confirmDeleteModal"
                tabIndex={-1}
                role="dialog"
                aria-labelledby="confirmDeleteLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="confirmDeleteLabel">Confirm Delete</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this position?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={() => handleDelete()}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{modalMode === "add" ? "Add Position" : "Edit Position"}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <div className="row clearfix">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="hidden" className="form-control" placeholder="Position Id"
                                            value={currentPosition?.id ?? ""} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Position Name"
                                            value={currentPosition?.positionName ?? ""}
                                            onChange={(e) => setCurrentPosition({ ...currentPosition, positionName: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Description"
                                            value={currentPosition?.description ?? ""}
                                            onChange={(e) => setCurrentPosition({ ...currentPosition, description: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <select className="form-control"
                                            value={currentPosition?.departmentId ?? ""}
                                            onChange={(e) => setCurrentPosition({ ...currentPosition, departmentId: Number(e.target.value) })}                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={() => handleSave()}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}