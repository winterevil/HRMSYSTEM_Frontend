"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [processRequest, setProcessRequest] = useState<LeaveRequestDto | null>(null);

    const [leaveRequests, setLeaveRequests] = useState<LeaveRequestDto[]>([]);

    const [currentRequest, setCurrentRequest] = useState<LeaveRequestDto | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const filteredRequests = leaveRequests.filter((request) =>
        request.employeeName?.toLowerCase().includes(searchTerm.toLowerCase() || "")
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

    // Các trạng thái nhân viên
    const statuses = [
        { value: 0, label: "Pending", className: "badge badge-warning" },
        { value: 1, label: "Approved", className: "badge badge-success" },
        { value: 2, label: "Rejected", className: "badge badge-danger" },
        { value: 3, label: "Cancelled", className: "badge badge-secondary" },
    ];

    // Hàm lọc dữ liệu theo tháng và tính toán thống kê
    function filterByMonth(requests: LeaveRequestDto[], monthOffset = 0) {
        // monthOffset = 0: tháng hiện tại, -1: tháng trước, +1: tháng sau
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

        // Lọc các yêu cầu trong tháng mục tiêu
        const year = target.getFullYear();
        const month = target.getMonth();

        // Lọc theo năm và tháng
        return requests.filter(r => {
            if (!r.startTime) return false;
            const d = new Date(r.startTime);
            return d.getFullYear() === year && d.getMonth() === month;
        });
    }

    // Hàm tính toán các thống kê từ danh sách yêu cầu
    function calcStats(requests: LeaveRequestDto[]) {
        // Số lượng yêu cầu theo từng trạng thái
        const pending = requests.filter(r => r.status === 0).length;
        const approved = requests.filter(r => r.status === 1).length;
        const rejected = requests.filter(r => r.status === 2).length;

        // Tổng số ngày nghỉ đã được duyệt
        const approvedDays = requests
            .filter(r => r.status === 1 && r.startTime && r.endTime)
            .reduce((sum, r) => {
                const start = new Date(r.startTime!).getTime();
                const end = new Date(r.endTime!).getTime();
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                return sum + days;
            }, 0);

        return { pending, approved, rejected, approvedDays };
    }

    // Hàm so sánh phần trăm thay đổi giữa hai giá trị
    function comparePercent(current: number, previous: number) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
    }

    // Tính toán thống kê cho tháng hiện tại và tháng trước
    const currentMonthRequests = filterByMonth(leaveRequests, 0);
    const prevMonthRequests = filterByMonth(leaveRequests, -1);

    // Thống kê tháng hiện tại và tháng trước
    const currentStats = calcStats(currentMonthRequests);
    const prevStats = calcStats(prevMonthRequests);

    // Tính toán phần trăm thay đổi giữa hai tháng
    const pendingChange = comparePercent(currentStats.pending, prevStats.pending);
    const approvedChange = comparePercent(currentStats.approved, prevStats.approved);
    const rejectedChange = comparePercent(currentStats.rejected, prevStats.rejected);
    const approvedDayChange = comparePercent(currentStats.approvedDays, prevStats.approvedDays);

    // Hàm mở modal thêm mới
    function openAdd() {
        setModalMode("add");
        setCurrentRequest(null);
    }

    // Hàm mở modal chỉnh sửa
    function openEdit(request: LeaveRequestDto) {
        setModalMode("edit");
        setCurrentRequest(request);
    }

    // Hàm mở modal xử lý
    function openProcess(request: LeaveRequestDto) {
        setProcessRequest(request);
    }

    // Các trạng thái liên quan đến việc tải dữ liệu
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            window.location.href = "/auth/login";
            return;
        }

        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }

        // Hàm tải dữ liệu từ API
        async function loadData() {
            try {
                const reqRes = await fetch("https://localhost:7207/api/leaverequest", { headers });

                if (!reqRes.ok) throw new Error(await reqRes.text());

                const requests = await reqRes.json();
                setLeaveRequests(requests);
            } catch (err: any) {
                const error = err as Error;
                toast.error(error.message, {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        }

        loadData();
    }, []);

    // Hàm lưu yêu cầu (thêm mới hoặc cập nhật)
    async function handleSave() {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        try {
            // Chuẩn bị dữ liệu và gọi API tương ứng
            let url = "";
            let body: any = {};
            let method = "";

            // Nếu là thêm mới
            if (modalMode === "add") {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const empId = payload["employeeId"] || payload["sub"];
                body = {
                    startTime: currentRequest?.startTime,
                    endTime: currentRequest?.endTime,
                    reason: currentRequest?.reason,
                    employeeId: empId,
                    status: 0,
                };
                url = "https://localhost:7207/api/leaverequest";
                method = "POST";
            } else {
                // Nếu là cập nhật
                body = {
                    id: currentRequest?.id,
                    startTime: currentRequest?.startTime,
                    endTime: currentRequest?.endTime,
                    reason: currentRequest?.reason,
                    status: currentRequest?.status
                };
                url = "https://localhost:7207/api/leaverequest";
                method = "PUT";
            }

            // Gọi API
            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Something went wrong");
            }

            toast.success("Save successful", {
                position: "top-right",
                autoClose: 3000,
            });

            // reload danh sách
            const data = await fetch("https://localhost:7207/api/leaverequest", { headers });
            const updatedRequests = await data.json();
            setLeaveRequests(updatedRequests);

            (window as any).$("#exampleModal").modal("hide");
        } catch (err: any) {
            const error = err as Error;
            toast.error(error.message, {
                position: "top-right",
                autoClose: 3000,
            });
            // đồng bộ lại dữ liệu trong modal
            setProcessRequest(leaveRequests.find(r => r.id === processRequest?.id) || null);
        }
    }

    // Hàm lưu xử lý yêu cầu (duyệt hoặc từ chối)
    async function handleProcessSave() {
        if (!processRequest?.id) return;
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        try {
            // Gọi API
            const url = `https://localhost:7207/api/leaverequest/approve/${processRequest.id}?status=${processRequest.status}`;
            const response = await fetch(url, {
                method: "POST",
                headers
            });

            if (!response.ok) throw new Error(await response.text());

            toast.success("Process successful", {
                position: "top-right",
                autoClose: 3000,
            });

            // reload danh sách
            const data = await fetch("https://localhost:7207/api/leaverequest", { headers });
            const updatedRequests = await data.json();
            setLeaveRequests(updatedRequests);

            (window as any).$("#processModal").modal("hide");
        } catch (err: any) {
            toast.error(err.message, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    }
    return (
        <div className="section-body">
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center">
                    <ul className="nav nav-tabs page-header-tab">
                    </ul>
                    {currentRole !== "Admin" && (
                        <div className="header-action">
                            <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onClick={openAdd}><i className="fa-solid fa-plus mr-2"></i>Add</button>
                        </div>
                    )}
                </div>
                <div className="tab-content mt-3">
                    <div className="tab-pane fade show active" id="Payroll-Salary" role="tabpanel">
                        {currentRole !== "Admin" && (
                            <div className="row clearfix">
                                <div className="col-lg-3 col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6>Waiting for HR</h6>
                                            <h3 className="pt-3"><span className="counter">{currentStats.pending}</span></h3>
                                            <span><span className={parseFloat(pendingChange) >= 0 ? "text-success" : "text-danger"}>
                                                {pendingChange}%
                                            </span> Since last month</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6>Approved by HR</h6>
                                            <h3 className="pt-3"><span className="counter">{currentStats.approved}</span></h3>
                                            <span><span className={parseFloat(approvedChange) >= 0 ? "text-success" : "text-danger"}>
                                                {approvedChange}%
                                            </span> Since last month</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6>Rejected by HR</h6>
                                            <h3 className="pt-3"><span className="counter">{currentStats.rejected}</span></h3>
                                            <span><span className={parseFloat(rejectedChange) >= 0 ? "text-success" : "text-danger"}>
                                                {rejectedChange}%
                                            </span> Since last month</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h6>Total Leave Days</h6>
                                            <h3 className="pt-3"><span className="counter">{currentStats.approvedDays.toFixed(1)}</span></h3>
                                            <span><span className={parseFloat(approvedDayChange) >= 0 ? "text-success" : "text-danger"}>
                                                {approvedDayChange}%
                                            </span> Since last month</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Leave Request</h3>
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
                                    <table className="table table-hover table-striped table-vcenter text-nowrap">
                                        <thead>
                                            <tr>
                                                <th style={{ width: "20px" }}>Id</th>
                                                <th className="w200">Name</th>
                                                <th className="w200">Start Time</th>
                                                <th className="w200">End Time</th>
                                                <th className="w200">Reason</th>
                                                <th className="w60">Status</th>
                                                <th className="w200">Processed By</th>
                                                {currentRole !== "Admin" && (
                                                    <th className="w60">Action</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRequests.map((request) => (
                                                <tr key={request.id}>
                                                    <td>
                                                        <span>{request.id}</span>
                                                    </td>
                                                    <td>
                                                        {request.employeeName || "Unknown"}
                                                    </td>
                                                    <td>{request.startTime ? new Date(request.startTime).toLocaleDateString("en-CA") : ""}</td>
                                                    <td>{request.endTime ? new Date(request.endTime).toLocaleDateString("en-CA") : ""}</td>
                                                    <td>{request.reason}</td>
                                                    <td>{(() => {
                                                        const status = statuses.find((s) => s.value === request.status);
                                                        return status ? (
                                                            <span className={status.className}>{status.label}</span>
                                                        ) : (
                                                            "N/A"
                                                        );
                                                    })()}</td>
                                                    <td>{request.approvedByName || ""}</td>
                                                    {currentRole !== "Admin" && (
                                                        <td>
                                                            <button type="button" className="btn btn-icon" title="Process" data-toggle="modal" data-placement="top" data-target="#exampleModal" onClick={() => openEdit(request)}><i className="fa-solid fa-edit"></i></button>
                                                            {currentRole !== "Employee" && (
                                                                <button type="button" className="btn btn-icon" title="Process" data-toggle="modal" data-target="#processModal" onClick={() => openProcess(request)}>
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
                                        <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                                        <li className="page-item active"><a className="page-link" href="#">1</a></li>
                                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                                        <li className="page-item"><a className="page-link" href="#">Next</a></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal thêm mới và chỉnh sửa yêu cầu OT */ }
            <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{modalMode === "add" ? "Request Leave" : "Process Leave"}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <div className="row clearfix">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="hidden" className="form-control" placeholder="Overtime Id"
                                            value={currentRequest?.id ?? ""} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="date" className="form-control" placeholder="Start Time"
                                            value={currentRequest?.startTime ?? ""}
                                            onChange={(e) => setCurrentRequest({ ...currentRequest, startTime: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="date" className="form-control" placeholder="End Time"
                                            value={currentRequest?.endTime ?? ""}
                                            onChange={(e) => setCurrentRequest({ ...currentRequest, endTime: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Reason"
                                            value={currentRequest?.reason ?? ""}
                                            onChange={(e) => setCurrentRequest({ ...currentRequest, reason: e.target.value })} />
                                    </div>
                                </div>
                                {modalMode === "edit" && (
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <select className="form-control" value={currentRequest?.status ?? ""}
                                                onChange={(e) => setCurrentRequest({ ...currentRequest, status: Number(e.target.value) })}>
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

            {/* Modal xử lý yêu cầu OT (duyệt hoặc từ chối) */}
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
                                    <select className="form-control" value={processRequest?.status ?? ""}
                                        onChange={(e) => setProcessRequest({ ...processRequest, status: Number(e.target.value) })}>
                                        <option value="">Select Status</option>
                                        {statuses
                                            .filter(s => s.value === 1 || s.value === 2)
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
                            <button type="button" className="btn btn-success" onClick={() => handleProcessSave()}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}