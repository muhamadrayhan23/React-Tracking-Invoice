const API_URL = "http://localhost:3000/api/auth";

/* =========================
   LOGIN
========================= */
export const login = async ({ username, password }) => {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Login gagal");
    }

    return data; // { message, user }
};

export const getMe = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        throw new Error("Belum login");
    }

    return user; // { id, username, role }
};


/* =========================
   LOGOUT
========================= */
export const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
};
