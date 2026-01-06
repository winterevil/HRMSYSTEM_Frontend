"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/app/utils/apiClient";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async () => {
        if (!token) {
            setError("Invalid reset link");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await apiFetch(
                "/auth/reset-password",
                "POST",
                { token, newPassword: password },
                undefined,
                false 
            );

            toast.success("Password reset successful. Please login.");
            router.push("/auth/login");
        } catch (err: any) {
            toast.error(err.message || "Reset password failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth">
            <div className="auth_left">
                <div className="card">
                    <div className="card-body">
                        <div className="card-title">Reset Password</div>

                        {error && <div className="alert alert-danger">{error}</div>}

                        <input
                            type="password"
                            className="form-control mb-2"
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <input
                            type="password"
                            className="form-control mb-3"
                            placeholder="Confirm password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />

                        <button
                            type="button"
                            className="btn btn-primary btn-block"
                            onClick={submit}
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                </div>
            </div>
            <div className="auth_right">
                <div className="carousel slide" data-ride="carousel" data-interval="3000">
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <img src="../../assets/images/slider1.png" className="img-fluid" alt="login page" />
                            <div className="px-4 mt-4">
                                <h4>Centralized HR Dashboard</h4>
                                <p>Easily manage employee data, attendance, payroll, and performance all in one platform.</p>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <img src="../../assets/images/slider2.png" className="img-fluid" alt="login page" />
                            <div className="px-4 mt-4">
                                <h4>Streamlined Employee Management</h4>
                                <p>Keep track of employee profiles, departments, and contracts to optimize HR workflows.</p>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <img src="../../assets/images/slider3.png" className="img-fluid" alt="login page" />
                            <div className="px-4 mt-4">
                                <h4>Automated Attendance & Leave</h4>
                                <p>Accurately record work hours, overtime, and leave requests with transparent reporting.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
