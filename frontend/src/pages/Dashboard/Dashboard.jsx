// src/pages/Dashboard/Dashboard.js
import React, { useState } from 'react';
import NavBar from '../../components/NavBar/NavBar';
import FlightForm from '../../components/FlightForm/FlightForm';
import HotelForm from '../../components/HotelForm/HotelForm';
import AttractionForm from '../../components/AttractionForm/AttractionForm';
import BlogFeed from '../../components/BlogFeed/BlogFeed';
import './Dashboard.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('stays');

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleSearch = (section) => {
  };

  return (
    <div>
      <NavBar activeSection={activeSection} onSectionChange={handleSectionChange} />

      <div className="content">
        {activeSection === 'stays' && (
          <HotelForm onSearch={() => handleSearch('stays')} />
        )}

        {activeSection === 'flights' && (
          <FlightForm onSearch={() => handleSearch('flights')} />
        )}

        {activeSection === 'attractions' && (
          <AttractionForm onSearch={() => handleSearch('attractions')} />
        )}

        {activeSection === 'blogs' && (
          <BlogFeed onSearch={() => handleSearch('blogs')} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
