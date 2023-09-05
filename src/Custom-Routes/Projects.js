import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Projects.css'
import './Routes.css';
import Papa from 'papaparse';
const initSqlJs = require('sql.js');


const Projects = () => {

 // State variables to handle text box inputs
 const inital_State = 'Select * From CSV_File;';
 const [systemContent, setSystemContent] = useState('');
 const [userQuery, setUserQuery] = useState('');
 const [tableData, setTableData] = useState([]);
 let [SqlQuery, setSqlQuery] = useState(inital_State);
 const [SqlQueryResultHeader, setSqlQueryResultHeader] = useState([]);
 const [SqlQueryResultData, setSqlQueryResultData] = useState([]);
 const [db, setDb] = useState(null);

 useEffect(() => {
   // Initialize the database when the component mounts
   const initDatabase = async () => {
     const SQL = await initSqlJs({
       locateFile: (file) => `https://sql.js.org/dist/${file}`,
     });
     const newDb = new SQL.Database();
     setDb(newDb);
   };

   initDatabase();
 }, []);

 // Function to handle button click
 const handleButtonClick = async () => {
   // Add your desired logic here when the button is clicked
   try {
     const apiEndpoint = 'https://vh8bz4x2e6.execute-api.us-east-1.amazonaws.com/test/dynamodbmanager';
     const requestBody = {
       operation: 'gpt_query',
       payload: {
         model: "gpt-3.5-turbo",
         system_content: systemContent,
         user_query: userQuery,
       },
     };
     console.log(systemContent);

     const response = await axios.post(apiEndpoint, requestBody);
     console.log('Full Response Data:', response.data);
     // Assuming the response contains the 'generatedQuery' field you want to display
     //const stringifiedData = JSON.stringify(response.data, null, 2);
     const sanitizedData = response.data
       .replace(/[^\x20-\x7E\n]/g, '-') // Replace non-printable characters except \n with '-'
       .replace(/(["'\\])/g, '\\$1'); // Escape quotes and backslashes
      
     setSqlQuery(sanitizedData);
     SqlQuery = sanitizedData;
     Generate_SQL_Queried_Table();
   } catch (error) {
     console.error('Error occurred:', error);
     setSqlQuery('Error occurred while making the request.');
   }
 };

 const handleFileUpload = (e) => {
   const file = e.target.files[0];
   if (file) {
     const reader = new FileReader();
     reader.onload = (event) => {
       const csvData = event.target.result;
      
       // Get file data
       Papa.parse(csvData, {
         header: true,
         skipEmptyLines: true,
         dynamicTyping: true,
         complete: (result) => {
           setTableData(result.data);
           if (result.data.length > 0) {
            // generate system_content part of Open_AI API Query
            const header = Object.keys(result.data[0]).join(', ').replace(/ /g, '_');
            const firstRow = Object.values(result.data[0])
              .map((value) => `"${value}"`)
              .join(', ');
            
            const systemContentString = `You are a SQL query generator for a CSV file that is converted to a database named CSV_File. Only generate the query and nothing else. The header of the CSV file is "${header}" and the first row is "${firstRow}".`;
            setSystemContent(systemContentString);

            // Setup database based on file data
            const values = result.data.map((row) =>
            Object.values(row).map((value) =>
              typeof value === 'string' ? `'${value}'` : value
              )
            );
            //console.log([header, firstRow, values, Generate_Insert_SQL(values)]);
            db.run(`DROP TABLE IF EXISTS csv_data_original`);
            db.run(`CREATE TABLE csv_data_original (${header})`);
            db.run( Generate_Insert_SQL(values));
            console.log([db.exec("SELECT * FROM csv_data_original"),"table"]);
            Generate_SQL_Queried_Table();
          }
         },
       });
      };
     reader.readAsText(file);
     setSqlQuery(inital_State);
   }
 };

 function Generate_Insert_SQL(values){
  var String_total = "INSERT INTO csv_data_original VALUES";
  for (let row = 0; row < values.length; row++) {
    String_total += " (";
    for (let col = 0; col < values[row].length - 1; col++) {
      var value = values[row][col] + "";
      if (value != null){
        value = value.replace(/(?<=.)'(?=.)/g,  '"');
      }
      String_total += value + ", ";
    }
    value = values[row][values[row].length-1] + "";
      if (value != null){
        value = value.replace(/(?<=.)'(?=.)/g,  '"');
      }
    String_total += value + "),\n";
  }
  return String_total.slice(0, -2) + ";";
 }

 function Generate_SQL_Queried_Table(){
  console.log(SqlQuery);
  try {
    const dropTableSQL = `DROP TABLE IF EXISTS CSV_File`;
    const copyTableSQL = `CREATE TABLE IF NOT EXISTS CSV_File AS SELECT * FROM csv_data_original`;
    db.run(dropTableSQL);
    db.run(copyTableSQL);
    const result = db.exec(SqlQuery);
    console.log(result);
    if (result && result.length > 0) {
      setSqlQueryResultHeader(result[0].columns);
      setSqlQueryResultData(result[0].values);
    } else {
      //'No results found.'
    }
  } catch (error) {
    console.error('Error occurred:', error);
    //'Error occurred while executing the query.'
  }
 }
 

 return (
   <main>
     <article>
       <header className="route-header">
         <h1 className="introduction">Projects</h1>
       </header>
       <div className="route-content">

         <h2 className="Title">CSV SQL Query Generator:</h2>

         <input
           type="file"
           accept=".csv"
           onChange={handleFileUpload}
         />

         <div id="csv-table-container">
           <table className="csv-table">
             <thead>
               <tr>
                 {tableData[0] &&
                   Object.keys(tableData[0]).map((header) => (
                     <th key={header}>{header}</th>
                   ))}
               </tr>
             </thead>
             <tbody>
               {tableData.map((row, rowIndex) => (
                 <tr key={rowIndex} className="csv-table-row">
                   {Object.values(row).map((cell, cellIndex) => (
                     <td key={cellIndex} className="csv-table-cell">
                       {cell}
                     </td>
                   ))}
                 </tr>
               ))}
             </tbody>
           </table>
         </div>

         <br></br>

         <div>
           <textarea
             className='csv-gpt-prompt'
             type="text"
             value={userQuery}
             onChange={(e) => setUserQuery(e.target.value)}
             placeholder="What do you want to know from the CSV?"
           />
         </div>

         <div>
          <button className='generate-query-button' onClick={handleButtonClick}>Generate</button>
         </div>

         <textarea className='csv-query-query' name="myTextArea" id="myTextArea" type="text" value={SqlQuery} onChange={(e) => setSqlQuery(e.target.value)}>
         </textarea>
        
         <div>
          <button className='run-query-button' onClick={ Generate_SQL_Queried_Table}>Run Query</button>
         </div>

         <div id="csv-table-container">
           <table className="csv-table">
            <thead>
              <tr>
                {SqlQueryResultHeader.map((column, columnIndex) => (
                  <th key={columnIndex}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SqlQueryResultData.map((row, rowIndex) => (
                <tr key={rowIndex} className="csv-table-row">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="csv-table-cell">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       </div>
     </article>
   </main>
 );
};

export default Projects;