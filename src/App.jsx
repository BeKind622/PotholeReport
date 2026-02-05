import { useState, useEffect } from 'react'

import './App.css'

function App() {
  const [ipAddress, setIpAddress] = useState('');
  const [geoInfo, setGeoInfo] = useState({});

  useEffect(() => {
    getVisitorIP();
  }, []);

  const getVisitorIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org')
      const data = await response.text();
      setIpAddress(data);
    
    } catch (error) {
      console.error('Error fetching IP address:', error);
    }
  };
const handleInputChange = (e) => {
  setIpAddress(e.target.value);
};

const fetchIPInfo = async () => {
 try {
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    const data = await response.json();
    setGeoInfo(data);
  } catch (error) { 
    console.error('Error fetching IP information:', error);
  }
 } 


  return (
    <>
    <div className='App'>
      <p>IP to Location: {ipAddress}</p>
      <div className="form-area">
        
        <button onClick={fetchIPInfo}>Get Info</button>
      </div>

      {geoInfo.country_name && (
        <div className="geo-info">
          <p>Country: {geoInfo.country_name}</p>
          <p>Region: {geoInfo.region}</p>
          <p>City: {geoInfo.city}</p>
          <p>Postal Code: {geoInfo.postal}</p>
          <p>Latitude: {geoInfo.latitude}</p>
          <p>Longitude: {geoInfo.longitude}</p>
          <p>Timezone: {geoInfo.timezone}</p>
          <p>ISP: {geoInfo.org}</p>
        </div>
      )}
      </div>  
    </>
  )
}

export default App
