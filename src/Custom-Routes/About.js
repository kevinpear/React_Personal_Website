import React from 'react';

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
            <h2 className="Title">Contact Information:</h2>
            <p>Email: kli295@wisc.edu</p>
            <p>Phone: 573-808-4918</p>
            <p><a href="http://www.linkedin.com/in/kevin-li-5698a9221">linkedin</a></p>
          </div>
        </article>
    </main>
  );
};

export default About;
