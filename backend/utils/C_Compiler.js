const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function compileAndRunCode(code, input, tempDir, timeout) {
  // Create a temporary C file name using the current time in milliseconds
  const name = Date.now();

  // Create a temporary C file inside the provided temp directory
  const cScriptPath = path.join(tempDir, `${name}.c`);
  const outFilePath = path.join(tempDir, `${name}`);

  // Create a variable to hold the child process
  let childProcess;

  try {
    await fs.writeFile(cScriptPath, code);

    const compileCommand = `gcc ${cScriptPath} -o ${outFilePath}`;
    const executionCommand = `${outFilePath}`;

    await new Promise((resolve, reject) => {
      exec(compileCommand, (compileError) => {
        if (compileError) {
          const formattedError = formatCompilationError(compileError, cScriptPath);
          reject(formattedError);
        } else {
          resolve();
        }
      });
    });

    const output = await new Promise((resolve, reject) => {
      childProcess = exec(executionCommand, (error, stdout, stderr) => {
        if (error) {
          reject(stderr.trim());
        } else {
          resolve(stdout);
        }
      });

      // Send the input to the child process's stdin
      childProcess.stdin.write(input);
      childProcess.stdin.end();

      // Set a timeout for the child process (e.g., 5 seconds)
      const timeoutHandle = setTimeout(() => {
        childProcess.kill(); // Terminate the child process
        reject('Time Limit Exceeded');
      }, timeout); // Adjust the timeout duration as needed

      // Handle the child process's exit event
      childProcess.on('exit', () => {
        clearTimeout(timeoutHandle); // Clear the timeout
      });
    });

    return output;
  } catch (err) {
    console.error('Error during code execution:', err);
    return err;
  } finally {
    // Ensure that the child process is terminated before continuing
    if (childProcess) {
      console.log('====================================');
      console.log('Killing child process');
      console.log('====================================');
      await childProcess.kill('SIGKILL');
    }

  }
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

module.exports.compileC = compileAndRunCode;
