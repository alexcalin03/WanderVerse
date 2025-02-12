import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpUser } from '../../api/auth';
import './SignUp.css';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');

        try {
            await signUpUser(username, password, email);
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    const navigateToLogin = () => {
        navigate('/login');
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
        <div className="signup-container">
            <h1 id='titleH1'>WanderVerse</h1>
            <div className="signup-form">
                <h1>Sign Up</h1>
                <form onSubmit={handleSignUp}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />


                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />



                    {error && <p className="error">{error}</p>}
                    <button type="submit"
                    className="hover-button"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={hoverStyle}
                    >Sign Up</button>
                </form>
            </div>

            <div className="login-link">
                <p>Already have an account?
                <span onClick={navigateToLogin}> Login</span>
                </p>
            </div>
        </div>
    );
}

export default SignUp;