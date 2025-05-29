

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",

    };

    const res = await fetch(url, { ...options, headers});
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();

}