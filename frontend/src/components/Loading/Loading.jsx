import React from 'react';
import './Loading.css';

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
