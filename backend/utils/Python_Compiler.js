const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function compileAndRunCode(code, input) {

  // Create a temporary Python file name using the current time in milliseconds
    const name = Date.now();

  // Create a temporary Python file
  const pythonScriptPath = path.join(__dirname, name + '.py');

  try {
    await fs.writeFile(pythonScriptPath, code);

    const executionCommand = `python ${pythonScriptPath}`;

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
    
    // Delete the temporary Python file
    await fs.unlink(pythonScriptPath);

    return output;
  } catch (err) {
    // Delete the temporary Python file
    await fs.unlink(pythonScriptPath);
    throw err;
  }
}

// // Example usage for Python:
// (async () => {
//   try {
//     const userCode = `
// name = input("Enter your name: ")
// print("Hello, " + name)

// name = input("Enter your name: ")
// print("Hello, " + name)

// name = input("Enter your name: ")
// print("Hello, " + name)
// `;

//     const savedInput = `John
// Wick
// Alice`;

//     console.log('Saved Input:');
//     console.log(savedInput);

//     const output = await compileAndRunCode(userCode, savedInput);
//     console.log('Output:', output);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// })();

// Export the compileAndRunCode function
module.exports.compilePython = compileAndRunCode;