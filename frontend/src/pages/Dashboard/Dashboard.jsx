import React, {useState} from 'react';
import NavBar from '../../components/NavBar/NavBar'; 
import FlightForm from '../../components/FlightForm/FlightForm';
import HotelForm from '../../components/HotelForm/HotelForm';
import AttractionForm from '../../components/AttractionForm/AttractionForm';
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
                {activeSection === 'stays' && <HotelForm />}
                {activeSection === 'flights' && <FlightForm />}
                {activeSection === 'attractions' && <AttractionForm />}
            </div>
        </div>
    );
};

export default Dashboard;
