import React from 'react';
import './Routes.css';
import './About.css';

const About = () => {
  return (
    <main>
        <article>
          <header class="route-header">
            <h1 className="introduction">About</h1>
          </header>
          <div class="route-content">
            <h2 className="Title">Website Information:</h2>
            <p> 
              This is a react website hosted on AWS Amplify. 
              The hosting setup was created by following a <a href="https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/">AWS guide</a>.
              Everything else was built from scratch. You can see the source code at <a href="https://github.com/kevinpear/React_Personal_Website">Github</a>.               
            </p>
            <p>
            The logo features a pear because, as a child, I mistakenly thought that my last name in Chinese, "Li" or "李," translated to "Pear". 
              (The correct translation is "Plum"; "Pear" is "梨"). 
              This led me to create multiple online profiles with pear-themed usernames. 
              After years of use, I grew fond of the theme and decided to keep it.
            </p>
            <h2 className="Title">Contact Information:</h2>
            <p>Email: kli295@wisc.edu</p>
            <p>Phone: 573-808-4918</p>
            <p><a href="http://www.linkedin.com/in/kevin-li-5698a9221">Linkedin</a></p>
          </div>
        </article>
    </main>
  );
};

export default About;
