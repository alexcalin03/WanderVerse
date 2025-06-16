import React from 'react';
import './Loading.css';
//reusable component to display loading bubbles until content gets fetched
const Loading = () => {
    return (
        <div className="loading-overlay">
            <div className="preloader">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
};

export default Loading;
