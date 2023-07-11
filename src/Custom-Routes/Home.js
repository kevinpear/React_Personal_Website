import React from 'react';
import face from './Kevin_face.png'; // Import your logo image
import './Routes.css';

const Home = () => {
  return (
    <main>
        <article>
          <header class="route-header">
            <img src={face} alt="face" className="face" align="right" /> 
            <h1 className="introduction">Hello I am Kevin</h1>
          </header>
          <div class="route-content">
            <p>This is my website where I will implement some projects for fun and to show off</p>
            <p>Right now the projects will mostly be AI focused</p>
            <p>One will be a prompt engineering project and another will be a transformer I trained</p>
          </div>
        </article>
    </main>
  );
};

export default Home;
