import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth.js';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await loginUser(username, password);
            localStorage.setItem('authToken', data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const navigateToSignUp = () => {
        navigate('/signup');
    }

    const [hoverStyle, setHoverStyle] = useState({});

    const handleMouseMove = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100; 
        
        

        setHoverStyle({
            background: `linear-gradient(to right, rgb(11, 202, 167) ${x - 70}%, rgb(13, 209, 196) ${x}%, rgb(11, 202, 167) ${x + 70}%)`,
        });
    };

    const handleMouseLeave = () => {
        setHoverStyle({}); 
    };

    return (
        <div className="login-container">
            <h1 id='titleH1'>WanderVerse</h1>
            <div className="login-form">
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="error">{error}</p>}
                    <button 
                    type="submit"
                    className="hover-button"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={hoverStyle}
                    >Login</button>
                </form>
            </div>
            <div className="signup-link">
                <p>Don't have an account?
                <span onClick={navigateToSignUp} id='navigateToSignUp'>  Sign Up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
