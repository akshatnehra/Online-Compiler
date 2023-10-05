import React, { useRef, useState, useEffect } from 'react';
import { FaPlay } from 'react-icons/fa';
import defaultCodes from './utils/defaultCodes';
import Editor from '@monaco-editor/react';

function App() {
  const editorRef = useRef(null);
  const [fontSize, setFontSize] = useState(20); // Initialize with default font size
  const [selectedTheme, setSelectedTheme] = useState('vs-dark'); // Initialize with the default theme
  const [selectedLanguage, setSelectedLanguage] = useState('cpp'); // Initialize with the default language

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

  return (
    <>
      <main className='bg-[#1e1e1e]'>
        <nav className='h-[6vh] w-full flex items-center bg-[#1e1e1e] py-[2vh]'>
          <button className='bg-[#e31d3b] h-[4vh] text-white px-3 rounded-3xl ml-5 flex justify-center items-center gap-1 text-[11px] font-bold uppercase'>
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
                <textarea className="w-full h-full outline-none resize-none text-white bg-[#272727] text-lg" placeholder="Enter your input here..."></textarea>
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
                <textarea className="w-full h-full outline-none resize-none text-white bg-[#272727] text-lg pointer-events-none" tabindex="-1"></textarea>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

export default App;