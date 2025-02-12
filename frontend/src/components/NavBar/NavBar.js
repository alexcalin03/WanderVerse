import React, { useState, useRef, useEffect } from 'react';
import './NavBar.css'; // Add styles here or inline
import { logoutUser } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ onSectionChange }) => {
    const [activeSection, setActiveSection] = useState('stays');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSectionClick = (section) => {
        setActiveSection(section);
        onSectionChange(section); // Notify parent component about the section change
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    });

    const handleLogout = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const confirmLogout = window.confirm('Are you sure you want to log out?');
            if (!confirmLogout) return;
            await logoutUser();
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    }



    return (
        <nav className="navbar">
            {/* Left: Logo and Name */}
            <div className="navbar-left">
                <img src="resources/logo.png" alt="Travel App Logo" className="logo" />
                <span className="app-name">wanderVerse</span>
            </div>

            {/* Middle: Sections */}
            <div className="navbar-middle">
                <button
                    className={`nav-btn ${activeSection === 'stays' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('stays')}
                >
                    Stays
                </button>
                <button
                    className={`nav-btn ${activeSection === 'flights' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('flights')}
                >
                    Flights
                </button>
                <button
                    className={`nav-btn ${activeSection === 'attractions' ? 'active' : ''}`}
                    onClick={() => handleSectionClick('attractions')}
                >
                    Attractions
                </button>
            </div>

            {/* Right: Menu/Person Icon */}
            <div className="navbar-right" ref={dropdownRef}>
                <button className="menu-icon"  onClick={() => setShowDropdown((prev) => !prev)}>
                <img src="/resources/accountcircle.svg" alt="Account Icon" className="account-icon" />
                </button>

                {showDropdown && (
                    <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
                        <button className="dropdown-item">Account</button>
                        <button className="dropdown-item" onClick={handleLogout}>Log Out</button>
                    </div>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}
        </nav>
    );
};

export default NavBar;
