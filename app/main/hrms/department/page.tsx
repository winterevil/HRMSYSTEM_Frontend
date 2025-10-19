"use client"
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        // Kiểm tra token JWT
        const token = localStorage.getItem("jwt");
        if (!token) {
            window.location.href = "/auth/login";
            return;
        }

        // Thiết lập header với token
        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        // Hàm tải dữ liệu
        async function loadData() {
            try {
                // Tải cả phòng ban và nhân viên để đếm số nhân viên theo phòng ban
                const [deptRes, empRes] = await Promise.all([
                    fetch("https://localhost:7207/api/department", { headers }),
                    fetch("https://localhost:7207/api/employee", { headers })
                ]);

                // Kiểm tra lỗi
                const depts = await deptRes.json();
                const employees = await empRes.json();

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
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        try {
            // Chuẩn bị dữ liệu gửi đi
            let body: any = {};

            // Phân biệt giữa thêm và sửa
            if (modalMode === "add") {
                body = {
                    departmentName: currentDept?.departmentName
                };
            } else {
                body = {
                    id: currentDept?.id,
                    departmentName: currentDept?.departmentName
                };
            }

            // Gửi yêu cầu đến API
            const url = modalMode === "add"
                ? "https://localhost:7207/api/department"
                : "https://localhost:7207/api/department";

            // Chọn phương thức HTTP phù hợp
            const method = modalMode === "add" ? "POST" : "PUT";

            // Thực hiện yêu cầu fetch
            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body)
            });

            // Kiểm tra lỗi
            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || "Something went wrong");
            }

            // Hiển thị thông báo thành công
            toast.success("Department saved successfully", {
                position: "top-right",
                autoClose: 3000
            });

            // Cập nhật lại danh sách phòng ban
            const deptRes = await fetch("https://localhost:7207/api/department", { headers });
            const deptData = await deptRes.json();
            setDepartments(deptData);

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

        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        try {
            const res = await fetch(`https://localhost:7207/api/department/${deleteDeptId}`, {
                method: "DELETE",
                headers
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || "Something went wrong");
            }

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
                                                onChange={(e) => setSearchTerm(e.target.value)} />
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
                                            {filteredDepartments.map((dept) => (
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