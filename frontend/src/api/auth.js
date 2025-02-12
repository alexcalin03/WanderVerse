const API_BASE = 'http://127.0.0.1:8000';

export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE}/api/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to login');
        }

        const data = await response.json();
        return data; // Contains the token
    } catch (error) {
        throw error;
    }
};

export async function logoutUser() {
    const token = localStorage.getItem("authToken");


    if (!token) {
        console.error("No token found. User is not logged in.");
        return;
    }

    const response = await fetch(`${API_BASE}/logout/`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (response.ok) {
        localStorage.removeItem("authToken"); 
    } else {
        console.error("Failed to log out.");
    }
}

export async function signUpUser(username, password, email) {
    try {
        const response = await fetch(`${API_BASE}/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, email }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to register.");
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

