
import React, { useState, useEffect, useCallback } from 'react';
import NavBar from '../../components/NavBar/NavBar';
import FlightForm from '../../components/FlightForm/FlightForm';
import HotelForm from '../../components/HotelForm/HotelForm';
import AttractionForm from '../../components/AttractionForm/AttractionForm';
import BlogFeed from '../../components/BlogFeed/BlogFeed';
import TravelSuggestions from '../../components/TravelSuggestions/TravelSuggestions';
import { SuggestionsProvider } from '../../context/SuggestionsContext';
import './Dashboard.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('stays');
  

  const [staysSearching, setStaysSearching] = useState(false);
  const [flightsSearching, setFlightsSearching] = useState(false);
  const [attractionsSearching, setAttractionsSearching] = useState(false);


  const [staysState, setStaysState] = useState(null);
  const [flightsState, setFlightsState] = useState(null);
  const [attractionsState, setAttractionsState] = useState(null);


  const handleStaysSearch = useCallback(() => setStaysSearching(true), []);
  const handleFlightsSearch = useCallback(() => setFlightsSearching(true), []);
  const handleAttractionsSearch = useCallback(() => setAttractionsSearching(true), []);
  
  const handleStaysStateChange = useCallback((state) => setStaysState(state), []);
  const handleFlightsStateChange = useCallback((state) => setFlightsState(state), []);
  const handleAttractionsStateChange = useCallback((state) => setAttractionsState(state), []);


  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleSearch = (section, suggestion = null) => {
    if (section === 'stays') setStaysSearching(true);
    else if (section === 'flights') setFlightsSearching(true);
    else if (section === 'attractions') setAttractionsSearching(true);
    
    console.log('Suggestion selected:', suggestion);
  };
  

  return (
    <div>
      <NavBar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <SuggestionsProvider>
        <div className="content">

          {activeSection === 'stays' && (
            <>
              {!staysSearching && (
                <>
                  <TravelSuggestions onSearch={handleSearch} section="stays" />
                  <div className="section-divider"></div>
                </>
              )}
              
              {staysSearching && (
                <button className="back-to-suggestions" onClick={() => setStaysSearching(false)}>
                  ← Back to Suggestions
                </button>
              )}
              
              <div className="search-section">
                {!staysSearching && <h2 className="section-title">Search for Accommodations</h2>}
                <HotelForm 
                  onSearch={handleStaysSearch}
                  initialState={staysState} 
                  onStateChange={handleStaysStateChange} />
              </div>
            </>
          )}

          {activeSection === 'flights' && (
            <>
              {!flightsSearching && (
                <>
                  <TravelSuggestions onSearch={handleSearch} section="flights" />
                  <div className="section-divider" />
                </>
              )}
              
              {flightsSearching && (
                <button className="back-to-suggestions" onClick={() => setFlightsSearching(false)}>
                  ← Back to Suggestions
                </button>
              )}
              
              <div className="search-section">
                {!flightsSearching && <h2 className="section-title">Search for Flights</h2>}
                <FlightForm 
                  onSearch={handleFlightsSearch}
                  initialState={flightsState}
                  onStateChange={handleFlightsStateChange} />
              </div>
            </>
          )}

          {activeSection === 'attractions' && (
            <>
              {!attractionsSearching && (
                <>
                  <TravelSuggestions onSearch={handleSearch} section="attractions" />
                  <div className="section-divider" />
                </>
              )}
              
              {attractionsSearching && (
                <button className="back-to-suggestions" onClick={() => setAttractionsSearching(false)}>
                  ← Back to Suggestions
                </button>
              )}
              
              <div className="search-section">
                {!attractionsSearching && <h2 className="section-title">Search for Attractions</h2>}
                <AttractionForm 
                  onSearch={handleAttractionsSearch}
                  initialState={attractionsState}
                  onStateChange={handleAttractionsStateChange} />
              </div>
            </>
          )}

          {activeSection === 'blogs' && (
            <BlogFeed onSearch={() => handleSearch('blogs')} />
          )}

        </div>
      </SuggestionsProvider>
    </div>
  );
};

export default Dashboard;
