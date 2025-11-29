"use client"
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch } from '@/app/utils/apiClient';


// Định nghĩa kiểu dữ liệu cho EmployeeType
interface EmployeeTypeDto {
    id?: number,
    typeName?: string;
}

export default function EmployeeTypePage() {
    // Trạng thái để quản lý chế độ của modal (thêm hoặc sửa)
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    // Trạng thái để quản lý danh sách loại nhân viên
    const [employeeTypes, setEmployeeTypes] = useState<EmployeeTypeDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Trạng thái để quản lý loại nhân viên hiện tại
    const [currentType, setCurrentType] = useState<EmployeeTypeDto | null>(null);
    const [deleteTypeId, setDeleteTypeId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const filteredEmployeeTypes = employeeTypes.filter(type =>
        type.typeName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Tính tổng số trang
    const totalPages = Math.ceil(filteredEmployeeTypes.length / itemsPerPage);

    // Tính dữ liệu đang hiển thị theo trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployeeTypes.slice(indexOfFirstItem, indexOfLastItem);
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

    // Hàm mở modal để thêm loại nhân viên mới
    function openAdd() {
        setModalMode("add");
        setCurrentType({});
    }

    // Hàm mở modal để sửa loại nhân viên
    function openEdit(type: EmployeeTypeDto) {
        setModalMode("edit");
        setCurrentType(type);
    }

    // Tải dữ liệu loại nhân viên từ API khi component được mount
    useEffect(() => {
        // Hàm tải dữ liệu
        async function loadData() {
            try {
                // Tải cả loại nhân viên và nhân viên để đếm số nhân viên theo loại
                const [types, employees] = await Promise.all([
                    apiFetch("/employeetype"),
                    apiFetch("/employee")
                ]);

                // Đếm số nhân viên theo loại
                const counts: Record<number, number> = {};
                employees.forEach((emp: any) => {
                    counts[emp.employeeTypeId] = (counts[emp.employeeTypeId] || 0) + 1;
                });

                // Gán số lượng nhân viên vào từng loại
                const typesWithCount = types.map((t: any) => ({
                    ...t,
                    totalEmployee: counts[t.id] || 0
                }));

                // Cập nhật trạng thái
                setEmployeeTypes(typesWithCount);
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

    // Hàm xử lý lưu (thêm hoặc sửa) loại nhân viên
    async function handleSave() {
        try {
            const body = {
                id: currentType?.id,
                typeName: currentType?.typeName,
            };

            if (modalMode === "add") {
                await apiFetch("/employeetype", "POST", body);
            } else {
                await apiFetch("/employeetype", "PUT", body);
            }

            toast.success("Employee type saved successfully", {
                position: "top-right",
                autoClose: 3000
            });
            const updated = await apiFetch("/employeetype");
            setEmployeeTypes(updated);
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

    // Hàm mở modal xác nhận xóa loại nhân viên
    function openDelete(id: number) {
        setDeleteTypeId(id);
    }

    // Hàm xử lý xóa loại nhân viên
    async function handleDelete() {
        if (!deleteTypeId) return;

        try {
            await apiFetch(`/employeetype/${deleteTypeId}`, "DELETE");
            toast.success("Employee type deleted successfully", {
                position: "top-right",
                autoClose: 3000
            });
            setEmployeeTypes(employeeTypes.filter((t) => t.id !== deleteTypeId));
            setDeleteTypeId(null);
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
                    {/* Chỉ hiển thị nút "Add" nếu vai trò là "HR" */}
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
                                <h3 className="card-title">Employee Type List</h3>
                                <div className="card-options">
                                    <form>
                                        {/* Tìm kiếm loại nhân viên theo tên */}
                                        <div className="input-group">
                                            <input type="text" className="form-control form-control-sm" placeholder="Enter name to search..." name="s"
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                            />
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
                                                <th>Type Name</th>
                                                {(currentRole === "HR" || currentRole === "Admin") && (
                                                    <th>Total Employee</th>
                                                )}
                                                {currentRole === "HR" && (
                                                    <th>Action</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Hiển thị danh sách loại nhân viên đã lọc */}
                                            {currentItems.map((type) => (
                                                <tr key={type.id}>
                                                    <td className="w40">
                                                        <label className="custom-control custom-checkbox">
                                                            <input type="checkbox" className="custom-control-input" name="example-checkbox1" value="option1" />
                                                            <span className="custom-control-label">&nbsp;</span>
                                                        </label>
                                                    </td>
                                                    <td>{type.id}</td>
                                                    <td><div className="font-15">{type.typeName}</div></td>
                                                    {/* Chỉ hiển thị cột "Total Employee" nếu vai trò là "HR" hoặc "Admin" */}
                                                    {(currentRole === "HR" || currentRole === "Admin") && (
                                                        <td>{type.totalEmployee}</td>
                                                    )}
                                                    {/* Chỉ hiển thị cột "Action" nếu vai trò là "HR" */}
                                                    {currentRole === "HR" && (
                                                        <td>
                                                            <button type="button" className="btn btn-icon" title="Edit" data-toggle="modal" data-target="#exampleModal" onClick={() => openEdit(type)}><i className="fa-solid fa-edit"></i></button>
                                                            <button type="button" className="btn btn-icon js-sweetalert" title="Delete" data-type="confirm" data-toggle="modal" data-target="#confirmDeleteModal" onClick={() => openDelete(type.id!)}><i className="fa-solid fa-trash"></i></button>
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

            {/* Modal xác nhận xóa loại nhân viên */}
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
                            <p>Are you sure you want to delete this employee type?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={() => handleDelete()}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal thêm/sửa loại nhân viên */}
            <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            {/* Tiêu đề modal thay đổi tùy theo chế độ (thêm hoặc sửa) */}
                            <h5 className="modal-title" id="exampleModalLabel">{modalMode === "add" ? "Add Employee Type" : "Edit Employee Type"}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <div className="row clearfix">
                                {/* Trường ID (ẩn) và Type Name */}
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="hidden" className="form-control" placeholder="Employee Type Id"
                                            value={currentType?.id ?? ""} />
                                    </div>
                                </div>
                                {/* Trường Type Name */}
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Employee Type"
                                            value={currentType?.typeName ?? ""}
                                            onChange={(e) => setCurrentType({ ...currentType, typeName: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSave}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}