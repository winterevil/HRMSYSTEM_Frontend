"use client";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import truncate from "html-truncate";
import dynamic from "next/dynamic";
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
}
export default function JobPostPage() {
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    //const [content, setContent] = useState("");

    const [jobPosts, setJobPosts] = useState<JobPostDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [requirements, setRequirements] = useState<{ id: number; requirement: string, status: number }[]>([]);
    const [currentPost, setCurrentPost] = useState<JobPostDto | null>(null);
    const [deletedPostId, setDeletedPostId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const filteredJobPosts = jobPosts.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase())
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


    function openAdd() {
        setModalMode("add");
        setCurrentPost(null);
    }

    function openEdit(post: JobPostDto) {
        setModalMode("edit");
        setCurrentPost(post);
    }

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            window.location.href = "/auth/login";
            return;
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        };

        async function loadData() {
            try {
                const [postsRes, reqsRes] = await Promise.all([
                    fetch("https://localhost:7207/api/jobpost", { headers }),
                    fetch("https://localhost:7207/api/recruitmentrequirement", { headers }),
                ]);
                console.log("postsRes:", postsRes.status, postsRes.statusText);
                console.log("reqsRes:", reqsRes.status, reqsRes.statusText);
                if (!postsRes.ok) throw new Error(await postsRes.text());
                if (!reqsRes.ok) throw new Error(await reqsRes.text());

                const postsData = await postsRes.json();
                const reqsData = await reqsRes.json();

                setJobPosts(postsData);
                setRequirements(reqsData);
                setLoading(false);
            } catch (err: unknown) {
                const error = err as Error;
                setError(error.message);
                setLoading(false);
            }
        }
        loadData();
    }, []);
    if (loading) return <p>Loading...</p>;
    //if (error) return <div className="alert alert-danger">{error}</div>;

    async function handleSave() {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        };

        try {
            let body: any = {};

            if (modalMode === "add") {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const empId = payload["employeeId"] || payload["sub"];
                body = {
                    title: currentPost?.title,
                    requirementId: currentPost?.requirementId,
                    content: currentPost?.content,
                    postedById: empId,
                }
            } else {
                body = {
                    id: currentPost?.id,
                    title: currentPost?.title,
                    requirementId: currentPost?.requirementId,
                    content: currentPost?.content,
                }
            }

            const url = modalMode === "add"
                ? "https://localhost:7207/api/jobpost"
                : `https://localhost:7207/api/jobpost/${currentPost?.id}`;

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

            toast.success("Job post saved successfully", {
                position: "top-right",
                autoClose: 3000,
            });

            const postsRes = await fetch("https://localhost:7207/api/jobpost", { headers });
            const posts = await postsRes.json();
            setJobPosts(posts);

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
        setDeletedPostId(id);
    }

    async function handleDelete() {
        if (!deletedPostId) return;

        const token = localStorage.getItem("jwt");
        if (!token) return;

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        };

        try {
            const res = await fetch(`https://localhost:7207/api/jobpost/${deletedPostId}`, {
                method: "DELETE",
                headers,
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || "Something went wrong");
            }
            toast.success("Job post deleted successfully", {
                position: "top-right",
                autoClose: 3000,
            });

            setJobPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
            setDeletedPostId(null);
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
                <div className="d-flex justify-content-between align-items-center">
                    <ul className="nav nav-tabs page-header-tab">
                    </ul>
                    <div className="header-action">
                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#exampleModal" onClick={openAdd}><i className="fa-solid fa-plus mr-2"></i>Add</button>
                    </div>
                </div>
                <div className="tab-content mt-3">
                    <div className="tab-pane fade show active" id="Payroll-Salary" role="tabpanel">

                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Job Post</h3>
                                <div className="card-options">
                                    <form>
                                        <div className="input-group">
                                            <input type="text" className="form-control form-control-sm" placeholder="Enter name to search..." name="s"
                                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped table-vcenter text-nowrap">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th style={{ width: "20px" }}>Id</th>
                                                <th className="w200">Title</th>
                                                <th className="w200">Content</th>
                                                <th className="w200">Requirement</th>
                                                <th className="w200">Poster</th>
                                                <th className="w200">Created Date</th>
                                                <th className="w60">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredJobPosts.map((post) => (
                                                <tr key={post.id}>
                                                    <td className="w40">
                                                        <label className="custom-control custom-checkbox">
                                                            <input type="checkbox" className="custom-control-input" name="example-checkbox1" value="option1" />
                                                            <span className="custom-control-label">&nbsp;</span>
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <span>{post.id}</span>
                                                    </td>
                                                    <td>
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: truncate(post.title ?? "", 20, { ellipsis: "..." }),
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: truncate(post.content ?? "", 30, { ellipsis: "..." }),
                                                            }}
                                                        />
                                                    </td>

                                                    <td>{post.requirement}</td>
                                                    <td>{post.postedBy}</td>
                                                    <td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-CA") : ""}</td>
                                                    <td>
                                                        <button type="button" className="btn btn-icon" title="Process" data-toggle="modal" data-placement="top" data-target="#exampleModal" onClick={() => openEdit(post)}><i className="fa-solid fa-edit"></i></button>
                                                        <button type="button" className="btn btn-icon js-sweetalert" title="Delete" data-type="confirm" data-toggle="modal" data-target="#confirmDeleteModal" onClick={() => openDelete(post.id!)}><i className="fa-solid fa-trash"></i></button>
                                                    </td>
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
                            <p>Are you sure you want to delete this post?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="exampleModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">{modalMode === "add" ? "Add Post" : "Edit Post"}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <div className="row clearfix">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="hidden" className="form-control" placeholder="Post Id"
                                            value={currentPost?.id ?? ""} />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="Title"
                                            value={currentPost?.title ?? ""}
                                            onChange={(e) =>
                                                setCurrentPost((prev) => ({ ...prev, title: e.target.value }))
                                            } />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <Editor
                                            apiKey="gnul4exykdw4ilbph4qq8itxkat2qdc96w33b7ydazw3m57y"
                                            value={currentPost?.content ?? ""}
                                            init={{
                                                height: 250,
                                                menubar: false,
                                                plugins: ["lists", "link", "code", "table"],
                                                toolbar:
                                                    "undo redo | formatselect | bold italic underline | " +
                                                    "bullist numlist | link | code | table",
                                            }}
                                            onEditorChange={(newValue) =>
                                                setCurrentPost((prev) => ({ ...prev, content: newValue }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <select className="form-control" value={currentPost?.requirementId ?? ""}
                                            onChange={(e) => setCurrentPost({ ...currentPost, requirementId: Number(e.target.value) })}>
                                            <option value="">Select Requirement</option>
                                            {requirements
                                                .filter((req) => req.status === 1)
                                                .map((req) => (
                                                    <option key={req.id} value={req.id}>
                                                        {req.requirement}
                                                    </option>
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