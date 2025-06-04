import React, { useState } from 'react';
import NavBar from '../../components/NavBar/NavBar'; 
import FlightForm from '../../components/FlightForm/FlightForm';
import HotelForm from '../../components/HotelForm/HotelForm';
import AttractionForm from '../../components/AttractionForm/AttractionForm';
import BlogFeed from '../../components/BlogFeed/BlogFeed';
import './Dashboard.css';

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('stays');
    // Track search state for each section
    const [hasSearched, setHasSearched] = useState({
        stays: false,
        flights: false,
        attractions: false,
        blogs: false
    });

    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    // Callback for forms to notify search
    const handleSearch = (section) => {
        setHasSearched(prev => ({
            ...prev,
            [section]: true
        }));
    };

    // Section-specific messages
    const messages = {
        stays: "Search for the best hotel deals on WanderVerse!",
        flights: "Search for the best flight deals on WanderVerse!",
        attractions: "Search for the best attractions on WanderVerse!",
        blogs: "Explore the best travel blogs on WanderVerse!"
    };

    return (
        <div>
            <NavBar onSectionChange={handleSectionChange} />
            <div className="content">
                {activeSection === 'stays' && (
                    <>
                        {!hasSearched.stays && (
                            <div className="center-message">{messages.stays}</div>
                        )}
                        <HotelForm onSearch={() => handleSearch('stays')} />
                    </>
                )}
                {activeSection === 'flights' && (
                    <>
                        {!hasSearched.flights && (
                            <div className="center-message">{messages.flights}</div>
                        )}
                        <FlightForm onSearch={() => handleSearch('flights')} />
                    </>
                )}
                {activeSection === 'attractions' && (
                    <>
                        {!hasSearched.attractions && (
                            <div className="center-message">{messages.attractions}</div>
                        )}
                        <AttractionForm onSearch={() => handleSearch('attractions')} />
                    </>
                )}

                {activeSection === 'blogs' && (
                    <>
                        {!hasSearched.blogs && (
                            <div className="center-message">{messages.blogs}</div>
                        )}
                        <BlogFeed onSearch={() => handleSearch('blogs')} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;