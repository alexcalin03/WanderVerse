import React, { useState, useEffect } from 'react';
import './HotelForm.css';
import { fetchHotels } from '../../api/amadeusAPI';
import HotelCard from '../HotelCard/HotelCard';
import Loading from '../Loading/Loading'; // Import reusable loading component
import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';

const API_BASE = 'http://127.0.0.1:8000';

const HotelForm = () => {

const [cityCode, setCityCode] = useState('');
const [checkInDate, setCheckInDate] = useState('');
const [checkOutDate, setCheckOutDate] = useState('');
const [adults, setAdults] = useState(1);
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);

}
export default HotelForm;