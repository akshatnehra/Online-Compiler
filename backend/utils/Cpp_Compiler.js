const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function compileAndRunCode(code, input, timeoutMilliseconds, tempDirPath) {
  try {
    // Create a temporary C++ file
    const cppScriptPath = path.join(tempDirPath, 'main.cpp');
    const outFilePath = path.join(tempDirPath, 'main');

    await fs.writeFile(cppScriptPath, code);

    const compileCommand = `g++ ${cppScriptPath} -o ${outFilePath}`;
    const executionCommand = `${outFilePath}`;

    await new Promise((resolve, reject) => {
      exec(compileCommand, (compileError) => {
        if (compileError) {
          const formattedError = formatCompilationError(compileError, cppScriptPath);
          reject(formattedError);
        } else {
          resolve();
        }
      });
    });

    const output = await new Promise((resolve, reject) => {
      const child = exec(executionCommand, (error, stdout, stderr) => {
        if (error) {
          reject(stderr.trim());
        } else {
          resolve(stdout);
        }
      });

      // Send the input to the child process's stdin
      child.stdin.write(input);
      child.stdin.end();

      // Set a timeout for the C++ script execution
      const timeout = setTimeout(() => {
        child.kill(); // Terminate the C++ script
        reject("Time Limit Exceeded!");
      }, timeoutMilliseconds);

      child.on("exit", () => {
        clearTimeout(timeout); // Clear the timeout when the script exits
      });

    });

    // Delete the temporary C++ file
    await fs.unlink(cppScriptPath);

    // If Windows, delete the temporary executable file
    if (process.platform === 'win32') {
      const exePath = outFilePath + '.exe';
      if (await fileExists(exePath)) {
        await fs.unlink(exePath);
      }
    } else {
      if (await fileExists(outFilePath)) {
        await fs.unlink(outFilePath);
      }
    }

    return output;
  } catch (err) {
    // Handle errors and cleanup here
    return handleErrors(err, tempDirPath);
  }
}

async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

async function handleErrors(err, tempDirPath) {

  if (err === "Time Limit Exceeded!") {
    return err;
  }

  // Handle other errors, such as compilation errors
  const lines = err.split('\n');
  lines.shift(); // Remove the first line of the error message
  const errorMessage = lines.join('\n');
  return errorMessage;
}

function formatCompilationError(error, cScriptPath) {
  let formattedError = String(error).replace(new RegExp(escapeRegExp(cScriptPath), 'g'), 'Line');

  // Remove the first line of the error message
  const lines = formattedError.split('\n');
  lines.shift();
  formattedError = lines.join('\n');

  return formattedError;
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

// Export the compileAndRunCode function
module.exports.compileCpp = compileAndRunCode;
