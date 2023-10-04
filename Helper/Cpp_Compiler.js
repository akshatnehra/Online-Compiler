const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function compileAndRunCode(code, language, input) {
  if (language !== 'cpp') {
    throw new Error('Unsupported language: ' + language);
  }

  // Create a temporary C++ file
  const cppScriptPath = path.join(__dirname, 'temp.cpp');

  try {
    await fs.writeFile(cppScriptPath, code);

    const outFilePath = path.join(__dirname, 'temp');

    const compileCommand = `g++ ${cppScriptPath} -o ${outFilePath}`;
    const executionCommand = `${outFilePath}`;

    await new Promise((resolve, reject) => {
      exec(compileCommand, (compileError) => {
        if (compileError) {
          reject('Compilation error: ' + compileError);
        } else {
          resolve();
        }
      });
    });

    const output = await new Promise((resolve, reject) => {
      const child = exec(executionCommand, (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      });

      // Send the input to the child process's stdin
      child.stdin.write(input);
      child.stdin.end();
    });

    return output;
  } catch (err) {
    throw err;
  }
}

// Example usage for C++:
(async () => {
  try {
    const userCode = `
#include <iostream>
using namespace std;

int main() {
    string name;
    cout << "Enter your name: ";
    cin >> name;
    cout << "Hello, " << name << endl;

    cin >> name;
    cout << "Hello, " << name << endl;

    cin >> name;
    cout << "Hello, " << name << endl;
    return 0;
}
`;

    const language = 'cpp';

    const savedInput = `John
Wick
Alice`;

    console.log('Saved Input:');
    console.log(savedInput);

    const output = await compileAndRunCode(userCode, language, savedInput);
    console.log('Output:', output);
  } catch (error) {
    console.error('Error:', error);
  }
})();
