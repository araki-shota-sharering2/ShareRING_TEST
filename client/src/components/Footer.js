import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="footer-icon">🏠</Link>
      <Link to="/history" className="footer-icon">🔄</Link>
      <Link to="/map" className="footer-icon">📍</Link>
      <Link to="/discover" className="footer-icon">⚗️</Link>
      <Link to="/achievements" className="footer-icon">🏆</Link>
    </footer>
  );
}

export default Footer;
