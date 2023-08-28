import React, { useState } from 'react';
import axios from 'axios';
import './Projects.css'
import './Routes.css';
import Chart from 'chart.js';
import csvParser from 'csv-parser';

const Projects = () => {
  // State variables to handle text box inputs
  const [textbox1Value, setTextbox1Value] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [uploadedCSVData, setUploadedCSVData] = useState('');


  // Function to handle button click
  const handleButtonClick = async () => {
    // Add your desired logic here when the button is clicked
    try {
      const apiEndpoint = 'https://vh8bz4x2e6.execute-api.us-east-1.amazonaws.com/test/dynamodbmanager';
      const requestBody = {
        operation: 'gpt_query',
        payload: {
          system_content: "Given the following SQL tables, your job is to write queries given a user’s request.\n\nCREATE TABLE Orders (\n  OrderID int,\n  CustomerID int,\n  OrderDate datetime,\n  OrderTime varchar(8),\n  PRIMARY KEY (OrderID)\n);\n\nCREATE TABLE OrderDetails (\n  OrderDetailID int,\n  OrderID int,\n  ProductID int,\n  Quantity int,\n  PRIMARY KEY (OrderDetailID)\n);\n\nCREATE TABLE Products (\n  ProductID int,\n  ProductName varchar(50),\n  Category varchar(50),\n  UnitPrice decimal(10, 2),\n  Stock int,\n  PRIMARY KEY (ProductID)\n);\n\nCREATE TABLE Customers (\n  CustomerID int,\n  FirstName varchar(50),\n  LastName varchar(50),\n  Email varchar(100),\n  Phone varchar(20),\n  PRIMARY KEY (CustomerID)\n);",
          user_query: "Write a SQL query which computes the average total order value for all orders on 2023-04-01.",
        },
      };

      const response = await axios.post(apiEndpoint, requestBody);
      console.log('Full Response Data:', response.data);
      // Assuming the response contains the 'generatedQuery' field you want to display
      //const stringifiedData = JSON.stringify(response.data, null, 2);
      const sanitizedData = response.data
        .replace(/[^\x20-\x7E\n]/g, '-') // Replace non-printable characters except \n with '-'
        .replace(/(["'\\])/g, '\\$1'); // Escape quotes and backslashes
        
      setGeneratedQuery(sanitizedData);
    } catch (error) {
      console.error('Error occurred:', error);
      setGeneratedQuery('Error occurred while making the request.');
    }
    //setGeneratedQuery("");
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        setUploadedCSVData(csvData);
        // Perform processing with csvData (e.g., send it to your API)
      };
      reader.readAsText(file);
    }
  };
  

  return (
    <main>
      <article>
        <header className="route-header">
          <h1 className="introduction">Projects</h1>
        </header>
        <div className="route-content">
          <h2 className="Title">CSV Query Generator:</h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
          {uploadedCSVData && (
            <div>
              <h3>Uploaded CSV Data:</h3>
              <textarea
                rows="10"
                cols="50"
                value={uploadedCSVData}
                readOnly
              />
            </div>
            )
          }

          <button className='generate-query-button' onClick={handleButtonClick}>Generate</button>
          <div>
            <textarea
              className='csv-query-query'
              type="text"
              value={textbox1Value}
              onChange={(e) => setTextbox1Value(e.target.value)}
              placeholder="What do you want to know from the CSV?"
            />
          </div>
          <p className='generated-query'>
          <strong>Generated Query: </strong>{generatedQuery}
          </p>
        </div>
      </article>
    </main>
  );
};

export default Projects;

