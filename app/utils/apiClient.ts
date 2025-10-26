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
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...customHeaders,
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed (${response.status})`);
    }

    try {
        return await response.json();
    } catch {
        return null; 
    }
}
