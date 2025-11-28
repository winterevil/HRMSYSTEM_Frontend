/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/utils/apiClient";


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errMsg = await res.text();
                setError(errMsg || "Login failed");
                return;
            }

            const data = await res.json();
            console.log("Login success:", data);

            localStorage.setItem("jwt", data.token);
            document.cookie = `jwt=${data.token}; path=/; max-age=900; secure; samesite=strict`;

            setTimeout(() => {
                router.push("/main/hrms/dashboard");
            }, 1500);
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message || "Server error");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="auth">
            <div className="auth_left">
                <div className="card">
                    <div className="text-center mb-2">
                        <a className="header-brand" href="#"><i className="fa-solid fa-users-gear brand-logo"></i></a>
                    </div>
                    <div className="card-body">
                        <div className="card-title">Login to your account</div>
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email"
                                    value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <div
                                        className="input-group-append"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="input-group-text">
                                            <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {error && <div className="alert alert-danger">{error}</div>}
                            {/*<div className="form-group">*/}
                            {/*    <label className="custom-control custom-checkbox">*/}
                            {/*        <input type="checkbox" className="custom-control-input" />*/}
                            {/*        <span className="custom-control-label">Remember me</span>*/}
                            {/*    </label>*/}
                            {/*    <label className="form-label"><a href="/auth/forgot-password" className="float-right small">I forgot password</a></label>*/}
                            {/*</div>*/}
                            <div className="form-footer">
                                <button type="submit" className="btn btn-primary btn-block" title="" disabled={loading}>{loading ? "Signing in..." : "Sign in"}
                                </button>
                            </div>
                        </form>
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
        </div>
    );
}