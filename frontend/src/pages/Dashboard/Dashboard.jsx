import React, {useState} from 'react';
import NavBar from '../../components/NavBar/NavBar'; 
import FlightForm from '../../components/FlightForm/FlightForm';
import './Dashboard.css';

const Dashboard = () => {

    const [activeSection, setActiveSection] = useState('stays');
    
        const handleSectionChange = (section) => {
            setActiveSection(section);
        };
    return (
        <div>
            <NavBar onSectionChange={handleSectionChange} />
            <div className="content">
                {activeSection === 'stays' && <h2>Showing Stays</h2>}
                {activeSection === 'flights' && <FlightForm />}
                {activeSection === 'attractions' && <h2>Showing Attractions</h2>}
            </div>
        </div>
    );
};

export default Dashboard;
