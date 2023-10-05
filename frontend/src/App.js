import React, { useRef, useState, useEffect } from 'react';
import { FaPlay } from 'react-icons/fa';
import defaultCodes from './utils/defaultCodes';
import Editor from '@monaco-editor/react';

function App() {
  const editorRef = useRef(null);
  const inputRef = useRef(null);
  const [fontSize, setFontSize] = useState(20); // Initialize with default font size
  const [selectedTheme, setSelectedTheme] = useState('vs-dark'); // Initialize with the default theme
  const [selectedLanguage, setSelectedLanguage] = useState('cpp'); // Initialize with the default language
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  // Use the default code snippet based on the selected language
  const defaultCode = defaultCodes[selectedLanguage] || '';

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    editorRef.current.setValue(defaultCode);
  }

  function showValue() {
    alert(editorRef.current.getValue());
  }

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

  const handleThemeChange = (event) => {
    setSelectedTheme(event.target.value);
  };

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

  const handleRunClick = async () => {
    // Set loading to true when the request is initiated
    setLoading(true);
  
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
        <nav className='h-[6vh] w-full flex items-center bg-[#1e1e1e] py-[2vh]'>
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
          <div className="flex flex-col w-[30vw] ml-5">
            {/* INPUT */}
            <div className="h-[47vh] bg-[#272727]  rounded-md">
              {/* INPUT HEADER */}
              <div className="h-[10%] pl-5 bg-[#303030] flex items-center">
                <h3 className="text-white text-lg font-medium">Input</h3>
              </div>

              {/* INPUT BODY */}
              <div className="h-[90%] p-5">
                <textarea className="w-full h-full outline-none resize-none text-white bg-[#272727] text-lg" placeholder="Enter your input here..." ref={inputRef}></textarea>
              </div>
            </div>

            {/* OUTPUT */}
            <div className="h-[47vh] bg-[#272727]  rounded-md">
              {/* OUTPUT HEADER */}
              <div className="h-[10%] pl-5 bg-[#303030] flex items-center">
                <h3 className="text-white text-lg font-medium">Output</h3>
              </div>

              {/* INPUT BODY */}
              <div className="h-[90%] p-5">
                <textarea className="w-full h-full outline-none resize-none text-white bg-[#272727] text-lg pointer-events-none" tabindex="-1" value={output}></textarea>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

export default App;