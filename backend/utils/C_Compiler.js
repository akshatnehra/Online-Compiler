const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function compileAndRunCode(code, input) {
  
  // Create a temporary C file name using the current time in milliseconds
  const name = Date.now();

  // Create a temporary C file
  const cScriptPath = path.join(__dirname, name + '.c');
  const outFilePath = path.join(__dirname, name+"");

  try {
    await fs.writeFile(cScriptPath, code);


    const compileCommand = `gcc ${cScriptPath} -o ${outFilePath}`;
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

    // If windows, delete the temporary executable file
    if (process.platform === 'win32') {
      await fs.unlink(outFilePath + '.exe');
    } else {
      await fs.unlink(outFilePath);
    }

    console.log("Finished compiling C code");
    console.log("Output: " + output);
    
    return output;
  } catch (err) {

    // Delete the temporary C file
    await fs.unlink(cScriptPath);

    // // If windows, delete the temporary executable file
    // if (process.platform === 'win32') {
    //   // Check if the file exists before deleting it
    //   if(fs.existsSync(outFilePath + '.exe'))
    //     await fs.unlink(outFilePath + '.exe');
    // } else {
    //   // Check if the file exists before deleting it
    //   if(fs.existsSync(outFilePath))
    //     await fs.unlink(outFilePath);
    // }
    
    return err;
    throw err;
  }
}

// // Example usage for C:
// (async () => {
//   try {
//     const userCode = `
// #include <stdio.h>
// int main() {
//     char name[100];
//     printf("Enter your name: ");
//     scanf("%s", name);
//     printf("Hello, %s\\n", name);

//     scanf("%s", name);
//     printf("Hello, %s\\n", name);

//     scanf("%s", name);
//     printf("Hello, %s\\n", name);
//     return 0;
// }
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
module.exports.compileC = compileAndRunCode;