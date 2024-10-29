import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <img src="/logo192.png" alt="ShareRING logo" className="logo" />
      <nav>
        <Link to="/weather" className="nav-icon">🌤️</Link>
        <Link to="/notifications" className="nav-icon">🔔</Link>
        <Link to="/mypage" className="nav-icon">👤</Link>
      </nav>
    </header>
  );
}

export default Header;
