"use client"
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch } from "@/app/utils/apiClient";

// Định nghĩa kiểu dữ liệu cho phòng ban
interface DepartmentDto {
    id?: number,
    departmentName?: string;
}
export default function DepartmentPage() {
    // Trạng thái để quản lý chế độ của modal (thêm hoặc sửa)
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    // Trạng thái để quản lý danh sách phòng ban
    const [departments, setDepartments] = useState<DepartmentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Trạng thái để quản lý phòng ban hiện tại (đang được thêm hoặc sửa)
    const [currentDept, setCurrentDept] = useState<DepartmentDto | null>(null);
    const [deleteDeptId, setDeleteDeptId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const filteredDepartments = departments.filter(dept =>
        dept.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Tính tổng số trang
    const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

    // Tính dữ liệu đang hiển thị theo trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
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

    // Hàm mở modal để thêm phòng ban
    function openAdd() {
        setModalMode("add");
        setCurrentDept({});
    }

    // Hàm mở modal để sửa phòng ban
    function openEdit(dept: DepartmentDto) {
        setModalMode("edit");
        setCurrentDept(dept);
    }

    // Tải dữ liệu loại nhân viên từ API khi component được mount
    useEffect(() => {
        // Hàm tải dữ liệu
        async function loadData() {
            try {
                const [depts, employees] = await Promise.all([
                    apiFetch("/department"),
                    apiFetch("/employee"),
                ]);
                // Đếm số nhân viên theo phòng ban
                const counts: Record<number, number> = {};
                employees.forEach((emp: any) => {
                    counts[emp.departmentId] = (counts[emp.departmentId] || 0) + 1;
                });

                // Gán số lượng nhân viên vào từng phòng ban
                const deptsWithCount = depts.map((t: any) => ({
                    ...t,
                    totalEmployee: counts[t.id] || 0
                }));

                // Cập nhật trạng thái
                setDepartments(deptsWithCount);
                setLoading(false);
            } catch (err: any) {
                // Xử lý lỗi
                const error = err as Error;
                setError(error.message);
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Hiển thị trạng thái tải hoặc lỗi
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    // Hàm xử lý lưu (thêm hoặc sửa) phòng ban
    async function handleSave() {
        try {
            const body = {
                id: currentDept?.id,
                departmentName: currentDept?.departmentName,
            };

            const method = modalMode === "add" ? "POST" : "PUT";
            await apiFetch("/department", method, body);
            // Hiển thị thông báo thành công
            toast.success("Department saved successfully", {
                position: "top-right",
                autoClose: 3000
            });

            const updatedDepts = await apiFetch("/department");
            setDepartments(updatedDepts);

            // Đóng modal
            (window as any).jQuery("#exampleModal").modal("hide");
        } catch (err: any) {
            // Xử lý lỗi
            const error = err as Error;
            toast.error(error.message, {
                position: "top-right",
                autoClose: 3000
            });
        }
    }

    // Hàm mở modal xác nhận xóa phòng ban
    function openDelete(id: number) {
        setDeleteDeptId(id);
    }

    // Hàm xử lý xóa phòng ban
    async function handleDelete() {
        if (!deleteDeptId) return;

        try {
            await apiFetch(`/department/${deleteDeptId}`, "DELETE");
            toast.success("Department deleted successfully", {
                position: "top-right",
                autoClose: 3000
            });

            setDepartments(departments.filter(dept => dept.id !== deleteDeptId));
            setDeleteDeptId(null);

            (window as any).jQuery("#confirmDeleteModal").modal("hide");
        } catch (err: any) {
            const error = err as Error;
            toast.error(error.message, {
                position: "top-right",
                autoClose: 3000
            });
        }
    }

    return (
        <div className="section-body">
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center">
                    <ul className="nav nav-tabs page-header-tab">

                    </ul>
                    {currentRole === "HR" && (
                        <div className="header-action">
                            <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onClick={openAdd}><i className="fa-solid fa-plus mr-2"></i>Add</button>
                        </div>
                    )}
                </div>
                <div className="tab-content mt-3">
                    <div className="tab-pane fade show active" id="Departments-list" role="tabpanel">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Department List</h3>
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
                                    <table className="table table-striped table-vcenter table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>ID</th>
                                                <th>Department Name</th>
                                                {(currentRole === "HR" || currentRole === "Admin") && (
                                                    <th>Total Employee</th>
                                                )}
                                                {currentRole === "HR" && (
                                                    <th>Action</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((dept) => (
                                                <tr key={dept.id}>
                                                    <td className="w40">
                                                        <label className="custom-control custom-checkbox">
                                                            <input type="checkbox" className="custom-control-input" name="example-checkbox1" value="option1" />
                                                            <span className="custom-control-label">&nbsp;</span>
                                                        </label>
                                                    </td>
                                                    <td>{dept.id}</td>
                                                    <td><div className="font-15">{dept.departmentName}</div></td>
                                                    {(currentRole === "HR" || currentRole === "Admin") && (
                                                        <td>{dept.totalEmployee}</td>
                                                    )}
                                                    {currentRole === "HR" && (
                                                        <td>
                                                            <button type="button" className="btn btn-icon" title="Edit" data-toggle="modal" data-target="#exampleModal" onClick={() => openEdit(dept)}><i className="fa-solid fa-edit"></i></button>
                                                            <button type="button" className="btn btn-icon js-sweetalert" title="Delete" data-type="confirm" data-toggle="modal" data-target="#confirmDeleteModal" onClick={() => openDelete(dept.id!)}><i className="fa-solid fa-trash"></i></button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
                            <p>Are you sure you want to delete this department?</p>
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
                            <h5 className="modal-title" id="exampleModalLabel">{modalMode === "add" ? "Add Department" : "Edit Department"}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <div className="row clearfix">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="hidden" className="form-control" placeholder="Department Id"
                                            value={currentDept?.id ?? ""} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Department Name"
                                            value={currentDept?.departmentName ?? ""}
                                            onChange={(e) => setCurrentDept({ ...currentDept, departmentName: e.target.value })} />
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