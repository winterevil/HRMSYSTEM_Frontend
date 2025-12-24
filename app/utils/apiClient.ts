"use client";

export const API_BASE_URL = "https://localhost:7207/api";

export async function apiFetch(
    path: string,
    method: string = "GET",
    body?: any,
    customHeaders?: Record<string, string>
) {
    const token = localStorage.getItem("jwt");
    if (!token) {
        window.location.href = "/auth/login";
        throw new Error("Authentication required.");
    }

    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...customHeaders,
    };

    const url = path.startsWith("http")
        ? path
        : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const text = await response.text();
        const lower = text.toLowerCase();

        // CHỈ ÁP DỤNG CHO GET
        if (
            method === "GET" &&
            response.status === 400 &&
            (lower.includes("no ") && lower.includes(" found"))
        ) {
            return [];
        }

        if (
            method === "GET" &&
            response.status === 400 &&
            lower.includes("no") &&
            lower.includes("request")
        ) {
            return [];
        }

        if (response.status === 401) {
            localStorage.removeItem("jwt");
            window.location.href = "/auth/login";
            return null;
        }

        if (response.status === 403) {
            return null;
        }

        // CREATE / UPDATE / APPROVE → BẮT BUỘC THROW
        throw new Error(text || `Request failed (${response.status})`);
    }

    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}
