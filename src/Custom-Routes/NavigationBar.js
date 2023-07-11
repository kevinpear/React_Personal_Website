import React from 'react';
import { Link } from 'react-router-dom';
import logo from './cute_pear.png'; // Import your logo image
import './NavigationBar.css';

const NavigationBar = () => {
  return (
    <header className="navbar">
      <nav className="navbar-container">
        <img src={logo} alt="Logo" className="logo" /> 
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/projects">Projects</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default NavigationBar;

