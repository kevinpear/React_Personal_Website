import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './Custom-Routes/NavigationBar';
import Home from './Custom-Routes/Home';
import Projects from './Custom-Routes/Projects';
import About from './Custom-Routes/About';
import './App.css'; // Import the CSS file

const App = () => {
  return (
    <Router>
      <NavigationBar />
      <div className="content-container">
        <div className="bounded-box">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
