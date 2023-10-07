import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaDownload, FaSave } from 'react-icons/fa';
import { IoReload, IoClose } from 'react-icons/io5';
import { FiEye } from 'react-icons/fi';
import { AiOutlineFile } from 'react-icons/ai';
import defaultCodes from './utils/defaultCodes';
import Editor from '@monaco-editor/react';
import { saveAs } from 'file-saver';

function App() {
  const editorRef = useRef(null); // Ref for the editor
  const inputRef = useRef(null); // Ref for the input textarea
  const [fontSize, setFontSize] = useState(20); // Initialize with default font size
  const [selectedTheme, setSelectedTheme] = useState('vs-dark'); // Initialize with the default theme
  const [selectedLanguage, setSelectedLanguage] = useState('cpp'); // Initialize with the default language
  const [loading, setLoading] = useState(false); // Initialize with loading set to false
  const [output, setOutput] = useState(''); // Initialize with empty output
  const [codeName, setCodeName] = useState('code'); // Initialize with empty code name
  const [isModalOpen, setIsModalOpen] = useState(false); // Initialize with modal closed
  const [isCodeExistsModalOpen, setIsCodeExistsModalOpen] = useState(false); // Initialize with modal closed
  const [isViewCodeModalOpen, setIsViewCodeModalOpen] = useState(false); // Initialize with modal closed
  const [savedCodes, setSavedCodes] = useState({}); // Initialize with empty object

  useEffect(() => {
    // Get all saved codes from localStorage
    const savedCodesJSON = localStorage.getItem('savedCodes');
    const savedCodes = savedCodesJSON ? JSON.parse(savedCodesJSON) : {};

    // Set the saved codes state if there are any saved codes
    if (Object.keys(savedCodes).length > 0) {
      setSavedCodes(savedCodes);
    }
  }, []);

  // const handleOpenModal = () => {
  //   // Open the modal when the save button is clicked
  //   setIsModalOpen(true);
  // };

  const closeModal = () => {
    // Close the modal
    setIsModalOpen(false);
  };

  // Use the default code snippet based on the selected language
  const defaultCode = defaultCodes[selectedLanguage] || '';

  // Set the language of the editor and default code snippet when the selected language changes
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    editorRef.current.setValue(defaultCode);
  }

  // // Get the value of the editor
  // function showValue() {
  //   alert(editorRef.current.getValue());
  // }

  // Handle font size change
  const handleFontSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setFontSize(newSize);
  };

  // Generate font size options from 6 to 64 at a gap of 2
  const fontSizeOptions = Array.from({ length: 30 }, (_, i) => 6 + i * 2);

  // Theme options
  const themeOptions = [
    { label: 'Dark', value: 'vs-dark' },
    { label: 'Light', value: 'vs-light' },
    { label: 'HC Black', value: 'hc-black' }, // Added High-Contrast Black theme
  ];

  // Language options
  const languageOptions = [
    { label: 'C', value: 'c' },
    { label: 'C++', value: 'cpp' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'JavaScript', value: 'javascript' },
  ];

  // Handle theme change
  const handleThemeChange = (event) => {
    setSelectedTheme(event.target.value);
  };

  // Handle language change
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);

    // Update the editor value with the default code for the new language
    editorRef.current.setValue(defaultCodes[newLanguage]);
    
    // Update the editor language
    if (editorRef.current) {
      editorRef.current.getModel().setLanguage(newLanguage);
    }
  };

  // Handle reset code button click
  const handleResetCode = () => {
    // Update the editor value with the default code for the selected language
    editorRef.current.setValue(defaultCodes[selectedLanguage]);
  }

  // Handle download code button click
  const handleDownloadCode = () => {
    // Get the code from the editor
    const code = editorRef.current.getValue();
  
    // Create a Blob object containing the code
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });

    // Get the extension of the selected language
    const extension = getExtension();

    // File Name 
    const fileName = codeName + "." + extension;
    
    // Download the file
    saveAs(blob, fileName);
  };
  
  // Get Extension of the selected language
  const getExtension = () => {
    if(selectedLanguage === 'javascript') {
      return 'js';
    } else if(selectedLanguage === 'c') {
      return 'c';
    } else if(selectedLanguage === 'cpp') {
      return 'cpp';
    } else if(selectedLanguage === 'python') {
      return 'py';
    } else if(selectedLanguage === 'java') {
      return 'java';
    }

    return 'txt';
  }

  // Handle run button click
  const handleRunClick = async () => {
    // Set loading to true when the request is initiated
    setLoading(true);

    // If selected language is Javascript, run the code in the browser
    if (selectedLanguage === 'javascript') {
      // Get the input from the input textarea
      const INPUT = inputRef.current.value;

      // Get the code from the editor and store it in a variable
      const code = editorRef.current.getValue();

      // Create a function that accepts input and executes the code
      const executeCode = new Function('INPUT', code);

      try {
        // Store the original console.log function
        const originalConsoleLog = console.log;

        // Create an array to capture log messages
        const logMessages = [];

        // Override console.log to capture messages
        console.log = function (...args) {
          // Call the original console.log to display the message in the console
          originalConsoleLog.apply(console, args);

          // Store the message in the logMessages array 
          logMessages.push(args.join(' '));
        };

        // Run the code with the input
        executeCode(INPUT);

        // Get the captured log messages
        const result = logMessages.join('\n');

        // Restore the original console.log function
        console.log = originalConsoleLog;

        // Update the output state with the received result
        setOutput(result);

        // After receiving the response, set loading back to false
        setLoading(false);
      } catch (error) {
        // Handle any errors that occur during code execution
        console.error('Code Execution Error:', error);
        // Set loading to false in case of an error
        setLoading(false);
      }

      return;
    }

  
    try {
      // Make the API request here
      const response = await fetch('http://localhost:3001/api/v1/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: editorRef.current.getValue(),
          language: selectedLanguage,
          input: inputRef.current.value, 
        }),
      });
  
      // Handle the response here
      if (response.ok) {
        const data = await response.json();
        console.log(data);

        // Update the output state with the received result
        setOutput(data.result);
  
        // After receiving the response, set loading back to false
        setLoading(false);
      } else {
        // Handle error responses here
        console.error('API Error:', response.statusText);
        // Set loading to false even in case of an error
        setLoading(false);
      }
    } catch (error) {
      // Handle any other errors that occur during the request
      console.error('Request Error:', error);
      // Set loading to false in case of an error
      setLoading(false);
    }
  };

  // Handle code name change
  const handleCodeNameChange = (event) => {
    if(event.target.value === '') {
      setCodeName('code');
      return;
    }

    setCodeName(event.target.value);
  }

  // Handle download output button click
  const handleDownloadOutput = () => {
    // Create a Blob object containing the output
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
  
    // Download the file
    saveAs(blob, 'output.txt');
  };

  // Handle download input button click
  const handleDownloadInput = () => {
    // Create a Blob object containing the input
    const blob = new Blob([inputRef.current.value], { type: 'text/plain;charset=utf-8' });

    // Download the file
    saveAs(blob, 'input.txt');
  };

  // Handle read from file button click
  const readFromFile = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      // Create a FileReader instance
      const reader = new FileReader();

      // Define an event handler for when the file is loaded
      reader.onload = (e) => {
        const content = e.target.result;
        inputRef.current.value = content;
      };

      // // Read the file as text
      reader.readAsText(selectedFile);
    }
  };

  // Handle save code locally button click
  const handleSaveCodeLocally = () => {
    // Check if the editorRef is null
    if (!editorRef.current) {
      console.error('Editor is not initialized.');
      return;
    }

    // Get the code from the editor
    const code = editorRef.current.getValue();

    // Get the extension of the selected language
    const extension = getExtension();

    // File Name
    const fileName = codeName + "." + extension;

    // Check if there are existing saved codes in localStorage
    const savedCodesJSON = localStorage.getItem('savedCodes');
    let savedCodes = savedCodesJSON ? JSON.parse(savedCodesJSON) : {};

    // Check if the code already exists
    if (savedCodes[fileName]) {
      // If code already exists, show the modal
      setIsCodeExistsModalOpen(true);
    } else {
      // Update the saved codes object with the new code
      savedCodes[fileName] = { code, language: selectedLanguage };

      // Convert the updated object back to JSON and store it in localStorage
      localStorage.setItem('savedCodes', JSON.stringify(savedCodes));

      // Show the "Code saved successfully" modal
      setIsModalOpen(true);

      // Print all saved codes
      getAllSavedCodes();
    }
  };

  const getAllSavedCodes = () => {
    // Get the saved codes from localStorage
    const savedCodesJSON = localStorage.getItem('savedCodes');
    const savedCodes = savedCodesJSON ? JSON.parse(savedCodesJSON) : {};

    console.log('====================================');
    console.log('Saved Codes');
    console.log('====================================');
  
    // Iterate through the saved codes and display them
    for (const fileName in savedCodes) {
      if (savedCodes.hasOwnProperty(fileName)) {
        const { code, language } = savedCodes[fileName];
  
        // Display or process each saved code entry as needed
        console.log(`File Name: ${fileName}`);
        console.log(`Language: ${language}`);
        console.log(`Code:\n${code}`);
      }
    }
  };

  // Handle close view codes button click
  const onCloseViewCode = () => {
    setIsViewCodeModalOpen(false);
  }

  // Handle view codes button click
  const onOpenViewCode = () => {
    setIsViewCodeModalOpen(true);
  }

  // Handle replace code
  const handleReplaceCode = () => {
    // Close the modal
    setIsCodeExistsModalOpen(false);

    // Get the code from the editor
    const code = editorRef.current.getValue();

    // Get the extension of the selected language
    const extension = getExtension();

    // File Name
    const fileName = codeName + "." + extension;

    // Get existing saved codes in localStorage
    const savedCodesJSON = localStorage.getItem('savedCodes');
    let savedCodes = savedCodesJSON ? JSON.parse(savedCodesJSON) : {};

    // Update the saved codes object with the new code
    savedCodes[fileName] = { code, language: selectedLanguage };

    // Convert the updated object back to JSON and store it in localStorage
    localStorage.setItem('savedCodes', JSON.stringify(savedCodes));

    // Show the "Code saved successfully" modal
    setIsModalOpen(true);
  }

  const handleViewCode = (codeName) => {
    // Get the saved codes from localStorage
    const savedCodesJSON = localStorage.getItem('savedCodes');
    const savedCodes = savedCodesJSON ? JSON.parse(savedCodesJSON) : {};

    // Get the code from the saved codes object
    const { code } = savedCodes[codeName];

    // Update the editor value with the code
    editorRef.current.setValue(code);

    // Close the modal
    setIsViewCodeModalOpen(false);

    // Update the code name and replace the extension with empty string
    setCodeName(codeName.replace(/\.[^/.]+$/, ""));

    // Update the selected language
    setSelectedLanguage(savedCodes[codeName].language);

    // Update the editor language
    if (editorRef.current) {
      editorRef.current.getModel().setLanguage(savedCodes[codeName].language);
    }
  }

  const handleDeleteCode = (codeName) => {
    // Get the saved codes from localStorage
    const savedCodesJSON = localStorage.getItem('savedCodes');
    let savedCodes = savedCodesJSON ? JSON.parse(savedCodesJSON) : {};

    // Delete the code from the saved codes object
    delete savedCodes[codeName];

    // Convert the updated object back to JSON and store it in localStorage
    localStorage.setItem('savedCodes', JSON.stringify(savedCodes));
  
    // Update the editor value with the default code for the selected language
    editorRef.current.setValue(defaultCodes[selectedLanguage]);

    // Update the code name
    setCodeName('code');
    
  }
  
  return (
    <>
      <main className='bg-[#1e1e1e]'>
      {loading ? (
        <div className="absolute inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : null}
        <nav className='h-[6vh] w-full flex justify-between items-center bg-[#1e1e1e] py-[2vh]'>
          <div className='flex items-center'>
            <button className='bg-[#e31d3b] h-[4vh] text-white px-3 rounded-3xl ml-5 flex justify-center items-center gap-1 text-[11px] font-bold uppercase' onClick={handleRunClick}>
              <FaPlay className='h-[9px]' /> Run
            </button>

            {/* Dropdown for selecting text size */}
            <label className='text-white ml-10 text-sm font-bold'>Font Size: </label>
            <select
              className='bg-white text-gray-900 ml-3 rounded-md p-1 outline-none'
              value={fontSize}
              onChange={handleFontSizeChange}
            >
              {fontSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            {/* Dropdown for selecting theme */}
            <label className='text-white ml-5 text-sm font-bold'>Theme: </label>
            <select
              className='bg-white text-gray-900 ml-3 rounded-md p-1 w-20 outline-none'
              value={selectedTheme}
              onChange={handleThemeChange}
            >
              {themeOptions.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>

            {/* Dropdown for selecting programming language */}
            <label className='text-white ml-5 text-sm font-bold'>Language: </label>
            <select
              className='bg-white text-gray-900 ml-3 rounded-md p-1 w-24 outline-none'
              value={selectedLanguage}
              onChange={handleLanguageChange}
            >
              {languageOptions.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>

            <input type="text" className='ml-56 w-44 px-2 py-[3px] text-sm bg-[#1e1e1e] border-b border-white text-white focus:outline-none' value={codeName} onChange={(e) => setCodeName(e.target.value)} onBlur={handleCodeNameChange} />

          </div>

          <div className='flex items-center mr-5'>
            {/* Reset Code Button */}
            <button className='bg-[#e31d3b] h-[4vh] text-white px-3 rounded-3xl ml-5 flex justify-center items-center gap-1 text-[11px] font-bold uppercase' onClick={handleResetCode}>
              <IoReload/> Reset Code
            </button>

            {/* Already Exists Modal */}
            {isCodeExistsModalOpen && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
                <div className="bg-gray-800 p-4 py-6 px-8 rounded-lg shadow-lg">
                  <h2 className="text-white text-xl font-semibold mb-2">WARNING ⚠️</h2>
                  <p className="text-white">This code already Exists!</p>
                  <button className="bg-[#e31d3b] text-white px-3 py-1 rounded-md mt-4 mr-4" onClick={() => setIsCodeExistsModalOpen(false)}>
                    Close
                  </button>
                  <button className="bg-[#e31d3b] text-white px-3 py-1 rounded-md mt-4" onClick={handleReplaceCode}>
                    Replace
                  </button>
                </div>
              </div>
            )}

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
                <div className="bg-gray-800 p-4 py-6 px-8 rounded-lg shadow-lg"> {/* Updated background color */}
                  <h2 className="text-white text-xl font-semibold mb-2">Congratulations 🎉</h2>
                  <p className="text-white">Code Saved Successfully!</p>
                  <button className="bg-[#e31d3b] text-white px-3 py-1 rounded-md mt-4" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Save Code Button */}
            <button className='bg-[#e31d3b] h-[4vh] text-white px-3 rounded-3xl ml-5 flex justify-center items-center gap-1 text-[11px] font-bold uppercase' onClick={handleSaveCodeLocally}>
              <FaSave/> Save Code
            </button>

            {/* Download Code Button */}
            <button className='bg-[#e31d3b] h-[4vh] text-white px-3 rounded-3xl ml-5 flex justify-center items-center gap-1 text-[11px] font-bold uppercase' onClick={handleDownloadCode}>
              <FaDownload/> Download 
            </button>

            {isViewCodeModalOpen && (
              <div className="fixed top-32 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50 hide-scrollbar">
                <div className="bg-gray-800 p-4 py-6 px-8 rounded-lg shadow-lg flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-xl font-semibold">List of Saved Codes</h2>
                    <button className="bg-[#e31d3b] text-white px-3 py-1 rounded-md" onClick={onCloseViewCode}>
                      <IoClose/>
                    </button>
                  </div>
                  <ul className="text-white max-h-[50vh] overflow-y-auto hide-scrollbar">
                    {Object.entries(savedCodes).map(([fileName, { language, code }], index) => (
                      <li key={fileName}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white">{index + 1}</span>
                          <h3 className="text-white">{fileName}</h3>
                          <div>
                            <button className="bg-[#e31d3b] text-white px-2 py-1 rounded-md mr-2" onClick={()=>{handleViewCode(fileName)}}>
                              View Code
                            </button>
                            <button className="bg-red-500 text-white px-2 py-1 rounded-md" onClick={()=>{handleDeleteCode(fileName)}}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}






            {/* View Codes Button */}
            <button className='bg-[#e31d3b] h-[4vh] text-white px-3 rounded-3xl ml-5 flex justify-center items-center gap-1 text-[11px] font-bold uppercase' onClick={onOpenViewCode}>
              <FiEye/> View Codes
            </button>
          </div>
        </nav>

        <div className='flex'>
          <Editor
            height="94.1vh"
            width="70vw"
            defaultLanguage={selectedLanguage} // Use the selected language
            defaultValue="// some comment"
            onMount={handleEditorDidMount}
            theme={selectedTheme} // Use the selected theme
            options={{
              fontSize: fontSize, // Use the selected font size
              fontFamily: 'Fira Code',
              minimap: {
                enabled: true
              }
            }}
          />

          {/* INPUT and OUTPUT CONTAINER */}
          <div className="flex flex-col w-[30vw] ml-4">
            {/* INPUT */}
            <div className="h-[47vh] bg-[#272727]  rounded-md">
              {/* INPUT HEADER */}
              <div className="h-[10%] pl-5 bg-[#303030] flex items-center justify-between">
                <h3 className="text-white text-lg font-medium">Input</h3>
                <div className='flex'>
                  {/* Clear Button */}
                  <button className='hover:bg-[#272727] border border-opacity-30 border-white h-[4vh] text-white px-3 rounded-3xl ml-5 flex justify-center items-center gap-1 text-[11px] font-bold uppercase' onClick={()=>inputRef.current.value = ""}>  
                    Clear
                  </button>

                  {/** Download Button */}
                  <button className='hover:bg-[#272727] border border-opacity-30 border-white h-[4vh] text-white px-3 rounded-3xl ml-3 flex justify-center items-center gap-1 text-[11px] font-bold uppercase' onClick={handleDownloadInput}>
                    <FaDownload/> Download
                  </button>

                  {/* Choose Media Icon in Button */}
                  <button className='hover:bg-[#272727] border border-opacity-30 border-white h-[4vh] mr-5 text-white px-3 rounded-3xl ml-3 flex justify-center items-center gap-1 text-[11px] font-bold uppercase'>
                    <label htmlFor="fileUploader" className='cursor-pointer flex items-center gap-[2px] justify-center'><AiOutlineFile/> Read File</label>
                  </button>
                  <input id='fileUploader' className='hidden' type="file" accept=".txt" onChange={readFromFile} />
                </div>
              </div>

              {/* INPUT BODY */}
              <div className="h-[90%] p-5">
                <textarea className="w-full h-full outline-none resize-none text-white bg-[#272727] text-lg" placeholder="Enter your input here..." ref={inputRef}></textarea>
              </div>
            </div>

            {/* OUTPUT */}
            <div className="h-[47vh] bg-[#272727]  rounded-md">
              {/* OUTPUT HEADER */}
              <div className="h-[10%] pl-5 bg-[#303030] flex items-center justify-between">
                <h3 className="text-white text-lg font-medium">Output</h3>

                <div className='flex '>
                  {/* Clear Button */}
                  <button className='hover:bg-[#272727] border border-opacity-30 border-white h-[4vh] text-white px-3 rounded-3xl ml-5 flex justify-center items-center gap-1 text-[11px] font-bold uppercase' onClick={() => setOutput('')}>
                    Clear
                  </button>

                  {/** Download Button */}
                  <button className='hover:bg-[#272727] border border-opacity-30 border-white h-[4vh] mr-5 text-white px-3 rounded-3xl ml-3 flex justify-center items-center gap-1 text-[11px] font-bold uppercase' onClick={handleDownloadOutput}>
                    <FaDownload/> Download
                  </button>
                </div>
              </div>

              {/* OUTPUT BODY */}
              <div className="h-[90%] p-5">
                <textarea className="w-full h-full outline-none resize-none text-white bg-[#272727] text-lg cursor-default" readOnly value={output}></textarea>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

export default App;