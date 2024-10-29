import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="main-content">
        <Link to="/fitness" className="feature-box fitness">
          <p>Fitness</p>
          <i className="icon dumbbell-icon"></i>
        </Link>
        <Link to="/mygroup" className="feature-box mygroup">
          <p>MYGROUP</p>
          <i className="icon group-icon"></i>
        </Link>
        <Link to="/mymap" className="feature-box mymap">
          <p>MYMAP</p>
          <i className="icon map-icon"></i>
        </Link>
        <Link to="/myring" className="feature-box myring">
          <p>MYRING</p>
          <i className="icon ring-icon"></i>
        </Link>
        <Link to="/ringkeeper" className="feature-box ring-keeper">
          <p>RING KEEPER</p>
          <i className="icon bookmark-icon"></i>
        </Link>
        <Link to="/weather" className="feature-box weather">
          <p>Weather</p>
          <i className="icon weather-icon"></i>
        </Link>
      </div>
    </div>
  );
}

export default Home;
