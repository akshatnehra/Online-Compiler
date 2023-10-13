const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function compileAndRunCode(code, input, timeoutMilliseconds) {
  // Create a temporary folder name using the current time in milliseconds
  const name = Date.now();

  // Create a temporary folder
  const folderPath = path.join(__dirname, name + '');
  await fs.mkdir(folderPath);

  // Create a temporary Java file inside the temporary folder 
  const javaScriptPath = path.join(folderPath, 'Main.java');
  const javaClassPath = path.join(folderPath, 'Main.class');

  try {
    await fs.writeFile(javaScriptPath, code);

    const compileCommand = `javac ${javaScriptPath}`;
    const executionCommand = `java -cp ${folderPath} Main`;

    await new Promise((resolve, reject) => {
      exec(compileCommand, (compileError) => {
        if (compileError) {
          const formattedError = formatCompilationError(compileError, javaScriptPath);
          reject(formattedError);
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

      // Set a timeout for the Java script execution
      const timeout = setTimeout(() => {
        child.kill(); // Terminate the Java script
        reject("Time Limit Exceeded!");
      }, timeoutMilliseconds);

      child.on("exit", () => {
        clearTimeout(timeout); // Clear the timeout when the script exits
      });
    });

    // Delete the temporary folder
    await fs.rm(folderPath, { recursive: true });

    return output;
  } catch (err) {
    // Delete the temporary folder
    await fs.rm(folderPath, { recursive: true });

    if (err == "Time Limit Exceeded!") {
      return err;
    }

    // Remove the first line of the error message
    const lines = err.split('\n');
    lines.shift();
    err = lines.join('\n');

    console.log(err);
    return err;
    throw err;
  }
}

function formatCompilationError(error, cScriptPath) {
  let formattedError = String(error).replace(new RegExp(escapeRegExp(cScriptPath), 'g'), 'Line');

  // Remove first line of error message
  const lines = formattedError.split('\n');
  lines.shift();
  formattedError = lines.join('\n');
  
  return formattedError;
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

// Export the compileAndRunCode function
module.exports.compileJava = compileAndRunCode;

// Example usage with a 5-second timeout:
// const timeoutMilliseconds = 5000;
// const output = await compileAndRunCode(userCode, savedInput, timeoutMilliseconds);

// Export the compileAndRunCode function
module.exports.compileJava = compileAndRunCode;
