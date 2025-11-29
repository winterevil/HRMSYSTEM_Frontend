"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import truncate from "html-truncate";
import dynamic from "next/dynamic";
import { apiFetch } from "@/app/utils/apiClient";
import "react-toastify/dist/ReactToastify.css";

const Editor = dynamic(() => import("@tinymce/tinymce-react").then(m => m.Editor), {
    ssr: false,
});

interface JobPostDto {
    id?: number;
    title?: string;
    content?: string;
    requirementId?: number;
    requirement?: string;
    postedById?: number;
    postedBy?: string;
    createdAt?: string;
    status?: number;   // 👈 THÊM DÒNG NÀY
}

export default function JobPostPage() {
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");

    const [jobPosts, setJobPosts] = useState<JobPostDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [requirements, setRequirements] = useState<{ id: number; requirement: string; status: number }[]>([]);
    const [currentPost, setCurrentPost] = useState<JobPostDto | null>(null);
    const [deletedPostId, setDeletedPostId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const filteredJobPosts = (jobPosts ?? []).filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Tính tổng số trang
    const totalPages = Math.ceil(filteredJobPosts.length / itemsPerPage);

    // Tính dữ liệu đang hiển thị theo trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredJobPosts.slice(indexOfFirstItem, indexOfLastItem);
    // ROLE
    const [currentRole, setCurrentRole] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const role =
                    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
                setCurrentRole(role);
            } catch (err) {
                console.error("Error decoding JWT", err);
            }
        }
    }, []);

    function openAdd() {
        setModalMode("add");
        setCurrentPost(null);
    }

    function openEdit(post: JobPostDto) {
        setModalMode("edit");
        setCurrentPost(post);
    }

    // LOAD DATA
    useEffect(() => {
        async function loadData() {
            try {
                const posts = await apiFetch("/jobpost");
                const reqs = await apiFetch("/recruitmentrequirement");

                setJobPosts(Array.isArray(posts) ? posts : []);
                setRequirements(Array.isArray(reqs) ? reqs : []);

            } catch (err) {
                console.warn("JobPostPage load error:", err);
                setJobPosts([]);
                setRequirements([]);
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);


    if (loading) return <p>Loading...</p>;

    async function handleSave() {
        const token = localStorage.getItem("jwt");
        if (!token) {
            toast.error("Token not found. Please login again.");
            window.location.href = "/auth/login";
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const empId = payload["employeeId"] || payload["sub"];

            const body =
                modalMode === "add"
                    ? {
                        title: currentPost?.title,
                        requirementId: currentPost?.requirementId,
                        content: currentPost?.content,
                        postedById: empId,
                    }
                    : {
                        id: currentPost?.id,
                        title: currentPost?.title,
                        requirementId: currentPost?.requirementId,
                        content: currentPost?.content,
                    };

            const method = modalMode === "add" ? "POST" : "PUT";
            const path = modalMode === "add" ? "/jobpost" : `/jobpost/${currentPost?.id}`;

            await apiFetch(path, method, body);

            toast.success("Job post saved successfully");

            const posts = await apiFetch("/jobpost");
            setJobPosts(posts);

            (window as any).$("#exampleModal").modal("hide");

        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message);
        }
    }

    function openDelete(id: number) {
        setDeletedPostId(id);
    }

    async function handleDelete() {
        if (!deletedPostId) return;

        try {
            await apiFetch(`/jobpost/${deletedPostId}`, "DELETE");

            toast.success("Job post deleted successfully");

            setJobPosts(prev => prev.filter(post => post.id !== deletedPostId));
            setDeletedPostId(null);

            (window as any).$("#confirmDeleteModal").modal("hide");

        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message);
        }
    }

    // 🟢 STATUS VIEW HELPER
    function renderStatus(status?: number) {
        if (status === 0)
            return <span className="badge badge-success">Hiring</span>;
        if (status === 1)
            return <span className="badge badge-secondary">Closed</span>;
        return <span className="badge badge-light">N/A</span>;
    }

    return (
        <div className="section-body">
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center">
                    <div></div>
                    {currentRole === "HR" && (
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

                <div className="card mt-3">
                    <div className="card-header border-bottom">
                        <h3 className="card-title">Job Post</h3>
                        <div className="card-options">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search title..."
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
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Id</th>
                                        <th>Title</th>
                                        <th>Content</th>
                                        <th>Requirement</th>
                                        <th>Poster</th>
                                        <th>Created Date</th>
                                        <th>Status</th>
                                        {currentRole === "HR" && (<th>Action</th>)}
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentItems.map(post => (
                                        <tr key={post.id}>
                                            <td>
                                                <input type="checkbox" />
                                            </td>

                                            <td>{post.id}</td>

                                            <td>
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: truncate(post.title ?? "", 20, { ellipsis: "..." })
                                                    }}
                                                />
                                            </td>

                                            <td>
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: truncate(post.content ?? "", 30, { ellipsis: "..." })
                                                    }}
                                                />
                                            </td>

                                            <td><div
                                                dangerouslySetInnerHTML={{
                                                    __html: truncate(post.requirement ?? "", 20, { ellipsis: "..." })
                                                }}
                                            /></td>
                                            <td>{post.postedBy}</td>

                                            <td>
                                                {post.createdAt
                                                    ? new Date(post.createdAt).toLocaleDateString("en-CA")
                                                    : ""}
                                            </td>

                                            {/* STATUS */}
                                            <td>{renderStatus(post.status)}</td>

                                            {currentRole === "HR" && (
                                                <td>
                                                    <button
                                                        className="btn btn-icon"
                                                        data-toggle="modal"
                                                        data-target="#exampleModal"
                                                        onClick={() => openEdit(post)}
                                                    >
                                                        <i className="fa-solid fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-icon"
                                                        data-toggle="modal"
                                                        data-target="#confirmDeleteModal"
                                                        onClick={() => openDelete(post.id!)}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
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

            {/* Delete Modal */}
            <div className="modal fade" id="confirmDeleteModal" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Confirm Delete</h5>
                            <button className="close" data-dismiss="modal">&times;</button>
                        </div>
                        <div className="modal-body">Are you sure?</div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <div className="modal fade" id="exampleModal" tabIndex={-1}>
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5>{modalMode === "add" ? "Add Post" : "Edit Post"}</h5>
                            <button className="close" data-dismiss="modal">&times;</button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Title"
                                    value={currentPost?.title ?? ""}
                                    onChange={(e) => setCurrentPost(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <Editor
                                    apiKey="gnul4exykdw4ilbph4qq8itxkat2qdc96w33b7ydazw3m57y"
                                    value={currentPost?.content ?? ""}
                                    init={{
                                        height: 250,
                                        menubar: false,
                                        plugins: ["lists", "link", "code", "table"],
                                        toolbar:
                                            "undo redo | bold italic underline | bullist numlist | link | code | table",
                                    }}
                                    onEditorChange={(newValue) =>
                                        setCurrentPost(prev => ({ ...prev, content: newValue }))
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <select
                                    className="form-control"
                                    value={currentPost?.requirementId ?? ""}
                                    onChange={(e) =>
                                        setCurrentPost(prev => ({ ...prev, requirementId: Number(e.target.value) }))
                                    }
                                >
                                    <option value="">Select Requirement</option>
                                    {requirements
                                        .filter(req => req.status === 1)
                                        .map(req => (
                                            <option key={req.id} value={req.id}>{req.requirement}</option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
                        </div>

                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}
