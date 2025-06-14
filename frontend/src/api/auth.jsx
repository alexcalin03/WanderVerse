const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

export const loginUser = async (username, password) => {
    try {
        console.log('Logging in with:', { username, password });
        // Add debug log to see the API URL being used
        console.log('Using API URL:', `${API_BASE}/api/token/`);
        
        const response = await fetch(`${API_BASE}/api/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        // Log the status and response text for debugging
        console.log('Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.non_field_errors?.[0] || errorData.detail || 'Invalid credentials');
            } catch (e) {
                if (e instanceof SyntaxError) {
                    throw new Error('Server error during login. Please try again.');
                }
                throw e;
            }
        }

        const data = await response.json();
        console.log('Login successful:', data);
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

export async function updateUser(username, email) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/update_user/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({ username, email }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update user.");
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function updateUserPassword(currentPassword, newPassword) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/update_user_password/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({ 
                current_password: currentPassword,
                new_password: newPassword 
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update user password.");
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}


