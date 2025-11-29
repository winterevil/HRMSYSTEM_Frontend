"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { apiFetch } from "@/app/utils/apiClient";
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
    const filteredPositions = (positions ?? []).filter((emp) => {
        const matchesSearch = emp.positionName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesDepartment =
            selectedDepartmentId === "" ||
            emp.departmentId?.toString() === selectedDepartmentId;

        return matchesSearch && matchesDepartment;
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Tính tổng số trang
    const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);

    // Tính dữ liệu đang hiển thị theo trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPositions.slice(indexOfFirstItem, indexOfLastItem);

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

        async function loadData() {
            try {
                const departmentsData = await apiFetch("/department");
                const positionsData = await apiFetch("/recruitmentposition");

                setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
                setPositions(Array.isArray(positionsData) ? positionsData : []);

                setLoading(false);
            } catch (err: unknown) {
                const error = err as Error;
                setError(error.message);
                setDepartments([]);
                setPositions([]);
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    //if (error) return <div className="alert alert-danger">{error}</div>;
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

    async function handleSave() {
        try {
            const body =
                modalMode === "add"
                    ? {
                        positionName: currentPosition?.positionName,
                        description: currentPosition?.description,
                        departmentId: currentPosition?.departmentId,
                        departmentName: departments.find(
                            (d) => d.id === currentPosition?.departmentId
                        )?.departmentName,
                    }
                    : {
                        id: currentPosition?.id,
                        positionName: currentPosition?.positionName,
                        description: currentPosition?.description,
                        departmentId: currentPosition?.departmentId,
                        departmentName: departments.find(
                            (d) => d.id === currentPosition?.departmentId
                        )?.departmentName,
                    };

            const method = modalMode === "add" ? "POST" : "PUT";
            await apiFetch("/recruitmentposition", method, body);
            toast.success("Position saved successfully", {
                position: "top-right",
                autoClose: 3000,
            });

            const updated = await apiFetch("/recruitmentposition");
            setPositions(updated);
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

        try {
            await apiFetch(`/recruitmentposition/${deletePositionId}`, "DELETE");
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
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                }} />
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
                                                    {currentItems.map((position) => (
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