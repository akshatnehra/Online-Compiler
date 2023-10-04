const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function compileAndRunCode(code, language, input) {
  if (language !== 'java') {
    throw new Error('Unsupported language: ' + language);
  }

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

    // Delete the temporary folder
    await fs.rm(folderPath, { recursive: true });

    return output;
  } catch (err) {

    // Delete the temporary folder
    await fs.rm(folderPath, { recursive: true });
    
    throw err;
  }
}

// Example usage for Java:
(async () => {
  try {
    const userCode = `
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String name = scanner.nextLine();
        System.out.println("Hello, " + name);

        name = scanner.nextLine();
        System.out.println("Hello, " + name);

        name = scanner.nextLine();
        System.out.println("Hello, " + name);
    }
}
`;

    const language = 'java';

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
