import React, { useState, useEffect } from 'react';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import './ShareExperienceForm.css';
import { fetchCities } from '../../api/amadeusAPI';
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';

const ShareExperienceForm = ({ onClose, onSubmit, editMode = false, postData = null }) => {
  const [title, setTitle] = useState(editMode && postData ? postData.title : '');
  const [location, setLocation] = useState(editMode && postData ? postData.location : '');
  const [content, setContent] = useState(editMode && postData ? postData.content : '');
  const [latitude, setLatitude] = useState(editMode && postData && postData.latitude ? postData.latitude : null);
  const [longitude, setLongitude] = useState(editMode && postData && postData.longitude ? postData.longitude : null);
  const [cityCode, setCityCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!content.trim()) {
      alert('Please enter content for your post');
      return;
    }
    

    let formattedLocation = location.trim();
    if (!formattedLocation) {
      alert('Please enter a location');
      return;
    }
    
    if (!formattedLocation.includes(',')) {
      formattedLocation = `${formattedLocation}, Unknown Country`;
    }
    
    const postPayload = {
      title: title.trim(),
      location: formattedLocation,
      content: content.trim()
    };
    
    if (editMode && postData && postData.id) {
      postPayload.id = postData.id;
    }
    
    onSubmit(postPayload);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        if ($ && $.fn.autocomplete) {
            $("#location-input").autocomplete({
                source: async function (request, response) {
                    try {
                        const data = await fetchCities(request.term);
                        response(data.map(city => ({
                            label: `${city.label}`, 
                            value: city.value,
                            lat: city.latitude,
                            lon: city.longitude
                        })));
                    } catch (error) {
                        console.error("Autocomplete API Error:", error);
                        response([]);
                    }
                },
                minLength: 2,
                select: function (event, ui) {
                    
                    setLocation(ui.item.label);
                    setLatitude(ui.item.lat);
                    setLongitude(ui.item.lon);
                    return false; 
                }
            }).autocomplete("instance")._renderItem = function(ul, item) {
               
                return $( "<li>" )
                    .append(`<div>${item.label}</div>`)
                    .appendTo(ul);
            };
            
            console.log("Autocomplete initialized for #location-input");
        } else {
            console.error("jQuery UI Autocomplete is not available");
        }
    }, 100); 
    
    return () => clearTimeout(timer);
}, []); 

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose}>
          <CloseIcon className="close-icon" />
        </button>
        <h2 className="modal-title">{editMode ? 'Edit Your Post' : 'Share Your Experience'}</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-label">
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Enter title"
              required
            />
          </label>

          <label className="form-label">
            Location
            <input
              id="location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
              placeholder="City, Country"
              required
            />
          </label>

          <label className="form-label">
            Content
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-textarea"
              placeholder="Write your experience here..."
              rows={6}
              required
            />
          </label>

          <button type="submit" className="form-submit-btn">
            {editMode ? 'Save Changes' : 'Share Experience'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShareExperienceForm;
