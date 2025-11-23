"use client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch } from "@/app/utils/apiClient";

// Định nghĩa kiểu dữ liệu cho Employee
interface EmployeeDto {
    id?: number;
    fullName?: string;
    email?: string;
    password?: string;
    gender?: string;
    dob?: string;
    phone?: string;
    address?: string;
    roleId?: number;
    roleName?: string;
    departmentId?: number;
    employeeTypeId?: number;
    status?: number;
    createdAt?: string;
}

// Định nghĩa kiểu cho sparkline
interface SparklineParams {
    type: string;
    barWidth: number;
    height: number;
    barColor: string;
}

// Mở rộng kiểu cho jQuery và các plugin
declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
    }

    interface JQuery {
        counterUp(options?: { delay?: number; time?: number }): JQuery;
        sparkline(values: number[] | number[][], options?: object): JQuery;
    }
}
export { };

export default function EmployeePage() {
    // State để phân biệt modal thêm hay sửa
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    // useEffect để khởi tạo counterUp và sparkline
    useEffect(() => {
        if (typeof window !== "undefined" && window.$) {
            const $ = window.$;

            // Kiểm tra plugin counterUp có tồn tại
            if ($.fn && $.fn.counterUp) {
                $(".counter").counterUp({ delay: 10, time: 1000 });
            } else {
                console.warn("⚠️ counterUp plugin chưa load");
            }

            function randomVal() {
                return Math.floor(Math.random() * 80);
            }

            function getRandomValues() {
                return Array.from({ length: 20 }, () => [
                    5 + randomVal(),
                    10 + randomVal(),
                    15 + randomVal(),
                    20 + randomVal(),
                    30 + randomVal(),
                    35 + randomVal(),
                    40 + randomVal(),
                    45 + randomVal(),
                    50 + randomVal(),
                ]);
            }

            const values2 = getRandomValues();
            const paramsBar: SparklineParams = {
                type: "bar",
                barWidth: 5,
                height: 25,
                barColor: "#6c757d",
            };

            if ($.fn && $.fn.sparkline) {
                $("#mini-bar-chart1").sparkline(values2[0], paramsBar);
                $("#mini-bar-chart2").sparkline(values2[1], paramsBar);
                $("#mini-bar-chart3").sparkline(values2[2], paramsBar);
                $("#mini-bar-chart4").sparkline(values2[3], paramsBar);
            } else {
                console.warn("⚠️ sparkline plugin chưa load");
            }
        }
    }, []);

    // State quản lý
    const [employees, setEmployees] = useState<EmployeeDto[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // State cho modal
    const [currentEmp, setCurrentEmp] = useState<Partial<EmployeeDto>>({});
    const [roles, setRoles] = useState<{ id: number, name: string }[]>([]);
    const [departments, setDepartments] = useState<{ id: number, departmentName: string }[]>([]);
    const [employeeTypes, setEmployeeTypes] = useState<{ id: number, typeName: string }[]>([]);
    const [deleteEmpId, setDeleteEmpId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const filteredEmployees = employees.filter(emp =>
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Tính tổng số trang
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    // Tính dữ liệu đang hiển thị theo trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    // Lấy vai trò hiện tại từ JWT
    const [currentRole, setCurrentRole] = useState<string>("");
    const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [showModalPassword, setShowModalPassword] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));

                const role =
                    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
                const email =
                    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
                    payload["email"] || "";
                const userId =
                    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

                setCurrentRole(role);
                setCurrentUserEmail(email);
                setCurrentUserId(Number(userId)); 
            } catch (err) {
                console.error("Error decoding JWT", err);
            }
        }
    }, []);



    // Các thống kê
    // 1. Tổng nhân viên
    const totalEmployee = employees.length;

    // 2. Nhân viên mới trong 1 tháng gần đây
    const newEmployee = employees.filter(emp => {
        if (!emp.createdAt) return false;
        const createdDate = new Date(emp.createdAt);
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return createdDate >= oneMonthAgo;
    }).length;

    // 3. Tổng theo giới tính
    const maleCount = employees.filter(emp => emp.gender === "Male").length;
    const femaleCount = employees.filter(emp => emp.gender === "Female").length;

    // Các trạng thái nhân viên
    const statuses = [
        { value: 0, label: "Active", className: "badge badge-success" },
        { value: 1, label: "OnLeave", className: "badge badge-warning" },
        { value: 2, label: "Resigned", className: "badge badge-danger" },
        { value: 3, label: "Retired", className: "badge badge-secondary" },
        { value: 4, label: "Probation", className: "badge badge-info" },
    ];

    // Mở modal thêm nhân viên
    function openAdd() {
        setModalMode("add");
        setCurrentEmp({});
    }

    // Mở modal sửa nhân viên
    function openEdit(emp: EmployeeDto) {
        setModalMode("edit");
        setCurrentEmp(emp);
    }

    // Load dữ liệu ban đầu
    useEffect(() => {
        // Hàm load dữ liệu
        async function loadData() {
            try {
                const [emps, rolesData, deps, types] = await Promise.all([
                    apiFetch("/employee"),
                    apiFetch("/role"),
                    apiFetch("/department"),
                    apiFetch("/employeetype"),
                ]);
                setEmployees(emps);
                setRoles(rolesData);
                setDepartments(deps);
                setEmployeeTypes(types);
            } catch (err: unknown) {
                const error = err as Error;
                setError(error.message);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    // Hiển thị loading hoặc lỗi
    if (loading) return <p>Loading...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    // Xử lý lưu (thêm/sửa)
    async function handleSave() {
        try {
            // Chuẩn bị dữ liệu gửi đi 
            const roleName = roles.find(r => r.id === currentEmp.roleId)?.name || "";
            const dobIso = currentEmp.dob ? new Date(currentEmp.dob).toISOString() : null;

            // Tạo body tùy theo mode
            let body: any = {};

            // Nếu là thêm
            if (modalMode === "add") {
                body = {
                    fullName: currentEmp.fullName,
                    email: currentEmp.email,
                    password: currentEmp.password,
                    gender: currentEmp.gender,
                    dob: dobIso,
                    phone: currentEmp.phone,
                    address: currentEmp.address,
                    role: roleName,
                    departmentId: currentEmp.departmentId,
                    employeeTypeId: currentEmp.employeeTypeId,
                    status: currentEmp.status,
                };
            } else {
                // Nếu là sửa
                body = {
                    id: currentEmp.id,
                    fullName: currentEmp.fullName,
                    password: currentEmp.password || null,
                    gender: currentEmp.gender,
                    dob: dobIso,
                    phone: currentEmp.phone,
                    address: currentEmp.address,
                    role: roleName,
                    departmentId: currentEmp.departmentId,
                    employeeTypeId: currentEmp.employeeTypeId,
                    status: currentEmp.status,
                };
            }

            const method = modalMode === "add" ? "POST" : "PUT";
            await apiFetch("/employee", method, body);
            // Thành công
            toast.success("Employee saved successfully", {
                position: "top-right",
                autoClose: 3000,
            });

            setEmployees(await apiFetch("/employee"));
            (window as any).$("#exampleModal").modal("hide");
        } catch (err: unknown) {
            // Xử lý lỗi
            const error = err as Error;
            toast.error(error.message, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    }

    // Mở modal xác nhận xóa
    function openDelete(id: number) {
        setDeleteEmpId(id);
    }

    // Xử lý xóa
    async function handleDelete() {
        // Kiểm tra nếu không có id thì dừng
        if (!deleteEmpId) return;

        try {
            await apiFetch(`/employee/${deleteEmpId}`, "DELETE");
            toast.success("Employee deleted successfully", {
                position: "top-right",
                autoClose: 3000,
            });

            // Cập nhật lại danh sách
            setEmployees(employees.filter(emp => emp.id !== deleteEmpId));
            setDeleteEmpId(null);

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
        <div className="section-body">
            <div className="container-fluid">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <ul className="nav nav-tabs page-header-tab">

                    </ul>
                    {/* Nút thêm nhân viên */}
                    {/* Chỉ hiện nút thêm nếu không phải Employee */}
                    {currentRole !== "Employee" && (
                        <div className="header-action">
                            <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onClick={openAdd}>
                                <i className="fa-solid fa-plus mr-2"></i> Add
                            </button>
                        </div>
                    )}
                </div>
                {currentRole !== "Employee" && (
                    <div className="row">
                        {/* Thống kê nhanh */}
                        <div className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body w_sparkline">
                                    <div className="details">
                                        <span>Total Employee</span>
                                        <h3 className="mb-0 counter">{totalEmployee}</h3>
                                    </div>
                                    <div className="w_chart">
                                        <span id="mini-bar-chart1" className="mini-bar-chart"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body w_sparkline">
                                    <div className="details">
                                        <span>New Employee</span>
                                        <h3 className="mb-0 counter">{newEmployee}</h3>
                                    </div>
                                    <div className="w_chart">
                                        <span id="mini-bar-chart2" className="mini-bar-chart"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body w_sparkline">
                                    <div className="details">
                                        <span>Male</span>
                                        <h3 className="mb-0 counter">{maleCount}</h3>
                                    </div>
                                    <div className="w_chart">
                                        <span id="mini-bar-chart3" className="mini-bar-chart"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body w_sparkline">
                                    <div className="details">
                                        <span>Female</span>
                                        <h3 className="mb-0 counter">{femaleCount}</h3>
                                    </div>
                                    <div className="w_chart">
                                        <span id="mini-bar-chart4" className="mini-bar-chart"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="tab-content">
                    <div className="tab-pane fade show active" id="Employee-list" role="tabpanel">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Employee List</h3>
                                {/* Tìm kiếm */}
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
                                    <table className="table table-hover table-striped table-vcenter text-nowrap mb-0">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Id</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Gender</th>
                                                <th>DOB</th>
                                                <th>Phone</th>
                                                <th>Address</th>
                                                <th>Department</th>
                                                <th>Employee Type</th>
                                                <th>Role</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((emp) => (
                                                <tr key={emp.id}>
                                                    <td className="w40">
                                                        <label className="custom-control custom-checkbox">
                                                            <input type="checkbox" className="custom-control-input" name="example-checkbox1" value="option1" />
                                                            <span className="custom-control-label">&nbsp;</span>
                                                        </label>
                                                    </td>
                                                    <td>{emp.id}</td>
                                                    <td>
                                                        {emp.fullName}
                                                    </td>
                                                    <td>{emp.email}</td>
                                                    <td>{emp.gender}</td>
                                                    {/* Định dạng ngày sinh theo chuẩn en-CA (YYYY-MM-DD) */}
                                                    <td>{emp.dob ? new Date(emp.dob).toLocaleDateString("en-CA") : ""}</td>
                                                    <td>{emp.phone}</td>
                                                    <td>{emp.address}</td>
                                                    {/* Hiển thị tên phòng ban dựa trên departmentId */}
                                                    <td>
                                                        {departments.find((d) => d.id === emp.departmentId)?.departmentName || "N/A"}
                                                    </td>
                                                    {/* Hiển thị tên loại nhân viên dựa trên employeeTypeId */}
                                                    <td>{employeeTypes.find((t) => t.id === emp.employeeTypeId)?.typeName || "N/A"}</td>
                                                    {/* Hiển thị tên vai trò dựa trên roleId */}
                                                    <td>{roles.find((r) => r.id === emp.roleId)?.name || "N/A"}</td>
                                                    {/* Hiển thị trạng thái với màu sắc */}
                                                    <td>
                                                        {(() => {
                                                            const status = statuses.find((s) => s.value === emp.status);
                                                            return status ? (
                                                                <span className={status.className}>{status.label}</span>
                                                            ) : (
                                                                "N/A"
                                                            );
                                                        })()}
                                                    </td>
                                                    <td>
                                                        {/*<button type="button" className="btn btn-icon btn-sm" title="View"><i className="fa fa-eye"></i></button>*/}
                                                        {/* Nút sửa mở modal và truyền dữ liệu nhân viên hiện tại */}
                                                        <button type="button" className="btn btn-icon btn-sm" title="Edit" data-toggle="modal" data-target="#exampleModal" onClick={() => openEdit(emp)}><i className="fa fa-edit"></i></button>
                                                        {/* Nút xóa mở modal xác nhận xóa */}
                                                        {/* Chỉ hiện nút xóa nếu không phải Manager, Employee */}
                                                        {currentRole !== "Manager" && currentRole !== "Employee" && (
                                                            <button type="button" className="btn btn-icon btn-sm js-sweetalert" title="Delete" data-type="confirm" data-toggle="modal" data-target="#confirmDeleteModal" onClick={() => openDelete(emp.id!)}><i className="fa-solid fa-trash"></i></button>
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
                    </div>
                    <div className="tab-pane fade" id="Employee-view" role="tabpanel">
                        <div className="row">
                            <div className="col-lg-4 col-md-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="media mb-4">
                                            <img className="avatar avatar-xl mr-3" src="../assets/images/sm/avatar1.jpg" alt="avatar" />
                                            <div className="media-body">
                                                <h5 className="m-0">Sara Hopkins</h5>
                                                <p className="text-muted mb-0">Webdeveloper</p>
                                                <ul className="social-links list-inline mb-0 mt-2">
                                                    <li className="list-inline-item"><a href="javascript:void(0)" title="" data-toggle="tooltip" data-original-title="Facebook"><i className="fa fa-facebook"></i></a></li>
                                                    <li className="list-inline-item"><a href="javascript:void(0)" title="" data-toggle="tooltip" data-original-title="Twitter"><i className="fa fa-twitter"></i></a></li>
                                                    <li className="list-inline-item"><a href="javascript:void(0)" title="" data-toggle="tooltip" data-original-title="1234567890"><i className="fa fa-phone"></i></a></li>
                                                    <li className="list-inline-item"><a href="javascript:void(0)" title="" data-toggle="tooltip" data-original-title="@skypename"><i className="fa fa-skype"></i></a></li>
                                                </ul>
                                            </div>
                                        </div>
                                        <p className="mb-4">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classNameical Latin literature from 45 BC, making it over 2000 years old.</p>
                                        <button className="btn btn-outline-primary btn-sm"><span className="fa fa-twitter"></span> Follow</button>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-header border-bottom">
                                        <h3 className="card-title">Statistics</h3>
                                        <div className="card-options">
                                            <a href="#" className="card-options-collapse" data-toggle="card-collapse"><i className="fe fe-chevron-up"></i></a>
                                            <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fe fe-x"></i></a>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="text-center">
                                            <div className="row">
                                                <div className="col-6 pb-3">
                                                    <label className="mb-0">Project</label>
                                                    <h4 className="font-30 font-weight-bold">45</h4>
                                                </div>
                                                <div className="col-6 pb-3">
                                                    <label className="mb-0">Growth</label>
                                                    <h4 className="font-30 font-weight-bold">87%</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="d-block">Laravel<span className="float-right">77%</span></label>
                                            <div className="progress progress-xs">
                                                <div className="progress-bar bg-blue" role="progressbar" aria-valuenow={77} aria-valuemin={0} aria-valuemax={100} style={{ width: "77%" }}></div>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="d-block">HTML<span className="float-right">50%</span></label>
                                            <div className="progress progress-xs">
                                                <div className="progress-bar bg-danger" role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100} style={{ width: "50%" }}></div>
                                            </div>
                                        </div>
                                        <div className="form-group mb-0">
                                            <label className="d-block">Photoshop <span className="float-right">23%</span></label>
                                            <div className="progress progress-xs">
                                                <div className="progress-bar bg-green" role="progressbar" aria-valuenow={23} aria-valuemin={0} aria-valuemax={100} style={{ width: "23%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-8 col-md-12">
                                <div className="card">
                                    <div className="card-body">
                                        <ul className="new_timeline mt-3">
                                            <li>
                                                <div className="bullet pink"></div>
                                                <div className="time">11:00am</div>
                                                <div className="desc">
                                                    <h3>Attendance</h3>
                                                    <h4>Computer className</h4>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="bullet pink"></div>
                                                <div className="time">11:30am</div>
                                                <div className="desc">
                                                    <h3>Added an interest</h3>
                                                    <h4>“Volunteer Activities”</h4>
                                                    <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classNameical Latin literature from 45 BC, making it over 2000 years old.</p>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="bullet green"></div>
                                                <div className="time">12:00pm</div>
                                                <div className="desc">
                                                    <h3>Developer Team</h3>
                                                    <h4>Hangouts</h4>
                                                    <ul className="list-unstyled team-info margin-0 p-t-5">
                                                        <li><img src="../assets/images/xs/avatar1.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar2.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar3.jpg" alt="Avatar" /></li>
                                                        <li><img src="../assets/images/xs/avatar4.jpg" alt="Avatar" /></li>
                                                    </ul>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="bullet green"></div>
                                                <div className="time">2:00pm</div>
                                                <div className="desc">
                                                    <h3>Responded to need</h3>
                                                    <a href="javascript:void(0)">“In-Kind Opportunity”</a>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="bullet orange"></div>
                                                <div className="time">1:30pm</div>
                                                <div className="desc">
                                                    <h3>Lunch Break</h3>
                                                </div>
                                            </li>
                                            <li>
                                                <div className="bullet green"></div>
                                                <div className="time">2:38pm</div>
                                                <div className="desc">
                                                    <h3>Finish</h3>
                                                    <h4>Go to Home</h4>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Modal xác nhận xóa */}
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
                            <p>Are you sure you want to delete this employee?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            {/* Nút xóa gọi hàm handleDelete */}
                            <button type="button" className="btn btn-danger" onClick={() => handleDelete()}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal thêm/sửa nhân viên */}
            <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            {/* Tiêu đề thay đổi tùy theo mode */}
                            <h5 className="modal-title" id="exampleModalLabel">{modalMode === "add" ? "Add Employee" : "Edit Employee"}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="row clearfix">
                                {/* Employee ID (ẩn) */}
                                <div className="col-md-4 col-sm-6 d-none">
                                    <div className="form-group">
                                        <input type="hidden" className="form-control" placeholder="Employee ID"
                                            value={currentEmp.id ?? ""} />
                                    </div>
                                </div>
                                {/* Name */}
                                <div className="col-md-12 col-sm-6">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Name"
                                            value={currentEmp.fullName || ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, fullName: e.target.value })} />
                                    </div>
                                </div>
                                {/* Email */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Email"
                                            value={currentEmp.email || ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, email: e.target.value })}
                                            disabled={modalMode === "edit"} />
                                    </div>
                                </div>
                                {/* Phone */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Phone Number"
                                            value={currentEmp.phone || ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, phone: e.target.value })} />
                                    </div>
                                </div>
                                {/* Date of Birth */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <input type="date" data-provide="datepicker" data-date-autoclose="true" className="form-control" placeholder="Date of Birth"
                                            value={currentEmp.dob ? new Date(currentEmp.dob).toISOString().split("T")[0] : ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, dob: e.target.value })} />
                                    </div>
                                </div>
                                {/* Address */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Address"
                                            value={currentEmp.address || ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, address: e.target.value })} />
                                    </div>
                                </div>
                                {/* Password */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <div className="input-group">
                                            <input
                                                type={showModalPassword ? "text" : "password"}
                                                className="form-control"
                                                placeholder={
                                                    modalMode === "add"
                                                        ? "Set initial password"
                                                        : currentEmp.id === currentUserId
                                                            ? "Change your password"
                                                            : "Password (locked)"
                                                }
                                                value={currentEmp.password || ""}
                                                onChange={(e) => setCurrentEmp({ ...currentEmp, password: e.target.value })}
                                                disabled={modalMode === "edit" && currentEmp.id !== currentUserId}
                                            />

                                            <div
                                                className="input-group-append"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setShowModalPassword(!showModalPassword)}
                                            >
                                                <span className="input-group-text">
                                                    <i className={`fa ${showModalPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <select className="form-control"
                                            value={currentEmp.gender || ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, gender: e.target.value })}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Role */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <select className="form-control" value={currentEmp.roleId || ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, roleId: Number(e.target.value) })}>
                                            <option value="">Select Role</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* Department */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <select className="form-control" value={currentEmp.departmentId || ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, departmentId: Number(e.target.value) })}>
                                            <option value="">Select Department</option>
                                            {departments.map(dep => (
                                                <option key={dep.id} value={dep.id}>{dep.departmentName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* Employee Type */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <select className="form-control" value={currentEmp.employeeTypeId || ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, employeeTypeId: Number(e.target.value) })}>
                                            <option value="">Select Employee Type</option>
                                            {employeeTypes.map(type => (
                                                <option key={type.id} value={type.id}>{type.typeName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* Status */}
                                <div className="col-md-6 col-sm-6">
                                    <div className="form-group">
                                        <select className="form-control" value={currentEmp.status ?? ""}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, status: Number(e.target.value) })}>
                                            <option value="">Select Status</option>
                                            {statuses.map(status => (
                                                <option key={status.value} value={status.value}>{status.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            {/* Nút lưu gọi hàm handleSave */}
                            <button type="button" className="btn btn-primary" onClick={handleSave}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Toast Container để hiển thị thông báo */}
            <ToastContainer />
        </div >
    );
}