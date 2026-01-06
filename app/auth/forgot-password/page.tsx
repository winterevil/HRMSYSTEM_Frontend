"use client";
import React, { useState } from 'react';
import { apiFetch } from "@/app/utils/apiClient";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");

    const submit = async () => {
        await apiFetch(
            "/auth/forgot-password",
            "POST",
            { email },
            undefined,
            false 
        );

        toast.success("If email exists, reset link has been sent.");
    };
    return (
        <div className="auth">
            <div className="auth_left">
                <div className="card">
                    <div className="text-center mb-5">
                        <a className="header-brand" href="index.html"><i className="fa-solid fa-users-gear brand-logo"></i></a>
                    </div>
                    <div className="card-body">
                        <div className="card-title">Forgot password</div>
                        <p className="text-muted">Enter your email address and your password will be reset and emailed to you.</p>
                        <div className="form-group">
                            <label className="form-label" htmlFor="exampleInputEmail1">Email address</label>
                            <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" value={email}
                                onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="form-footer">
                            <button type="button" className="btn btn-primary btn-block" onClick={submit}>Send Reset Link</button>
                        </div>
                    </div>
                    <div className="text-center text-muted">
                        Forget it, <a href="/auth/login">Send me Back</a> to the Sign in screen.
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