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

        if (
            response.status === 400 &&
            (lower.includes("no ") && lower.includes(" found"))
        ) {
            console.warn("API: no data → return empty array");
            return [];
        }

        if (
            response.status === 400 &&
            lower.includes("no") &&
            lower.includes("request")
        ) {
            console.warn("API: no request data");
            return [];
        }

        if (response.status === 401) {
            console.warn("401 Unauthorized → redirect to login");
            localStorage.removeItem("jwt");
            window.location.href = "/auth/login";
            return null;
        }

        if (response.status === 403) {
            console.warn("⚠ 403 Forbidden → return null");
            return null;
        }

        // Các lỗi còn lại → throw lỗi thật
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
