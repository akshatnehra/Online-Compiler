const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function compileAndRunCode(code, input) {
  // Create a temporary C file name using the current time in milliseconds
  const name = Date.now();

  // Create a temporary C file
  const cScriptPath = path.join(__dirname, `${name}.c`);
  const outFilePath = path.join(__dirname, `${name}`);

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
    });

    // Delete the temporary C file
    await fs.unlink(cScriptPath);

    // If Windows, delete the temporary executable file
    if (process.platform === 'win32') {
      await fs.unlink(`${outFilePath}.exe`);
    } else {
      await fs.unlink(outFilePath);
    }

    console.log("Finished compiling C code");
    console.log("Output: " + output);

    return output;
  } catch (err) {
    // Delete the temporary C file
    await fs.unlink(cScriptPath);

    return err;
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

module.exports.compileC = compileAndRunCode;
