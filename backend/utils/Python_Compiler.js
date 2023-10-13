const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function compileAndRunCode(code, input, timeoutMilliseconds) {
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

      // Set a timeout for the Python script execution
      const timeout = setTimeout(() => {
        child.kill(); // Terminate the Python script
        reject("Time Limit Exceeded!");
      }, timeoutMilliseconds);

      child.on("exit", () => {
        clearTimeout(timeout); // Clear the timeout when the script exits
      });
    });

    // Delete the temporary Python file
    await fs.unlink(pythonScriptPath);

    return output;
  } catch (err) {
    // Delete the temporary Python file
    await fs.unlink(pythonScriptPath);

    if(err == "Time Limit Exceeded!") {
      return err;
    }

    // Remove first line of error message
    const lines = err.split('\n');
    lines.shift();
    err = lines.join('\n');

    console.log(err);
    return err;
    throw err;
  }
}

// Example usage with a 5-second timeout:
// const timeoutMilliseconds = 5000;
// const output = await compileAndRunCode(userCode, savedInput, timeoutMilliseconds);

// Export the compileAndRunCode function
module.exports.compilePython = compileAndRunCode;
