import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Projects.css'
import './Routes.css';
import Papa from 'papaparse';
import defaultFile from './hw_200.csv';
const initSqlJs = require('sql.js');

const Projects = () => {

 // State variables to handle text box inputs
 const inital_State = 'Select * From CSV_File;';

 const [selectedRowCount1, setSelectedRowCount1] = useState(10);
 const [selectedRowCount2, setSelectedRowCount2] = useState(10);

 const [systemContent, setSystemContent] = useState('');
 const [userQuery, setUserQuery] = useState('');
 
 let [SqlQuery, setSqlQuery] = useState(inital_State);

 const [tableData1, setTableData1] = useState([]);
 const [SqlQueryResultHeader, setSqlQueryResultHeader] = useState([]);
 const [SqlQueryResultData, setSqlQueryResultData] = useState([]);

 const [db, setDb] = useState(null);


 const [OpenAIQuery, setOpenAIQuery] = useState("");
 const [OpenAIModel, setOpenAIModel] = useState("davinci");
 const [openAI_Response, setOpenAI_Response] = useState("");

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

 const Generate_SQL_Query = async () => {
   try {
    const response = await openAI_API_Call("gpt-3.5-turbo",  systemContent, userQuery)

     console.log('Full Response Data:', response.data);
     const sanitizedData = response.data
       .replace(/[^\x20-\x7E\n]/g, '-') // Replace non-printable characters except \n with '-'
       .replace(/(["'\\])/g, '\\$1'); // Escape quotes and backslashes
      
     setSqlQuery(sanitizedData);
     SqlQuery = sanitizedData;
     Generate_SQL_Queried_Table();
   } catch (error) {
     console.error('Error occurred:', error);
     setSqlQuery('Error occurred while making the request:' + error);
   }
 };

 const General_Query = async () => {
  try {
    
    const response = await openAI_API_Call(OpenAIModel,  "", OpenAIQuery)
    console.log('Full Response Data:', response);

    const sanitizedData = response.data
      .replace(/[^\x20-\x7E\n]/g, '-') // Replace non-printable characters except \n with '-'
      .replace(/(["'\\])/g, '\\$1'); // Escape quotes and backslashes
     
      setOpenAI_Response(sanitizedData);
  } catch (error) {
    console.error('Error occurred:', error);
    setOpenAI_Response('Error occurred while making the request.');
  }
};

 async function openAI_API_Call(Model, System_content, User_query){
  const apiEndpoint = 'https://vh8bz4x2e6.execute-api.us-east-1.amazonaws.com/test/dynamodbmanager';
     const requestBody = {
       operation: 'gpt_query',
       payload: {
         model: Model,
         system_content: System_content,
         user_query: User_query,
       },
     };
     const response = await axios.post(apiEndpoint, requestBody);
     return response;
     //console.log(systemContent);
 }
 const handleFileUpload = (e) => {
  Parse_CSV_File(e.target.files[0]);
 };

 const Use_Default_File = () => {
  console.log(defaultFile);
  fetch(defaultFile)
  .then((response) => response.blob()) // Fetch the file as a blob
  .then((blob) => {
    // Create a File object with a name (optional)
    const defaultCsvFile = new File([blob], 'default_File.csv', { type: 'text/csv' });
    console.log(defaultCsvFile);
    // Pass the File object to the Parse_CSV_File function
    Parse_CSV_File(defaultCsvFile);
    return blob.text();
  }).then((textData) => {
    // Now you have the string data from the Blob
    console.log(textData);

    // If you want to pass this data to a function, do it here
    // Parse_CSV_File(textData);
  })
  .catch((error) => {
    console.error('Error fetching default file:', error);
  });
 };

 function Parse_CSV_File(file){
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
           setTableData1(result.data);
           if (result.data.length > 0) {
            // generate system_content part of Open_AI API Query
            const header = Object.keys(result.data[0])
            .map((key) => {
              // Sanitize each column name by replacing special characters with underscores
              const sanitizedKey = key === 'index' ? '"index"' : key.replace(/[^a-zA-Z0-9_,]/g, ' ').trim().replace(" ", "_");
              return `"${sanitizedKey}"`;
            })
            .join(', ');
            const firstRow = Object.values(result.data[0])
              .map((value) => `${value}`)
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
            //console.log([db.exec("SELECT * FROM csv_data_original"),"table"]);
            Generate_SQL_Queried_Table();
          }
         },
       });
      };
     reader.readAsText(file);
     setSqlQuery(inital_State);
   }
 }

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
  //console.log(SqlQuery);
  try {
    const dropTableSQL = `DROP TABLE IF EXISTS CSV_File`;
    const copyTableSQL = `CREATE TABLE IF NOT EXISTS CSV_File AS SELECT * FROM csv_data_original`;
    db.run(dropTableSQL);
    db.run(copyTableSQL);
    const result = db.exec(SqlQuery);
    //console.log(result);
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
 
const rowCounts = [
  { label: '10', value: 10 },
  { label: '100', value: 100 },
  { label: '1000', value: 1000 },
  { label: '10000', value: 10000 },
];

const models = [
{ label: 'davinci',                        value: 'davinci' },
{ label: 'gpt-3.5-turbo-16k-0613',         value: 'gpt-3.5-turbo-16k-0613' },
{ label: 'text-davinci-001',               value: 'text-davinci-001' },
{ label: 'text-search-curie-query-001',    value: 'text-search-curie-query-001' },
{ label: 'gpt-3.5-turbo',                  value: 'gpt-3.5-turbo' },
{ label: 'babbage',                        value: 'babbage' },
{ label: 'text-babbage-001',               value: 'text-babbage-001' },
{ label: 'gpt-3.5-turbo-16k',              value: 'gpt-3.5-turbo-16k' },
{ label: 'curie-instruct-beta',            value: 'curie-instruct-beta' },
{ label: 'davinci-similarity',             value: 'davinci-similarity' },
{ label: 'code-davinci-edit-001',          value: 'code-davinci-edit-001' },
{ label: 'text-similarity-curie-001',      value: 'text-similarity-curie-001' },
{ label: 'ada-code-search-text',           value: 'ada-code-search-text' },
{ label: 'gpt-3.5-turbo-0613',             value: 'gpt-3.5-turbo-0613' },
{ label: 'text-search-ada-query-001',      value: 'text-search-ada-query-001' },
{ label: 'babbage-search-query',           value: 'babbage-search-query' },
{ label: 'ada-similarity',                 value: 'ada-similarity' },
{ label: 'text-curie-001',                 value: 'text-curie-001' },
{ label: 'text-search-ada-doc-001',        value: 'text-search-ada-doc-001' },
{ label: 'text-search-babbage-query-001',  value: 'text-search-babbage-query-001' },
{ label: 'code-search-ada-code-001',       value: 'code-search-ada-code-001' },
{ label: 'curie-search-document',          value: 'curie-search-document' },
{ label: 'davinci-002',                    value: 'davinci-002' },
{ label: 'text-search-davinci-query-001',  value: 'text-search-davinci-query-001' },
{ label: 'text-search-curie-doc-001',      value: 'text-search-curie-doc-001' },
{ label: 'babbage-search-document',        value: 'babbage-search-document' },
{ label: 'babbage-002',                    value: 'babbage-002' },
{ label: 'babbage-code-search-text',       value: 'babbage-code-search-text' },
{ label: 'text-embedding-ada-002',         value: 'text-embedding-ada-002' },
{ label: 'davinci-instruct-beta',          value: 'davinci-instruct-beta' },
{ label: 'davinci-search-query',           value: 'davinci-search-query' },
{ label: 'text-similarity-babbage-001',    value: 'text-similarity-babbage-001' },
{ label: 'text-davinci-002',               value: 'text-davinci-002' },
{ label: 'code-search-babbage-text-001',   value: 'code-search-babbage-text-001' },
{ label: 'text-davinci-003',               value: 'text-davinci-003' },
{ label: 'text-search-davinci-doc-001',    value: 'text-search-davinci-doc-001' },
{ label: 'code-search-ada-text-001',       value: 'code-search-ada-text-001' },
{ label: 'ada-search-query',               value: 'ada-search-query' },
{ label: 'text-similarity-ada-001',        value: 'text-similarity-ada-001' },
{ label: 'ada-code-search-code',           value: 'ada-code-search-code' },
{ label: 'whisper-1',                      value: 'whisper-1' },
{ label: 'text-davinci-edit-001',          value: 'text-davinci-edit-001' },
{ label: 'davinci-search-document',        value: 'davinci-search-document' },
{ label: 'curie-search-query',             value: 'curie-search-query' },
{ label: 'babbage-similarity',             value: 'babbage-similarity' },
{ label: 'ada',                            value: 'ada' },
{ label: 'ada-search-document',            value: 'ada-search-document' },
{ label: 'text-ada-001',                   value: 'text-ada-001' },
{ label: 'text-similarity-davinci-001',    value: 'text-similarity-davinci-001' },
{ label: 'curie-similarity',               value: 'curie-similarity' },
{ label: 'babbage-code-search-code',       value: 'babbage-code-search-code' },
{ label: 'code-search-babbage-code-001',   value: 'code-search-babbage-code-001' },
{ label: 'text-search-babbage-doc-001',    value: 'text-search-babbage-doc-001' },
{ label: 'gpt-3.5-turbo-0301',             value: 'gpt-3.5-turbo-0301' },
{ label: 'curie',                          value: 'curie' },
];

 function GenericDropdownSelector({ options, selectedOption, onSelectOption, text}) {
  const handleOptionChange = (event) => {
    const selectedValue = event.target.value;
    onSelectOption(selectedValue);
  };

  return (
    <div className='Drop_Down'>
      <label>{text}</label>
      <select value={selectedOption} onChange={handleOptionChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

 return (
   <main>
     <article>
       <header className="route-header">
         <h1 className="introduction">Projects</h1>
       </header>
       <div className="route-content">

         <h2 className="Title">CSV SQL Query Generator:</h2>

         <input type="file" accept=".csv" onChange={handleFileUpload}/>
         <button className='Default-File-button' onClick={Use_Default_File}>Use Default File</button>
         <GenericDropdownSelector options={rowCounts} selectedOption={selectedRowCount1} onSelectOption={setSelectedRowCount1} text="Max Rows:"/>
         
         <div id="csv-table-container">
           <table className="csv-table">
             <thead>
               <tr>
                 {tableData1[0] &&
                   Object.keys(tableData1[0]).map((header) => (
                     <th key={header}>{header}</th>
                   ))}
               </tr>
             </thead>
             <tbody>
               {tableData1.slice(0,selectedRowCount1).map((row, rowIndex) => (
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
          <button className='generate-query-button' onClick={Generate_SQL_Query}>Generate Query</button>
         </div>

         <textarea className='csv-query-query' name="myTextArea" id="myTextArea" type="text" value={SqlQuery} onChange={(e) => setSqlQuery(e.target.value)}></textarea>
        
         <div>
          <button className='run-query-button' onClick={ Generate_SQL_Queried_Table}>Run Query</button>
         </div>
         <GenericDropdownSelector options={rowCounts} selectedOption={selectedRowCount2} onSelectOption={setSelectedRowCount2} text="Max Rows:"/>
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
              {SqlQueryResultData.slice(0,selectedRowCount2).map((row, rowIndex) => (
                <tr key={rowIndex} className="csv-table-row">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="csv-table-cell">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <br></br>
        <br></br>

        <h2 className="Title">OpenAI Model Comparison:</h2>
      
        <GenericDropdownSelector options={models} selectedOption={OpenAIModel} onSelectOption={setOpenAIModel} text="Model:"/>
        <textarea className='openAI-query' name="myTextArea" id="myTextArea" type="text" value={OpenAIQuery} onChange={(e) => setOpenAIQuery(e.target.value)}></textarea>
        <div>
          <button className='run-query-button' onClick={General_Query}>Run Query</button>
         </div>

        <div><b>Response:</b> {openAI_Response}</div>
       </div>
     </article>
   </main>
 );
};

export default Projects;